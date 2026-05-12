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

interface Props {
  post: PostJoinAuthor;
  children?: React.ReactNode | React.ReactNode[];
}

export default function PostCard({ post, children }: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            Author: {post.author?.name || "Unknown"}
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
