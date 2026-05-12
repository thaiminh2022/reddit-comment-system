"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useTransition } from "react";
import { Button } from "./ui/button";

interface Props {
  score?: number;
  upVoteAction?: () => Promise<unknown> | unknown;
  downVoteAction?: () => Promise<unknown> | unknown;
}

export default function VotePill({
  score,
  upVoteAction,
  downVoteAction,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function runVote(action?: () => Promise<unknown> | unknown) {
    if (!action) return;
    startTransition(() => {
      void action();
    });
  }

  return (
    <div className="inline-flex ">
      <div className="inline-flex rounded-full bg-slate-50 h-full">
        <Button
          variant="ghost"
          className="rounded-full cursor-pointer"
          type="button"
          disabled={isPending || !upVoteAction}
          onClick={() => runVote(upVoteAction)}
        >
          <ArrowBigUp className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <span className="flex items-center justify-center text-center">
          {score ?? 0}
        </span>
        <Button
          variant="ghost"
          onClick={() => runVote(downVoteAction)}
          disabled={isPending || !downVoteAction}
          className="rounded-full cursor-pointer"
          type="button"
        >
          <ArrowBigDown className="w-5 h-5" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
