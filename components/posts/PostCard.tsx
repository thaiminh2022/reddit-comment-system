import { PostJoinAuthor } from "@/types/db_schema";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { timeAgo } from "@/lib/helper";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
  post: PostJoinAuthor;
  children?: React.ReactNode | React.ReactNode[];
}

export default function PostCard({ post, children }: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <main>{post.title}</main>
          </CardTitle>
          <CardDescription className="flex justify-between flex-wrap">
            <div> Author: {post.author?.name || "Unknown"}</div>
            <Tooltip>
              <TooltipTrigger className="underline">
                {timeAgo(post.created_at)}
              </TooltipTrigger>
              <TooltipContent>
                <p>{new Date(post.created_at).toLocaleDateString()}</p>
              </TooltipContent>
            </Tooltip>
          </CardDescription>
        </CardHeader>
        <CardContent>{post.content}</CardContent>
        <CardFooter>
          <CardAction className="w-full">{children}</CardAction>
        </CardFooter>
      </Card>
    </>
  );
}
