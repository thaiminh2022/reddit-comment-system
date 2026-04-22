import { fetchUserData } from "@/lib/data";
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
  post: Post;
  children?: React.ReactNode | React.ReactNode[];
}

export default function PostCard({ post, children }: Props) {
  const user = fetchUserData(post.author_id);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>Author: {user.name}</CardDescription>
        </CardHeader>
        <CardContent>{post.content}</CardContent>
        <CardAction className="w-full">{children}</CardAction>
      </Card>
    </>
  );
}
