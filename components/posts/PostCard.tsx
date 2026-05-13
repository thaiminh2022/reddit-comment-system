import { PostJoinAuthor } from "@/types/db_schema";
import { formatRelativeTime } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
      <Card className="border-none shadow-sm hover:ring-1 hover:ring-gray-200 transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
              {post.author?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="font-bold text-gray-900 hover:underline cursor-pointer">
              {post.author?.name || "Unknown"}
            </span>
            <span>• {formatRelativeTime(post.created_at)}</span>
          </div>
          <CardTitle className="text-lg font-bold leading-tight">{post.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 leading-normal py-2">
          {post.content}
        </CardContent>
        <CardFooter className="pt-2">
          <CardAction className="w-full">{children}</CardAction>
        </CardFooter>
      </Card>
    </>
  );
}
