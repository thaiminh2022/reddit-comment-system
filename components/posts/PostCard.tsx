import { fetchUserData } from "@/lib/data";
import { Post } from "@/types/posts";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { CiChat2 } from "react-icons/ci";
import { Button } from "../ui/button";
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
}

export default function PostCard({ post }: Props) {
  const user = fetchUserData(post.author_id);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>Author: {user.name}</CardDescription>

          <CardAction className="flex flex-col">
            <Button variant={"outline"}>
              <BiUpvote />
            </Button>
            <p className="w-full text-center">{post.score}</p>
            <Button variant={"outline"}>
              <BiDownvote />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>{post.content}</CardContent>
        <CardAction className="w-1/2 mx-auto">
          <Link href={`/posts/${post.id}`}>
            <Button className="cursor-pointer">
              <CiChat2 />
              Comment
              <p className="font-bold">{post.total_comment_count}</p>
            </Button>
          </Link>
        </CardAction>
      </Card>
    </>
  );
}
