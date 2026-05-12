"use client";

import { PostRow } from "@/types/db_schema";
import { useState } from "react";
import CommentPill from "../CommentPill";
import CreateComment from "./CreateComment";

interface Props {
  post: PostRow;
  isVoted?: -1 | 1;
}

export default function PostCommentActionBar({ post }: Props) {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-3 ml-3">
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
