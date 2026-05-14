import { formatRelativeTime } from "@/lib/helper";
import { PostJoinAuthor } from "@/types/db_schema";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  post: PostJoinAuthor;
  children?: React.ReactNode | React.ReactNode[];
}

export default function PostCard({ post, children }: Props) {
  return (
    <>
      <Card className="border-none shadow-sm transition-all hover:ring-1 hover:ring-border">
        <CardHeader className="pb-2">
          <div className="mb-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground">
              {post.author?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="cursor-pointer font-bold text-foreground hover:underline">
              {post.author?.name || "Unknown"}
            </span>
            <span>• {formatRelativeTime(post.created_at)}</span>
          </div>
          <CardTitle className="text-lg font-bold leading-tight">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-normal py-2">
          {post.content}
        </CardContent>
        <CardFooter className="pt-2">
          <CardAction className="w-full">{children}</CardAction>
        </CardFooter>
      </Card>
    </>
  );
}
