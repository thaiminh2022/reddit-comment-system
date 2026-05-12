"use server";

import {
  CommentVoteInsert,
  CommentVoteRow,
  PostVoteInsert,
  PostVoteRow,
} from "@/types/db_schema";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/error_handler";
import { createClient } from "../supabase/server";

// +1: upvote
// -1: downvote
// 0: no vote

export type VoteState = "up" | "down" | "not-voted";
export type CommentVoteStates = Record<string, VoteState>;

export async function getPostVoteState(post_id: string) {
  const userRes = await getUser();

  if (!userRes.is_success) {
    return userRes;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_votes")
    .select("*")
    .eq("user_id", userRes.data.id)
    .eq("post_id", post_id)
    .limit(1)
    .maybeSingle();

  if (error) {
    return createErrorResponse(error.message, error);
  }

  const postVote = data as PostVoteRow | null;
  if (postVote == null) {
    return createSuccessResponse<VoteState>("not-voted");
  }
  if (postVote.value == -1) {
    return createSuccessResponse<VoteState>("down");
  } else {
    return createSuccessResponse<VoteState>("up");
  }
}

export async function getCommentVoteState(commentId: string) {
  const userRes = await getUser();

  if (!userRes.is_success) {
    return userRes;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comment_votes")
    .select("*")
    .eq("user_id", userRes.data.id)
    .eq("comment_id", commentId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return createErrorResponse(error.message, error);
  }

  const commentVote = data as CommentVoteRow | null;
  if (commentVote == null) {
    return createSuccessResponse<VoteState>("not-voted");
  }
  if (commentVote.value == -1) {
    return createSuccessResponse<VoteState>("down");
  } else {
    return createSuccessResponse<VoteState>("up");
  }
}

export async function getCommentVoteStates(commentIds: string[]) {
  const userRes = await getUser();

  if (!userRes.is_success) {
    return userRes;
  }

  if (commentIds.length === 0) {
    return createSuccessResponse<CommentVoteStates>({});
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comment_votes")
    .select("comment_id, value")
    .eq("user_id", userRes.data.id)
    .in("comment_id", commentIds);

  if (error) {
    return createErrorResponse(error.message, error);
  }

  const voteStates: CommentVoteStates = {};
  for (const vote of data as Pick<CommentVoteRow, "comment_id" | "value">[]) {
    voteStates[vote.comment_id] = vote.value === -1 ? "down" : "up";
  }

  return createSuccessResponse(voteStates);
}

export async function setVotePost(postId: string, voteState: VoteState) {
  const userRes = await getUser();

  if (!userRes.is_success) {
    return createErrorResponse("You must be logged in to vote");
  }

  const supabase = await createClient();

  if (voteState === "not-voted") {
    const { error } = await supabase
      .from("post_votes")
      .delete()
      .eq("user_id", userRes.data.id)
      .eq("post_id", postId);

    if (error) {
      return createErrorResponse(error.message, error);
    }

    return createSuccessResponse(null);
  }

  const value = voteState === "up" ? 1 : -1;

  const postVote: PostVoteInsert = {
    value,
    user_id: userRes.data.id,
    post_id: postId,
  };

  const { data, error } = await supabase
    .from("post_votes")
    .upsert(postVote, {
      onConflict: "user_id,post_id",
    })
    .select()
    .single();

  if (error) {
    return createErrorResponse(error.message, error);
  }

  return createSuccessResponse(data as PostVoteRow);
}

export async function setVoteComment(commentId: string, voteState: VoteState) {
  const userRes = await getUser();

  if (!userRes.is_success) {
    return createErrorResponse("You must be logged in to vote");
  }

  const supabase = await createClient();

  if (voteState === "not-voted") {
    const { error } = await supabase
      .from("comment_votes")
      .delete()
      .eq("user_id", userRes.data.id)
      .eq("comment_id", commentId);

    if (error) {
      return createErrorResponse(error.message, error);
    }

    return createSuccessResponse(null);
  }

  const value = voteState === "up" ? 1 : -1;

  const commentVote: CommentVoteInsert = {
    value,
    user_id: userRes.data.id,
    comment_id: commentId,
  };

  const { data, error } = await supabase
    .from("comment_votes")
    .upsert(commentVote, {
      onConflict: "comment_id,user_id",
    })
    .select()
    .single();

  if (error) {
    return createErrorResponse(error.message, error);
  }

  return createSuccessResponse(data as CommentVoteRow);
}

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return createErrorResponse(error.message, error);
  }
  return createSuccessResponse(data.user);
}
