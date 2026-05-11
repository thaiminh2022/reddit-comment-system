"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ActionResState,
  createErrorResponse,
  createSuccessResponse,
} from "@/types/error_handler";
import { FullComment, Post, PostInsertSchema, User } from "@/types/posts";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

type PostAndUser = Post & User;

export async function fetchPosts() {
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

  const posts = data as PostAndUser[];
  return createSuccessResponse(posts);
}

export async function fetchPost(uuid: string): Promise<any | null> {
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
    return null;
  }

  return {
    ...data,
    created_at: new Date(data.created_at),
  };
}

export async function fetchComments(postID: string): Promise<FullComment[]> {
  const supabase = await createClient();

  // Fetch all comments for this post
  const { data: comments, error } = await supabase
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
    return [];
  }

  // Build comment tree
  const commentMap = new Map<string, FullComment>();
  const rootComments: FullComment[] = [];

  // Initialize map with comments and empty replies array
  comments.forEach((c: any) => {
    commentMap.set(c.id, {
      ...c,
      created_at: new Date(c.created_at),
      replies: [],
    });
  });

  // Link children to parents
  commentMap.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export async function fetchUserData(uuid: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uuid)
    .single();

  if (error) {
    console.error(`Error fetching user data ${uuid}:`, error);
    return null;
  }

  return data as User;
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
