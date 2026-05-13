"use client";

import { setVotePost, VoteState } from "@/lib/actions/updownvote";
import { PostRow } from "@/types/db_schema";
import {
  IconArrowBigDown,
  IconArrowBigDownFilled,
  IconArrowBigUp,
  IconArrowBigUpFilled,
} from "@tabler/icons-react";
import { startTransition, useOptimistic } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface VotePillProps {
  post: PostRow;
  voteState: VoteState;
}

type OptimisticScore = {
  score: number;
  userVote: VoteState;
};

export function PostVotePill({ post, voteState }: VotePillProps) {
  const [optimisticVote, setOptimisticVote] = useOptimistic<
    OptimisticScore,
    VoteState
  >(
    {
      score: post.score,
      userVote: voteState,
    },
    (s, a) => {
      const oldVoteValue = voteValue(s.userVote);
      const nextVoteValue = voteValue(a);

      return {
        userVote: a,
        score: s.score - oldVoteValue + nextVoteValue,
      };
    },
  );

  async function handleUpvote() {
    const nextVote: VoteState =
      optimisticVote.userVote === "up" ? "not-voted" : "up";

    startTransition(async () => {
      setOptimisticVote(nextVote);
      const res = await setVotePost(post.id, nextVote, `/posts/${post.id}`);
      if (!res.is_success) {
        toast.error(`Error happened, ${res.message} \n${res.error}`);
      }
    });
  }

  async function handleDownVote() {
    const nextVote: VoteState =
      optimisticVote.userVote === "down" ? "not-voted" : "down";

    startTransition(async () => {
      setOptimisticVote(nextVote);
      const res = await setVotePost(post.id, nextVote, `/posts/${post.id}`);
      if (!res.is_success) {
        toast.error(`Error happened, ${res.message} \n${res.error}`);
      }
    });
  }

  return (
    <div className="inline-flex items-center justify-center">
      <Button
        variant={"ghost"}
        className="cursor-pointer"
        onClick={handleUpvote}
      >
        {optimisticVote.userVote === "up" ? (
          <IconArrowBigUpFilled className="text-orange-700" />
        ) : (
          <IconArrowBigUp />
        )}
      </Button>
      <span
        className={`font-bold ${optimisticVote.score < 0 ? "text-purple-800" : ""}`}
      >
        {optimisticVote.score}
      </span>
      <Button
        variant={"ghost"}
        className="cursor-pointer"
        onClick={handleDownVote}
      >
        {optimisticVote.userVote == "down" ? (
          <IconArrowBigDownFilled className="text-blue-800" />
        ) : (
          <IconArrowBigDown />
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
