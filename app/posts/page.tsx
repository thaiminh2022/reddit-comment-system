import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchPosts } from "@/lib/data";
import Link from "next/link";
import { ImPen } from "react-icons/im";

export default async function Page() {
  const posts = await fetchPosts();

  return (
    <div className="flex flex-col gap-y-5">
      <Card className="mb-3">
        <CardHeader>
          <CardTitle className="font-bold text-3xl">Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <CardAction className="w-full">
            <Link href={"/posts/create"}>
              <Button className="cursor-pointer">
                <ImPen />
                Create Post
              </Button>
            </Link>
          </CardAction>
        </CardContent>
      </Card>

      {posts.map((p, i) => (
        <PostCard post={p} key={i} />
      ))}
    </div>
  );
}
