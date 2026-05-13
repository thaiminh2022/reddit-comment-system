"use client";
import { fetchSubComments } from "@/lib/actions/data";
import type { CommentSort } from "@/lib/comments/sort";
import { Comment, CommentRoot } from "@/types/posts";
import { useState } from "react";
import { CommentVotePill } from "./CommentVotePill";
import CreateComment from "../../CreateComment";
import {
  IconLoader2,
  IconMessageCircle,
  IconMinus,
  IconCirclePlus,
} from "@tabler/icons-react";
import { timeAgo } from "@/lib/helper";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const allReplies = [...(comment.replies || []), ...extraReplies];

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const res = await fetchSubComments(comment.id, sort);
    if (res.is_success) {
      setExtraReplies(res.data);
      setHasMore(false);
    }
    setIsLoadingMore(false);
  };

  if (!isExpanded && !hideReplies) {
    return (
      <div
        className={`mt-3 ${depth > 0 ? "ml-2 sm:ml-4" : ""} flex items-center gap-2`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IconCirclePlus size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-gray-900">
            {comment.author.name}
          </span>
          <span className="text-[10px] text-gray-500">Thread collapsed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${depth > 0 ? "ml-2 sm:ml-4" : ""} transition-all relative`}>
      <div className="flex gap-x-2">
        {/* Collapse Button & Vertical Line */}
        {!hideReplies && (
          <div className="flex flex-col items-center w-5">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-300 hover:text-gray-600 transition-colors z-10 bg-white"
            >
              <IconMinus
                size={16}
                className="border border-gray-200 rounded-full p-0.5"
              />
            </button>
            <div
              onClick={() => setIsExpanded(false)}
              className="w-px h-full bg-gray-200 hover:bg-gray-400 hover:w-0.5 cursor-pointer transition-all"
            />
          </div>
        )}

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs text-gray-900 truncate">
              {comment.author.name}
            </span>
            <span className="text-[10px] text-gray-400 shrink-0">
              <Tooltip>
                <TooltipTrigger className="underline">
                  {timeAgo(comment.created_at)}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{comment.created_at.toLocaleDateString()}</p>
                </TooltipContent>
              </Tooltip>
            </span>
          </div>

          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div className="flex items-center gap-x-4 mt-2 text-xs text-gray-500 font-bold">
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
                <IconMessageCircle size={16} />
                <span>Trả lời</span>
              </button>
            )}
          </div>

          {!hideReplies && (
            <div className="mt-2">
              <CreateComment
                postId={postId}
                parentId={comment.id}
                replyTo={comment.author.name}
                getClicked={() => clickedReply}
                setClicked={setClickedReply}
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
                    <span>{comment.reply_count} tin nhắn trả lời khác</span>
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
