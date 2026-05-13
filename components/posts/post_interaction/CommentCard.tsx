"use client";
import { fetchSubComments } from "@/lib/actions/data";
import type { CommentSort } from "@/lib/comments/sort";
import { formatRelativeTime } from "@/lib/helper";
import { Comment, CommentRoot } from "@/types/posts";
import {
  IconCirclePlus,
  IconLoader2,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import CreateComment from "../../CreateComment";
import { CommentVotePill } from "./CommentVotePill";

interface CommentProps {
  postId: string;
  comment: CommentRoot;
  sort: CommentSort;
  hideReplies?: boolean;
  depth?: number;
}

export const CommentCard: React.FC<CommentProps> = ({
  postId,
  comment,
  sort,
  hideReplies = false,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [clickedReply, setClickedReply] = useState(false);
  const [extraReplies, setExtraReplies] = useState<Comment[]>([]);
  const [hasMore, setHasMore] = useState(comment.has_more);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [subCursor, setSubCursor] = useState<string | null>(null);

  const allReplies = [...(comment.replies || []), ...extraReplies];

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const res = await fetchSubComments(
      comment.id,
      sort,
      subCursor || undefined,
    );
    if (res.is_success) {
      setExtraReplies((prev) => {
        const newComments = res.data.comments;
        const filteredNew = newComments.filter(
          (nc: Comment) =>
            !prev.some((pc) => pc.id === nc.id) &&
            !(comment.replies || []).some((rc) => rc.id === nc.id),
        );
        return [...prev, ...filteredNew];
      });
      setSubCursor(res.data.nextCursor);
      setHasMore(!!res.data.nextCursor);
    }
    setIsLoadingMore(false);
  };

  if (!isExpanded && !hideReplies) {
    return (
      <div
        className={`mt-3 ${depth > 0 ? "ml-4" : ""} flex items-center gap-2`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IconCirclePlus size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-xs text-gray-900">
            {comment.author.name}
          </span>
          <span className="text-[10px] text-gray-500">
            • {formatRelativeTime(comment.created_at)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-4 ${depth > 0 ? "ml-4 md:ml-6" : ""} transition-all relative`}
    >
      <div className="flex gap-x-2 md:gap-x-3">
        {/* Vertical Line & Avatar Area */}
        <div className="flex flex-col items-center w-7 shrink-0">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 mb-2 shrink-0">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          {!hideReplies && isExpanded && (
            <div
              className="flex-1 w-px bg-gray-200 hover:bg-orange-400 hover:w-0.5 cursor-pointer transition-all"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs text-gray-900 truncate">
              {comment.author.name}
            </span>
            <span className="text-[10px] text-gray-400 shrink-0">
              • {formatRelativeTime(comment.created_at)}
            </span>
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
              >
                <IconCirclePlus size={18} />
              </button>
            )}
          </div>

          <div className="pb-2">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            <div className="flex items-center gap-x-3 mt-2 text-xs text-gray-500 font-medium">
              <CommentVotePill
                postId={postId}
                commentId={comment.id}
                score={comment.score}
                voteState={comment.vote_state}
              />
              {!hideReplies && (
                <button
                  onClick={() => setClickedReply(true)}
                  className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  <IconMessageCircle size={18} className="text-gray-400" />
                  <span>Reply</span>
                </button>
              )}
            </div>
          </div>

          {!hideReplies && (
            <div className="mt-1">
              <CreateComment
                postId={postId}
                parentId={comment.id}
                replyTo={comment.author.name}
                getClicked={() => clickedReply}
                setClicked={setClickedReply}
                onSuccess={() => {
                  // Re-fetch all replies to show the new one
                  // We clear existing extraReplies and subCursor to start fresh
                  setExtraReplies([]);
                  setSubCursor(null);
                  handleLoadMore();
                }}
              />
            </div>
          )}

          {/* Render Replies */}
          {isExpanded && !hideReplies && (
            <div className="mt-1">
              {allReplies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  postId={postId}
                  comment={reply}
                  sort={sort}
                  depth={depth + 1}
                />
              ))}

              {hasMore && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors ml-1"
                  >
                    <div className="text-gray-400">
                      {isLoadingMore ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconCirclePlus size={20} />
                      )}
                    </div>
                    <span>{comment.reply_count} more replies</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
