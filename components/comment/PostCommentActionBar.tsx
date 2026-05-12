"use client";

import { votePost } from "@/lib/actions/data";
import { PostRow } from "@/types/db_schema";
import { useState } from "react";
import CommentPill from "../CommentPill";
import VotePill from "../VotePill";
import CreateComment from "./CreateComment";

interface Props {
  post: PostRow;
}

export default function PostCommentActionBar({ post }: Props) {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-3 ml-3">
          <VotePill
            score={post.score}
            upVoteAction={() => votePost(post.id, 1)}
            downVoteAction={() => votePost(post.id, -1)}
          />
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
