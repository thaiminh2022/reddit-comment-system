"use client";

import { setVotePost, VoteState } from "@/lib/actions/updownvote";
import { PostRow } from "@/types/db_schema";
import {
  IconArrowBigDown,
  IconArrowBigDownFilled,
  IconArrowBigUp,
  IconArrowBigUpFilled,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface VotePillProps {
  post: PostRow;
  voteState: VoteState;
}

export function PostVotePill({
  post,
  voteState: initialVoteState,
}: VotePillProps) {
  const [currentScore, setCurrentScore] = useState(post.score);
  const [currentVote, setCurrentVote] = useState(initialVoteState);

  // Sync with props if they change
  useEffect(() => {
    setCurrentScore(post.score);
    setCurrentVote(initialVoteState);
  }, [post.score, initialVoteState]);

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

    const res = await setVotePost(post.id, nextVote, `/posts/${post.id}`);
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
    <div className="flex h-9.5 items-center rounded-full border border-border bg-muted">
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full transition-colors hover:bg-accent cursor-pointer ${
          currentVote === "up"
            ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
            : "text-muted-foreground"
        }`}
        onClick={handleUpvote}
      >
        {currentVote === "up" ? (
          <IconArrowBigUpFilled size={24} />
        ) : (
          <IconArrowBigUp size={24} />
        )}
      </Button>
      <span
        className={`text-sm font-bold px-2 min-w-8 text-center ${
          currentVote === "up"
            ? "text-orange-600"
            : currentVote === "down"
              ? "text-blue-600 dark:text-blue-400"
              : "text-foreground"
        }`}
      >
        {currentScore}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full transition-colors hover:bg-accent cursor-pointer ${
          currentVote === "down"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            : "text-muted-foreground"
        }`}
        onClick={handleDownVote}
      >
        {currentVote === "down" ? (
          <IconArrowBigDownFilled size={24} />
        ) : (
          <IconArrowBigDown size={24} />
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
