"use client";

import { useState, useEffect, useRef } from "react";
import { CommentRoot } from "@/types/posts";
import { CommentCard } from "./CommentCard";
import { fetchComments } from "@/lib/actions/data";
import { CommentSort } from "@/lib/comments/sort";
import { IconLoader2 } from "@tabler/icons-react";
import CreateComment from "../../CreateComment";

interface Props {
  postId: string;
  initialComments: CommentRoot[];
  initialCursor: string | null;
  sort: CommentSort;
}

export default function InfiniteCommentList({
  postId,
  initialComments,
  initialCursor,
  sort,
}: Props) {
  const [comments, setComments] = useState<CommentRoot[]>(initialComments);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Sync with server data when sort changes
  useEffect(() => {
    setComments(initialComments);
    setCursor(initialCursor);
  }, [initialComments, initialCursor, sort]);

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && cursor && !isLoading) {
          setIsLoading(true);
          const res = await fetchComments(postId, sort, cursor);
          if (res.is_success) {
            const newComments = res.data.comments;
            setComments((prev) => {
              const filteredNew = newComments.filter(
                (nc: CommentRoot) => !prev.some((pc) => pc.id === nc.id)
              );
              return [...prev, ...filteredNew];
            });
            setCursor(res.data.nextCursor);
          }
          setIsLoading(false);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [cursor, isLoading, postId, sort]);

  return (
    <div className="py-4 bg-white">
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Comments</h2>
      </div>
      
      <div className="px-4 mb-8">
        <CreateComment 
          postId={postId} 
          getClicked={() => false}
          setClicked={() => {}} 
        />
      </div>

      <div className="px-4 space-y-1">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            postId={postId}
            comment={comment}
            sort={sort}
          />
        ))}
      </div>

      {cursor && (
        <div ref={loaderRef} className="flex justify-center py-10">
          <IconLoader2 className="animate-spin text-gray-400" size={32} />
        </div>
      )}

      {!cursor && comments.length > 0 && (
        <div className="text-center py-10 text-gray-400 text-xs font-medium border-t border-gray-100 mt-8 mx-4">
          No more comments.
        </div>
      )}
    </div>
  );
}
