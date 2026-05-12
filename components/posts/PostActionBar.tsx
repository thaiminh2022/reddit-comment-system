import { PostRow } from "@/types/db_schema";
import { IconBubblePlus } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { PostVotePill } from "./PostVotePill";
import { VoteState } from "@/lib/actions/updownvote";

interface Props {
  post: PostRow;
  voteState: VoteState;
}

export default function PostActionBar({ post, voteState }: Props) {
  return (
    <div className="flex">
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
    <div className="inline-flex rounded-full">
      <Link href={`/posts/${post.id}`}>
        <Button
          variant="ghost"
          className="rounded-full cursor-pointer"
          type="button"
        >
          <IconBubblePlus className="w-5 h-5" strokeWidth={1.5} />
          {post.total_comment_count}
        </Button>
      </Link>
    </div>
  );
}
