import LogoutButton from "@/components/LogoutButton";
import InfinitePostList from "@/components/posts/InfinitePostList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchPostJoinAuthorRows, SortOrder } from "@/lib/actions/data";
import { getPostVoteStates } from "@/lib/actions/updownvote";
import { IconPencil, IconSortDescending, IconTrendingUp } from "@tabler/icons-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort = (params.sort as SortOrder) || "new";
  const pageSize = 10;

  // Fetch initial posts on the server
  const postsRes = await fetchPostJoinAuthorRows(undefined, pageSize, sort);
  if (!postsRes.is_success) {
    return (
      <div className="rounded-md p-2  bg-red-100">
        Error fetching posts: {postsRes.message}
      </div>
    );
  }

  const { posts, nextCursor } = postsRes.data;

  // Fetch vote states for initial posts
  const postIds = posts.map((p) => p.id);
  const voteStatesRes = await getPostVoteStates(postIds);
  const initialVoteStates = voteStatesRes.is_success ? voteStatesRes.data : {};

  return (
    <div className="flex flex-col gap-y-5 pb-10">
      <Card className="mb-3">
        <CardHeader>
          <CardTitle className="font-bold text-3xl">Posts</CardTitle>
          <CardAction>
            <LogoutButton />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center w-full gap-4">
            <div className="flex gap-2">
              <Link href="/posts?sort=new">
                <Button variant={sort === "new" ? "default" : "outline"} size="sm">
                  <IconSortDescending size={18} className="mr-1" /> New
                </Button>
              </Link>
              <Link href="/posts?sort=top">
                <Button variant={sort === "top" ? "default" : "outline"} size="sm">
                  <IconTrendingUp size={18} className="mr-1" /> Top
                </Button>
              </Link>
            </div>
            <Link href={"/posts/create"}>
              <Button className="cursor-pointer">
                <IconPencil />
                Create Post
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No posts found.
        </div>
      ) : (
        <InfinitePostList
          initialPosts={posts}
          initialCursor={nextCursor}
          initialVoteStates={initialVoteStates}
          sort={sort}
        />
      )}
    </div>
  );
}
