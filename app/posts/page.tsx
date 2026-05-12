import LogoutButton from "@/components/LogoutButton";
import PostActionBar from "@/components/posts/PostActionBar";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchPostJoinAuthorRows } from "@/lib/actions/data";
import Link from "next/link";
import { ImPen } from "react-icons/im";

export default async function Page() {
  const postsRes = await fetchPostJoinAuthorRows();
  if (!postsRes.is_success) {
    return (
      <div className="rounded-md p-2  bg-red-100">
        Error fetching posts: {postsRes.message}
      </div>
    );
  }

  const posts = postsRes.data;

  return (
    <div className="flex flex-col gap-y-5">
      <Card className="mb-3">
        <CardHeader>
          <CardTitle className="font-bold text-3xl">Posts</CardTitle>
          <CardAction>
            <LogoutButton />
          </CardAction>
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
        <PostCard post={p} key={i}>
          <PostActionBar post={p} />
        </PostCard>
      ))}
    </div>
  );
}
