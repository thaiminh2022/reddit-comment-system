import { FullComment, Post, User } from "@/types/posts";
import { createClient } from "@/lib/supabase/server";

export async function fetchPosts(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data.map(p => ({
    ...p,
    created_at: new Date(p.created_at)
  }));
}

export async function fetchPost(uuid: string): Promise<any | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name)
    `)
    .eq("id", uuid)
    .single();

  if (error) {
    console.error(`Error fetching post ${uuid}:`, error);
    return null;
  }

  return {
    ...data,
    created_at: new Date(data.created_at)
  };
}

export async function fetchComments(postID: string): Promise<FullComment[]> {
  const supabase = await createClient();
  
  // Fetch all comments for this post
  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      author:profiles!comments_author_id_fkey(id, name)
    `)
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
      replies: [] 
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
