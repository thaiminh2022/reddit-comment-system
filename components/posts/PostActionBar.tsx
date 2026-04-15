import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { IoChatboxEllipses } from "react-icons/io5";
import { Button } from "../ui/button";
import { Post } from "@/types/posts";
import Link from "next/link";

interface Props {
  post: Post;
}

export default function PostActionBar({ post }: Props) {
  return (
    <div className="flex">
      <div className="inline-flex rounded-full bg-slate-50 h-full">
        <Button
          variant="ghost"
          className="rounded-full cursor-pointer"
          type="button"
        >
          <ArrowBigUp className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <span className="flex items-center justify-center text-center">
          {post.score}
        </span>
        <Button
          variant="ghost"
          className="rounded-full cursor-pointer"
          type="button"
        >
          <ArrowBigDown className="w-5 h-5" strokeWidth={1.5} />
        </Button>
      </div>
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
