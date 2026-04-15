"use client";

import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { IoChatboxEllipses } from "react-icons/io5";
import { Button } from "../ui/button";
import Link from "next/link";
import { Post } from "@/types/posts";
import CreateComment from "./CreateComment";
import { useState } from "react";

interface Props {
  post: Post;
}

export default function PostCommentActionBar({ post }: Props) {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <div>
        <div className="flex gap-x-3 mb-3">
          <div className="inline-flex rounded-full bg-slate-50 h-full ml-3">
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
            <Button
              variant="ghost"
              className="rounded-full cursor-pointer"
              onClick={() => setClicked(true)}
              type="button"
            >
              <IoChatboxEllipses className="w-5 h-5" strokeWidth={1.5} />
              {post.total_comment_count}
            </Button>
          </div>
        </div>

        <CreateComment
          clicked={clicked}
          setClicked={(newValue) => setClicked(newValue)}
        />
      </div>
    </>
  );
}
