"use client";
import { CommentRoot } from "@/types/posts";
import { useState } from "react";
import CommentPill from "../../CommentPill";
import CreateComment from "../../CreateComment";
import CommentVotePillServer from "./CommentVotePillServer";

interface CommentProps {
  postId: string;
  comment: CommentRoot;
}

export const CommentCard: React.FC<CommentProps> = ({ postId, comment }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [clickedReply, setClickedReply] = useState(false);

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

        <div className="flex gap-x-3 text-sm">
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
          <CommentVotePillServer commentId={comment.id} score={comment.score} />
          <CommentPill onClick={() => setClickedReply(true)} />
        </div>
        <CreateComment
          postId={postId}
          parentId={comment.id}
          replyTo={comment.author.name}
          getClicked={() => clickedReply}
          setClicked={setClickedReply}
        />
      </div>

      {/* Recursive Render: If expanded and has replies, render them */}
      {isExpanded && hasReplies && (
        <div className="ml-2">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} postId={postId} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};
