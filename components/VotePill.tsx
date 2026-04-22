"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  score?: number;
  onUpVote?: () => void;
  onDownVote?: () => void;
}

export default function VotePill({ score, onUpVote, onDownVote }: Props) {
  return (
    <div className="inline-flex ">
      <div className="inline-flex rounded-full bg-slate-50 h-full">
        <Button
          variant="ghost"
          className="rounded-full cursor-pointer"
          type="button"
          onClick={onUpVote}
        >
          <ArrowBigUp className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <span className="flex items-center justify-center text-center">
          {score ?? 0}
        </span>
        <Button
          variant="ghost"
          onClick={onDownVote}
          className="rounded-full cursor-pointer"
          type="button"
        >
          <ArrowBigDown className="w-5 h-5" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
