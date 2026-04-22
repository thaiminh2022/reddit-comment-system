"use client";

import { Post } from "@/types/posts";
import { useState } from "react";
import VotePill from "../VotePill";
import CreateComment from "./CreateComment";
import CommentPill from "../CommentPill";

interface Props {
  post: Post;
}

export default function PostCommentActionBar({ post }: Props) {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-3 ml-3">
          <VotePill score={post.score} />
          <CommentPill
            onClick={() => setClicked(true)}
            commentCount={post.total_comment_count}
          />
        </div>

        <CreateComment
          getClicked={() => clicked}
          setClicked={(newValue) => setClicked(newValue)}
        />
      </div>
    </>
  );
}
