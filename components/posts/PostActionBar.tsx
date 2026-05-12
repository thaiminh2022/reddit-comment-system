import { votePost } from "@/lib/actions/data";
import { PostRow } from "@/types/db_schema";
import Link from "next/link";
import { IoChatboxEllipses } from "react-icons/io5";
import { Button } from "../ui/button";
import VotePill from "../VotePill";

interface Props {
  post: PostRow;
}

export default function PostActionBar({ post }: Props) {
  return (
    <div className="flex">
      <VotePill
        score={post.score}
        upVoteAction={votePost.bind(null, post.id, 1)}
        downVoteAction={votePost.bind(null, post.id, -1)}
      />
      <div className="inline-flex rounded-full bg-slate-50">
        <Link href={`/posts/${post.id}`}>
          <Button
            variant="ghost"
            className="rounded-full cursor-pointer"
            type="button"
          >
            <IoChatboxEllipses className="w-5 h-5" strokeWidth={1.5} />
            {post.total_comment_count}
          </Button>
        </Link>
      </div>
    </div>
  );
}
