import { IconBubblePlus } from "@tabler/icons-react";
import { Button } from "./ui/button";

interface Props {
  commentCount?: number;
  onClick?: () => void;
}

export default function CommentPill({ onClick, commentCount }: Props) {
  return (
    <div className="flex h-9.5 items-center rounded-full border border-border bg-muted px-1">
      <Button
        variant="ghost"
        className="h-9 rounded-full px-3 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
        onClick={onClick}
        type="button"
      >
        <IconBubblePlus className="w-5 h-5" strokeWidth={1.5} />
        {commentCount}
      </Button>
    </div>
  );
}
