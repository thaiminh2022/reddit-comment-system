"use server";

import { createClient } from "@/lib/supabase/server";
import type { PostSort } from "@/lib/posts/sort";
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
import { CommentSort } from "../comments/sort";

type CommentJoinAuthorAndVote = CommentJoinAuthor & {
  user_vote?: { value: -1 | 1 }[] | null;
};

type PostCursor = {
  id: string;
  created_at: string;
  score: number;
  total_comment_count: number;
};

type CommentQuery<T> = {
  order: (column: string, options: { ascending: boolean }) => T;
  gte: (column: string, value: string) => T;
};

const COMMENT_WITH_AUTHOR_AND_VOTE_SELECT = `
  *,
  author:profiles!comments_author_id_fkey(id, name),
  user_vote:comment_votes(value)
`;

function encodeCursor(data: PostCursor): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function decodeCursor(cursor: string): PostCursor | null {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function fetchPostJoinAuthorRows(
  cursor?: string,
  pageSize: number = 10,
  sort: PostSort = "newest",
  search?: string,
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
    .limit(pageSize + 1);

  if (search) {
    // Fallback to ilike if generated columns are not set up
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // Time filters for Top sorts
  if (sort === "top-past-year") {
    query = query.gte("created_at", getIsoDateMonthsAgo(12));
  } else if (sort === "top-past-month") {
    query = query.gte("created_at", getIsoDateMonthsAgo(1));
  }

  // Sorting and Cursor logic
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
    if (decoded) {
      query = query.or(`created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`);
    }
  } else if (sort === "hot") {
    query = query
      .order("total_comment_count", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    
    if (decoded) {
      query = query.or(
        `total_comment_count.lt.${decoded.total_comment_count},` +
        `and(total_comment_count.eq.${decoded.total_comment_count},score.lt.${decoded.score}),` +
        `and(total_comment_count.eq.${decoded.total_comment_count},score.eq.${decoded.score},created_at.lt.${decoded.created_at}),` +
        `and(total_comment_count.eq.${decoded.total_comment_count},score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
      );
    }
  } else if (sort.startsWith("top-")) {
    query = query
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (decoded) {
      query = query.or(
        `score.lt.${decoded.score},` +
        `and(score.eq.${decoded.score},created_at.lt.${decoded.created_at}),` +
        `and(score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    return createErrorResponse(error.message, error);
  }

  const posts = (data as PostJoinAuthor[]).map((row) => ({
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
      created_at: lastPost.created_at.toISOString(),
      score: lastPost.score,
      total_comment_count: lastPost.total_comment_count
    });
  }

  return createSuccessResponse({
    posts: resultPosts,
    nextCursor,
    pageSize,
  });
}

function getIsoDateMonthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
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

type CommentCursor = {
  id: string;
  created_at: string;
  score: number;
  reply_count: number;
};

function encodeCommentCursor(data: CommentCursor): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function decodeCommentCursor(cursor: string): CommentCursor | null {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function fetchComments(
  postID: string, 
  sort: CommentSort,
  cursor?: string,
  pageSize: number = 20
) {
  const supabase = await createClient();
  const decoded = cursor ? decodeCommentCursor(cursor) : null;

  // 1. Fetch root comments with pagination
  let rootQuery = supabase
    .from("comments")
    .select(COMMENT_WITH_AUTHOR_AND_VOTE_SELECT)
    .eq("post_id", postID)
    .is("parent_id", null)
    .limit(pageSize + 1);

  // Apply cursor logic to root comments
  if (sort === "newest") {
    rootQuery = rootQuery.order("created_at", { ascending: false }).order("id", { ascending: false });
    if (decoded) {
      rootQuery = rootQuery.or(`created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`);
    }
  } else if (sort === "hot") {
    rootQuery = rootQuery
      .order("reply_count", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    
    if (decoded) {
      rootQuery = rootQuery.or(
        `reply_count.lt.${decoded.reply_count},` +
        `and(reply_count.eq.${decoded.reply_count},score.lt.${decoded.score}),` +
        `and(reply_count.eq.${decoded.reply_count},score.eq.${decoded.score},created_at.lt.${decoded.created_at}),` +
        `and(reply_count.eq.${decoded.reply_count},score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
      );
    }
  } else { // Top sorts
    rootQuery = rootQuery
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (decoded) {
      rootQuery = rootQuery.or(
        `score.lt.${decoded.score},` +
        `and(score.eq.${decoded.score},created_at.lt.${decoded.created_at}),` +
        `and(score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
      );
    }
  }

  // Time filters for Top sorts
  if (sort === "top-past-year") {
    rootQuery = rootQuery.gte("created_at", getIsoDateMonthsAgo(12));
  } else if (sort === "top-past-month") {
    rootQuery = rootQuery.gte("created_at", getIsoDateMonthsAgo(1));
  }

  const { data: rootRows, error: rootError } = await rootQuery;

  if (rootError) {
    console.error(`Error fetching root comments for post ${postID}:`, rootError);
    return createErrorResponse(rootError.message, rootError);
  }

  const rootsRaw = rootRows as CommentJoinAuthorAndVote[];
  const hasNextPage = rootsRaw.length > pageSize;
  const rootsToProcess = hasNextPage ? rootsRaw.slice(0, pageSize) : rootsRaw;
  const rootIds = rootsToProcess.map(r => r.id);

  // 2. Fetch level 2 comments (children of these roots)
  let level2Rows: CommentJoinAuthorAndVote[] = [];
  if (rootIds.length > 0) {
    let level2Query = supabase
      .from("comments")
      .select(COMMENT_WITH_AUTHOR_AND_VOTE_SELECT)
      .in("parent_id", rootIds);

    // Sort level 2 comments same as roots for consistency
    const { data: l2Data, error: l2Error } = await applyCommentSort(
      level2Query,
      sort,
    );
    
    if (!l2Error) {
      level2Rows = l2Data as CommentJoinAuthorAndVote[];
    }
  }

  const commentMap = new Map<string, Comment>();
  const rootComments: CommentRoot[] = [];

  // Create root objects
  for (const row of rootsToProcess) {
    const comment = mapCommentRowToComment(row);
    commentMap.set(row.id, comment);
    rootComments.push(comment);
  }

  // Create level 2 objects and attach to roots
  for (const row of level2Rows) {
    const comment = mapCommentRowToComment(row);
    commentMap.set(row.id, comment);
    
    const parent = commentMap.get(row.parent_id!);
    if (parent) {
      parent.replies.push(comment);
      comment.has_more = row.reply_count > 0;
    }
  }

  // Final check for has_more on roots
  for (const root of rootComments) {
    // Root's children we fetched are level 2. 
    // We fetched ALL level 2 children for these roots.
    // So root.replies contains all immediate children.
    root.has_more = false; 
  }

  let nextCursor: string | null = null;
  if (hasNextPage) {
    const lastRoot = rootsToProcess[rootsToProcess.length - 1];
    nextCursor = encodeCommentCursor({
      id: lastRoot.id,
      created_at: lastRoot.created_at,
      score: lastRoot.score,
      reply_count: lastRoot.reply_count
    });
  }

  return createSuccessResponse({
    comments: rootComments,
    nextCursor,
  });
}

export async function fetchSubComments(
  parentId: string,
  sort: CommentSort,
  cursor?: string,
  pageSize: number = 10
) {
  const supabase = await createClient();
  const decoded = cursor ? decodeCommentCursor(cursor) : null;

  let query = supabase
    .from("comments")
    .select(COMMENT_WITH_AUTHOR_AND_VOTE_SELECT)
    .eq("parent_id", parentId)
    .limit(pageSize + 1);

  // Apply cursor logic
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
    if (decoded) {
      query = query.or(`created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`);
    }
  } else if (sort === "hot") {
    query = query
      .order("reply_count", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    
    if (decoded) {
      query = query.or(
        `reply_count.lt.${decoded.reply_count},` +
        `and(reply_count.eq.${decoded.reply_count},score.lt.${decoded.score}),` +
        `and(reply_count.eq.${decoded.reply_count},score.eq.${decoded.score},created_at.lt.${decoded.created_at}),` +
        `and(reply_count.eq.${decoded.reply_count},score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
      );
    }
  } else {
    query = query
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (decoded) {
      query = query.or(
        `score.lt.${decoded.score},` +
        `and(score.eq.${decoded.score},created_at.lt.${decoded.created_at}),` +
        `and(score.eq.${decoded.score},created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching sub-comments for ${parentId}:`, error);
    return createErrorResponse(error.message, error);
  }

  const rows = data as CommentJoinAuthorAndVote[];
  const hasNextPage = rows.length > pageSize;
  const resultRows = hasNextPage ? rows.slice(0, pageSize) : rows;
  
  const comments = resultRows.map(mapCommentRowToComment);

  let nextCursor: string | null = null;
  if (hasNextPage) {
    const lastComment = resultRows[resultRows.length - 1];
    nextCursor = encodeCommentCursor({
      id: lastComment.id,
      created_at: lastComment.created_at,
      score: lastComment.score,
      reply_count: lastComment.reply_count
    });
  }

  return createSuccessResponse({
    comments,
    nextCursor
  });
}

export async function searchComments(postID: string, search: string, sort: CommentSort) {
  const supabase = await createClient();

  const query = supabase
    .from("comments")
    .select(COMMENT_WITH_AUTHOR_AND_VOTE_SELECT)
    .eq("post_id", postID)
    .ilike("content", `%${search}%`);

  const { data, error } = await applyCommentSort(query, sort);

  if (error) {
    console.error(`Error searching comments in post ${postID}:`, error);
    return createErrorResponse(error.message, error);
  }

  const rows = data as CommentJoinAuthorAndVote[];
  const comments = rows.map((row) => ({
    ...mapCommentRowToComment(row),
    has_more: false,
  }));

  return createSuccessResponse(comments);
}

function mapCommentRowToComment(row: CommentJoinAuthorAndVote): Comment {
  return {
    id: row.id,
    parent_id: row.parent_id,
    author: row.author ?? {
      id: row.author_id ?? "deleted",
      name: "Deleted user",
    },
    content: row.content,
    created_at:
      row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    reply_count: row.reply_count,
    score: row.score,
    is_deleted: row.is_deleted,
    replies: [],
    has_more: row.reply_count > 0,
    vote_state: getCommentVoteStateFromRow(row),
  };
}

function applyCommentSort<T extends CommentQuery<T>>(
  query: T,
  sort: CommentSort,
) {
  if (sort === "top-past-year") {
    query = query.gte("created_at", getIsoDateMonthsAgo(12));
  } else if (sort === "top-past-month") {
    query = query.gte("created_at", getIsoDateMonthsAgo(1));
  }

  if (sort === "newest") {
    return query.order("created_at", { ascending: false });
  }

  if (sort === "hot") {
    return query
      .order("reply_count", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: false });
  }

  return query
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });
}

function getCommentVoteStateFromRow(
  row: CommentJoinAuthorAndVote,
): Comment["vote_state"] {
  const voteValue = row.user_vote?.[0]?.value;

  if (voteValue === 1) return "up";
  if (voteValue === -1) return "down";
  return "not-voted";
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

  // Normalize parentId: treat empty string or "null" as null
  const normalizedParentId = (parentId === "" || parentId === "null" || !parentId) ? null : parentId;
  const content = form.get("content")?.toString() || "";

  const commentInsert = CommentInsertSchema.safeParse({
    post_id: postId,
    parent_id: normalizedParentId,
    author_id: userRes.data.user.id,
    content: content,
  });

  if (!commentInsert.success) {
    console.error("Validation error creating comment:", {
      errors: commentInsert.error.issues,
      input: { 
        postId, 
        parentId, 
        normalizedParentId, 
        authorId: userRes.data.user.id,
        content 
      }
    });
    return createErrorResponse(
      commentInsert.error.message,
      commentInsert.error,
    );
  }

  if (normalizedParentId !== null) {
    const { data: parentComment, error: parentError } = await supabase
      .from("comments")
      .select("post_id")
      .eq("id", normalizedParentId)
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
