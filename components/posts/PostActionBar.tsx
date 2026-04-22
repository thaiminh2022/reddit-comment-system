import { Post } from "@/types/posts";
import Link from "next/link";
import { IoChatboxEllipses } from "react-icons/io5";
import { Button } from "../ui/button";
import VotePill from "../VotePill";

interface Props {
  post: Post;
}

export default function PostActionBar({ post }: Props) {
  return (
    <div className="flex">
      <VotePill score={post.score} />
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
