"use client";
import { FullComment } from "@/types/posts";
import { useState } from "react";

interface CommentProps {
  comment: FullComment;
}

export const CommentCard: React.FC<CommentProps> = ({ comment }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="mt-4 border-l-2 border-gray-200 pl-4 transition-all">
      {/* Comment Header & Content */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gray-900">
            {comment.author.name}
          </span>
          <span className="text-xs text-gray-500">
            {comment.created_at.toDateString()}
          </span>
        </div>
        <p className="text-gray-700 mt-1">{comment.content}</p>

        {hasReplies && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            {isExpanded
              ? "Hide Replies"
              : `Show ${comment.replies?.length} Replies`}
          </button>
        )}
      </div>

      {/* Recursive Render: If expanded and has replies, render them */}
      {isExpanded && hasReplies && (
        <div className="ml-2">
          {comment.replies!.map((reply) => (
            <CommentCard key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};
