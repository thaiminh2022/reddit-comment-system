import { Post } from "@/types/posts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  post: Post & { author?: { name: string } };
  children?: React.ReactNode | React.ReactNode[];
}

export default function PostCard({ post, children }: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>Author: {post.author?.name || "Unknown"}</CardDescription>
        </CardHeader>
        <CardContent>{post.content}</CardContent>
        <CardAction className="w-full">{children}</CardAction>
      </Card>
    </>
  );
}
