import { getPostVoteState } from "@/lib/actions/updownvote";
import { PostRow } from "@/types/db_schema";
import { IconBubblePlus } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { OuterVoteButton } from "./OuterVoteButton";

interface Props {
  post: PostRow;
}
export default async function PostActionBar({ post }: Props) {
  const postVoteStateRes = await getPostVoteState(post.id);
  if (!postVoteStateRes.is_success) {
    return <>Cannot fetch vote: {postVoteStateRes.message} </>;
  }

  const voteState = postVoteStateRes.data;

  return (
    <div className="flex">
      <OuterVoteButton post={post} voteState={voteState} />
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
