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
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconCirclePlus size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-foreground">
            {comment.author.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
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
          <div className="mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          {!hideReplies && isExpanded && (
            <div
              className="w-px flex-1 cursor-pointer bg-border transition-all hover:w-0.5 hover:bg-orange-400"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="truncate text-xs font-bold text-foreground">
              {comment.author.name}
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              • {formatRelativeTime(comment.created_at)}
            </span>
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconCirclePlus size={18} />
              </button>
            )}
          </div>

          <div className="pb-2">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
              {comment.content}
            </p>

            <div className="mt-2 flex items-center gap-x-3 text-xs font-medium text-muted-foreground">
              <CommentVotePill
                postId={postId}
                commentId={comment.id}
                score={comment.score}
                voteState={comment.vote_state}
              />
              {!hideReplies && (
                <button
                  onClick={() => setClickedReply(true)}
                  className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-accent hover:text-foreground"
                >
                  <IconMessageCircle size={18} className="text-muted-foreground" />
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
                    className="ml-1 flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <div className="text-muted-foreground">
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
