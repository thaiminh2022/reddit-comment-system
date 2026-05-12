"use server";

import { createClient } from "@/lib/supabase/server";
import {
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
import { Comment, CommentRoot, Post } from "@/types/posts";
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
      parent: null,
      author: row.author ?? {
        id: row.author_id,
        name: "Unknown",
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
      const { parent, ...rootComment } = comment;
      rootComments.push(rootComment);
      continue;
    }

    const parent = commentMap.get(row.parent_id);

    if (!parent) {
      // Parent missing, so treat it as a root comment fallback
      const { parent: _, ...rootComment } = comment;
      rootComments.push(rootComment);
      continue;
    }

    comment.parent = parent;
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
): Promise<ActionResState<Post, AuthError | PostgrestError | z.ZodError>> {
  const supabase = await createClient();
  const userRes = await supabase.auth.getUser();
  if (userRes.error) {
    console.error("Error fetching user:", userRes.error);
    return createErrorResponse(userRes.error.message, userRes.error);
  }
  const title = form.get("title") as string;
  const content = form.get("content") as string;
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
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return createErrorResponse(error.message, error);
  }

  revalidatePath("/posts");
  redirect("/posts");
  return createSuccessResponse(data as Post);
}
