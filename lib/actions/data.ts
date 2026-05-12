"use server";

import { createClient } from "@/lib/supabase/server";
import {
  CommentInsertSchema,
  CommentJoinAuthor,
  PostInsertSchema,
  PostJoinAuthor,
  UserRow,
} from "@/types/db_schema";
import {
  ActionResState,
  createErrorResponse,
  createSuccessResponse,
} from "@/types/error_handler";
import { Comment, CommentRoot } from "@/types/posts";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type SortOrder = "new" | "top";

function encodeCursor(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function decodeCursor(cursor: string): any {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
  } catch (e) {
    return null;
  }
}

export async function fetchPostJoinAuthorRows(
  cursor?: string,
  pageSize: number = 10,
  sort: SortOrder = "new",
) {
  const supabase = await createClient();
  const decoded = cursor ? decodeCursor(cursor) : null;

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!posts_author_id_fkey(id, name)
    `,
    )
    .limit(pageSize + 1); // Fetch one extra to check for next page

  if (sort === "new") {
    query = query.order("created_at", { ascending: false }).order("id", {
      ascending: false,
    });
    if (decoded) {
      // (created_at, id) < (decoded.created_at, decoded.id)
      query = query.or(
        `created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`,
      );
    }
  } else if (sort === "top") {
    query = query
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (decoded) {
      query = query.or(
        `score.lt.${decoded.score},and(score.eq.${decoded.score},created_at.lt.${decoded.created_at}),and(score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`,
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    return createErrorResponse(error.message, error);
  }

  const posts = (data as any[]).map((row) => ({
    ...row,
    created_at: new Date(row.created_at),
  })) as PostJoinAuthor[];

  const hasNextPage = posts.length > pageSize;
  const resultPosts = hasNextPage ? posts.slice(0, pageSize) : posts;

  let nextCursor: string | null = null;
  if (hasNextPage) {
    const lastPost = resultPosts[resultPosts.length - 1];
    nextCursor = encodeCursor({
      id: lastPost.id,
      created_at: lastPost.created_at,
      score: lastPost.score,
    });
  }

  return createSuccessResponse({
    posts: resultPosts,
    nextCursor,
    pageSize,
  });
}

export async function fetchPostJoinAuthorRow(uuid: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!posts_author_id_fkey(id, name)
    `,
    )
    .eq("id", uuid)
    .single();

  if (error) {
    console.error(`Error fetching post ${uuid}:`, error);
    return createErrorResponse(error.message, error);
  }

  const dataPost = data as PostJoinAuthor;

  return createSuccessResponse(dataPost);
}

export async function fetchComments(postID: string) {
  const supabase = await createClient();

  // Fetch only top-level (level 1) and second-level (level 2) comments
  // To do this efficiently in one query, we can fetch comments where parent_id is null
  // OR where parent_id is in the set of root comment IDs.
  // But a simpler approach for a "Reddit" style is to fetch root comments first,
  // then fetch children for those roots.
  
  // 1. Fetch root comments
  const { data: rootRows, error: rootError } = await supabase
    .from("comments")
    .select(`*, author:profiles!comments_author_id_fkey(id, name)`)
    .eq("post_id", postID)
    .is("parent_id", null)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true });

  if (rootError) {
    console.error(`Error fetching root comments for post ${postID}:`, rootError);
    return createErrorResponse(rootError.message, rootError);
  }

  const roots = rootRows as CommentJoinAuthor[];
  const rootIds = roots.map(r => r.id);

  // 2. Fetch level 2 comments (children of roots)
  let level2Rows: CommentJoinAuthor[] = [];
  if (rootIds.length > 0) {
    const { data: l2Data, error: l2Error } = await supabase
      .from("comments")
      .select(`*, author:profiles!comments_author_id_fkey(id, name)`)
      .in("parent_id", rootIds)
      .order("created_at", { ascending: true });
    
    if (!l2Error) {
      level2Rows = l2Data as CommentJoinAuthor[];
    }
  }

  const commentMap = new Map<string, Comment>();
  const rootComments: CommentRoot[] = [];

  // Helper to map row to Comment object
  const mapRowToComment = (row: CommentJoinAuthor): Comment => ({
    id: row.id,
    parent_id: row.parent_id,
    author: row.author ?? {
      id: row.author_id ?? "deleted",
      name: "Deleted user",
    },
    content: row.content,
    created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    reply_count: row.reply_count,
    score: row.score,
    is_deleted: row.is_deleted,
    replies: [],
    has_more: row.reply_count > 0 // Initially assume true if reply_count > 0
  });

  // Create root objects
  for (const row of roots) {
    const comment = mapRowToComment(row);
    commentMap.set(row.id, comment);
    rootComments.push(comment);
  }

  // Create level 2 objects and attach to roots
  for (const row of level2Rows) {
    const comment = mapRowToComment(row);
    commentMap.set(row.id, comment);
    
    const parent = commentMap.get(row.parent_id!);
    if (parent) {
      parent.replies.push(comment);
      // For level 2, we indicate there's more if reply_count > 0
      comment.has_more = row.reply_count > 0;
    }
  }

  // Final check: root comments also need has_more=false if we fetched their replies
  // Actually, root comments' replies are level 2. If a root has reply_count > 0, 
  // we already fetched some. We should only set has_more if there are replies NOT fetched.
  // In this logic, we fetched ALL direct children of roots. 
  // So root comments themselves don't have "more" direct children.
  for (const root of rootComments) {
    root.has_more = false; 
  }

  return createSuccessResponse(rootComments);
}

export async function fetchSubComments(parentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(`*, author:profiles!comments_author_id_fkey(id, name)`)
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`Error fetching sub-comments for ${parentId}:`, error);
    return createErrorResponse(error.message, error);
  }

  const rows = data as CommentJoinAuthor[];
  const comments = rows.map(row => ({
    id: row.id,
    parent_id: row.parent_id,
    author: row.author ?? {
      id: row.author_id ?? "deleted",
      name: "Deleted user",
    },
    content: row.content,
    created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    reply_count: row.reply_count,
    score: row.score,
    is_deleted: row.is_deleted,
    replies: [],
    has_more: row.reply_count > 0
  }));

  return createSuccessResponse(comments);
}

export async function fetchProfileRow(uuid: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uuid)
    .single();

  if (error) {
    console.error(`Error fetching user data ${uuid}:`, error);
    return createErrorResponse(error.message, error);
  }

  const user = data as UserRow;
  return createSuccessResponse(user);
}

export async function createPost(
  _: unknown,
  form: FormData,
): Promise<ActionResState<null, AuthError | PostgrestError | z.ZodError>> {
  const supabase = await createClient();
  const userRes = await supabase.auth.getUser();
  if (userRes.error) {
    console.error("Error fetching user:", userRes.error);
    return createErrorResponse(userRes.error.message, userRes.error);
  }
  const title = form.get("title");
  const content = form.get("content");
  const author_id = userRes.data.user.id;

  console.log("Creating post with data:", { title, content, author_id });

  const postInsert = PostInsertSchema.safeParse({
    title,
    content,
    author_id,
  });

  if (!postInsert.success) {
    console.error("Error creating post:", postInsert.error);
    return createErrorResponse(postInsert.error.message, postInsert.error);
  }

  const post = postInsert.data;
  const { error } = await supabase.from("posts").insert(post);

  if (error) {
    console.error("Error creating post:", error);
    return createErrorResponse(error.message, error);
  }

  revalidatePath("/posts");
  redirect("/posts");
  return createSuccessResponse(null);
}

export async function createComment(
  postId: string,
  parentId: string | null,
  form: FormData,
): Promise<ActionResState<null, AuthError | PostgrestError | z.ZodError>> {
  const supabase = await createClient();
  const userRes = await supabase.auth.getUser();

  if (userRes.error) {
    console.error("Error fetching user:", userRes.error);
    return createErrorResponse(userRes.error.message, userRes.error);
  }

  const commentInsert = CommentInsertSchema.safeParse({
    post_id: postId,
    parent_id: parentId,
    author_id: userRes.data.user.id,
    content: form.get("content"),
  });

  if (!commentInsert.success) {
    console.error("Error creating comment:", commentInsert.error);
    return createErrorResponse(
      commentInsert.error.message,
      commentInsert.error,
    );
  }

  if (parentId !== null) {
    const { data: parentComment, error: parentError } = await supabase
      .from("comments")
      .select("post_id")
      .eq("id", parentId)
      .single();

    if (parentError) {
      return createErrorResponse(parentError.message, parentError);
    }

    if (parentComment.post_id !== postId) {
      return createErrorResponse("Reply parent does not belong to this post.");
    }
  }

  const { error } = await supabase.from("comments").insert(commentInsert.data);

  if (error) {
    console.error("Error creating comment:", error);
    return createErrorResponse(error.message, error);
  }

  revalidatePath(`/posts/${postId}`);
  return createSuccessResponse(null);
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const userRes = await supabase.auth.getUser();

  if (userRes.error) {
    return {
      supabase,
      userId: null,
      error: userRes.error,
    };
  }

  return {
    supabase,
    userId: userRes.data.user.id,
    error: null,
  };
}
