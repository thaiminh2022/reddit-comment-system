"use client";

import { VoteState } from "@/lib/actions/updownvote";
import { PostRow } from "@/types/db_schema";
import { IconBubblePlus } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { PostVotePill } from "./PostVotePill";

interface Props {
  post: PostRow;
  voteState: VoteState;
}

export default function PostActionBar({ post, voteState }: Props) {
  return (
    <div className="flex items-center gap-2">
      <PostVotePill post={post} voteState={voteState} />
      <OuterCommentButton post={post} />
    </div>
  );
}

interface OuterCommentButtonProps {
  post: PostRow;
}

function OuterCommentButton({ post }: OuterCommentButtonProps) {
  return (
    <div className="flex h-9.5 items-center rounded-full border border-border bg-muted px-1 ">
      <Link href={`/posts/${post.id}`}>
        <Button
          variant="ghost"
          className="h-9 rounded-full px-3 text-foreground cursor-pointer"
          type="button"
        >
          <IconBubblePlus className="w-5 h-5" strokeWidth={1.5} />
          {post.total_comment_count}
        </Button>
      </Link>
    </div>
  );
}
