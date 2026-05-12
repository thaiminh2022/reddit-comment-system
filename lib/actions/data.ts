"use server";

import { createClient } from "@/lib/supabase/server";
import {
  CommentInsertSchema,
  CommentJoinAuthor,
  CommentVoteInsertSchema,
  PostInsertSchema,
  PostJoinAuthor,
  PostVoteInsertSchema,
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

export async function fetchPostJoinAuthorRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!posts_author_id_fkey(id, name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return createErrorResponse(error.message, error);
  }

  const posts = data as PostJoinAuthor[];
  return createSuccessResponse(posts);
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

  // Fetch all comments for this post
  const { data: commentsRes, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      author:profiles!comments_author_id_fkey(id, name)
    `,
    )
    .eq("post_id", postID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`Error fetching comments for post ${postID}:`, error);
    return createErrorResponse(error.message, error);
  }

  const rows = commentsRes as CommentJoinAuthor[];
  const commentMap = new Map<string, Comment>();
  const rootComments: CommentRoot[] = [];

  // First pass: create all comment objects
  for (const row of rows) {
    commentMap.set(row.id, {
      id: row.id,
      parent_id: row.parent_id,
      author: row.author ?? {
        id: row.author_id ?? "deleted",
        name: "Deleted user",
      },
      content: row.content,
      created_at:
        row.created_at instanceof Date
          ? row.created_at
          : new Date(row.created_at),
      reply_count: row.reply_count,
      score: row.score,
      is_deleted: row.is_deleted,
      replies: [],
    });
  }
  // Second pass: attach comments to their parents
  for (const row of rows) {
    const comment = commentMap.get(row.id);

    if (!comment) continue;

    if (row.parent_id === null) {
      rootComments.push(comment);
      continue;
    }

    const parent = commentMap.get(row.parent_id);

    if (!parent) {
      // Parent missing, so treat it as a root comment fallback
      rootComments.push(comment);
      continue;
    }

    parent.replies.push(comment);
  }

  return createSuccessResponse(rootComments);
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
    return createErrorResponse(commentInsert.error.message, commentInsert.error);
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

export async function votePost(postId: string, value: 1 | -1) {
  const { supabase, userId, error: authError } = await getAuthenticatedUserId();

  if (authError || !userId) {
    return createErrorResponse(authError?.message ?? "Unauthorized", authError);
  }

  const voteInsert = PostVoteInsertSchema.safeParse({
    post_id: postId,
    user_id: userId,
    value,
  });

  if (!voteInsert.success) {
    return createErrorResponse(voteInsert.error.message, voteInsert.error);
  }

  const { data: existingVote, error: fetchError } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return createErrorResponse(fetchError.message, fetchError);
  }

  const mutation =
    existingVote?.value === value
      ? supabase.from("post_votes").delete().match({ post_id: postId, user_id: userId })
      : supabase.from("post_votes").upsert(voteInsert.data);

  const { error } = await mutation;

  if (error) {
    return createErrorResponse(error.message, error);
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
  return createSuccessResponse(null);
}

export async function voteComment(
  postId: string,
  commentId: string,
  value: 1 | -1,
) {
  const { supabase, userId, error: authError } = await getAuthenticatedUserId();

  if (authError || !userId) {
    return createErrorResponse(authError?.message ?? "Unauthorized", authError);
  }

  const voteInsert = CommentVoteInsertSchema.safeParse({
    comment_id: commentId,
    user_id: userId,
    value,
  });

  if (!voteInsert.success) {
    return createErrorResponse(voteInsert.error.message, voteInsert.error);
  }

  const { data: existingVote, error: fetchError } = await supabase
    .from("comment_votes")
    .select("value")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return createErrorResponse(fetchError.message, fetchError);
  }

  const mutation =
    existingVote?.value === value
      ? supabase
          .from("comment_votes")
          .delete()
          .match({ comment_id: commentId, user_id: userId })
      : supabase.from("comment_votes").upsert(voteInsert.data);

  const { error } = await mutation;

  if (error) {
    return createErrorResponse(error.message, error);
  }

  revalidatePath(`/posts/${postId}`);
  return createSuccessResponse(null);
}
