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

export function PostVotePill({ post, voteState: initialVoteState }: VotePillProps) {
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
    <div className="flex items-center bg-gray-50 rounded-full px-1 border border-gray-100">
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full hover:bg-gray-200 transition-colors ${
          currentVote === "up" ? "text-orange-600 bg-orange-50" : "text-gray-500"
        }`}
        onClick={handleUpvote}
      >
        {currentVote === "up" ? (
          <IconArrowBigUpFilled size={24} />
        ) : (
          <IconArrowBigUp size={24} />
        )}
      </Button>
      <span className={`text-sm font-bold px-2 min-w-[2rem] text-center ${
        currentVote === "up" ? "text-orange-600" : 
        currentVote === "down" ? "text-blue-600" : "text-gray-700"
      }`}>
        {currentScore}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full hover:bg-gray-200 transition-colors ${
          currentVote === "down" ? "text-blue-600 bg-blue-50" : "text-gray-500"
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
