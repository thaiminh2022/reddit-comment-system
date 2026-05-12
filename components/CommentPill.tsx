import { IconBubblePlus } from "@tabler/icons-react";
import { Button } from "./ui/button";

interface Props {
  commentCount?: number;
  onClick?: () => void;
}

export default function CommentPill({ onClick, commentCount }: Props) {
  return (
    <div className="inline-flex rounded-full bg-slate-50">
      <Button
        variant="ghost"
        className="rounded-full cursor-pointer"
        onClick={onClick}
        type="button"
      >
        <IconBubblePlus className="w-5 h-5" strokeWidth={1.5} />
        {commentCount}
      </Button>
    </div>
  );
}
