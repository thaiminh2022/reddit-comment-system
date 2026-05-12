"use client";
import type { CommentVoteStates } from "@/lib/actions/updownvote";
import { fetchSubComments } from "@/lib/actions/data";
import { Comment, CommentRoot } from "@/types/posts";
import { useState } from "react";
import CommentPill from "../../CommentPill";
import CreateComment from "../../CreateComment";
import { CommentVotePill } from "./CommentVotePill";
import { IconLoader2, IconMessageCircle } from "@tabler/icons-react";

interface CommentProps {
  postId: string;
  comment: CommentRoot;
  commentVoteStates: CommentVoteStates;
}

export const CommentCard: React.FC<CommentProps> = ({
  postId,
  comment,
  commentVoteStates: initialVoteStates,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [clickedReply, setClickedReply] = useState(false);
  const [extraReplies, setExtraReplies] = useState<Comment[]>([]);
  const [hasMore, setHasMore] = useState(comment.has_more);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const allReplies = [...(comment.replies || []), ...extraReplies];
  const hasReplies = allReplies.length > 0;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const res = await fetchSubComments(comment.id);
    if (res.is_success) {
      setExtraReplies(res.data);
      setHasMore(false); // Assume we fetched all for this level
    }
    setIsLoadingMore(false);
  };

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
                : `Show ${allReplies.length} Replies`}
            </button>
          )}
          <CommentVotePill
            postId={postId}
            commentId={comment.id}
            score={comment.score}
            voteState={initialVoteStates[comment.id] ?? "not-voted"}
          />
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
      {isExpanded && (
        <div className="ml-2">
          {allReplies.map((reply) => (
            <CommentCard
              key={reply.id}
              postId={postId}
              comment={reply}
              commentVoteStates={initialVoteStates}
            />
          ))}
          
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 py-2"
            >
              {isLoadingMore ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconMessageCircle size={14} />
              )}
              {isLoadingMore ? "Loading..." : "Load more replies..."}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
