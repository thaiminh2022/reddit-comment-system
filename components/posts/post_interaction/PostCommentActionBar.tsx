"use client";

import { VoteState } from "@/lib/actions/updownvote";
import { PostRow } from "@/types/db_schema";
import { useState } from "react";
import CommentPill from "../../CommentPill";
import CreateComment from "../../CreateComment";
import { PostVotePill } from "../PostVotePill";

interface Props {
  post: PostRow;
  voteState: VoteState;
}

export default function PostCommentActionBar({ post, voteState }: Props) {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-3 ml-3">
          <PostVotePill post={post} voteState={voteState} />
          <CommentPill
            onClick={() => setClicked(true)}
            commentCount={post.total_comment_count}
          />
        </div>

        <CreateComment
          postId={post.id}
          getClicked={() => clicked}
          setClicked={(newValue) => setClicked(newValue)}
        />
      </div>
    </>
  );
}
