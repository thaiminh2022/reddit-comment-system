"use client";

import { setVoteComment, VoteState } from "@/lib/actions/updownvote";
import {
  IconArrowBigDown,
  IconArrowBigDownFilled,
  IconArrowBigUp,
  IconArrowBigUpFilled,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";

interface CommentVotePillProps {
  postId: string;
  commentId: string;
  score: number;
  voteState: VoteState;
}

export function CommentVotePill({
  postId,
  commentId,
  score: initialScore,
  voteState: initialVoteState,
}: CommentVotePillProps) {
  const [currentScore, setCurrentScore] = useState(initialScore);
  const [currentVote, setCurrentVote] = useState(initialVoteState);

  // Sync with props if they change (e.g. fresh data from server eventually arrives)
  useEffect(() => {
    setCurrentScore(initialScore);
    setCurrentVote(initialVoteState);
  }, [initialScore, initialVoteState]);

  async function handleVote(nextVote: VoteState) {
    const oldVote = currentVote;
    const oldScore = currentScore;
    
    // Calculate new score based on state change
    const oldVal = voteValue(oldVote);
    const newVal = voteValue(nextVote);
    const nextScore = oldScore - oldVal + newVal;

    // Optimistic Update
    setCurrentVote(nextVote);
    setCurrentScore(nextScore);

    const res = await setVoteComment(commentId, nextVote, `/posts/${postId}`);
    if (!res.is_success) {
      toast.error(`Error happened, ${res.message}`);
      // Revert on error
      setCurrentVote(oldVote);
      setCurrentScore(oldScore);
    }
  }

  const handleUpvote = () => {
    const nextVote: VoteState = currentVote === "up" ? "not-voted" : "up";
    handleVote(nextVote);
  };

  const handleDownVote = () => {
    const nextVote: VoteState = currentVote === "down" ? "not-voted" : "down";
    handleVote(nextVote);
  };

  return (
    <div className="flex items-center overflow-hidden rounded-full bg-muted">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-none transition-colors hover:bg-accent ${
          currentVote === "up"
            ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
            : "text-muted-foreground"
        }`}
        onClick={handleUpvote}
      >
        {currentVote === "up" ? (
          <IconArrowBigUpFilled size={20} />
        ) : (
          <IconArrowBigUp size={20} />
        )}
      </Button>
      <span className={`text-xs font-bold px-1 min-w-[1.5rem] text-center ${
        currentVote === "up"
          ? "text-orange-600 dark:text-orange-400"
          : currentVote === "down"
            ? "text-blue-600 dark:text-blue-400"
            : "text-foreground"
      }`}>
        {currentScore}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-none transition-colors hover:bg-accent ${
          currentVote === "down"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            : "text-muted-foreground"
        }`}
        onClick={handleDownVote}
      >
        {currentVote === "down" ? (
          <IconArrowBigDownFilled size={20} />
        ) : (
          <IconArrowBigDown size={20} />
        )}
      </Button>
    </div>
  );
}

function voteValue(vote: VoteState) {
  if (vote === "up") return 1;
  if (vote === "down") return -1;
  return 0;
}
