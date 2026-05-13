import LogoutButton from "@/components/LogoutButton";
import InfinitePostList from "@/components/posts/InfinitePostList";
import PostSortDropdown from "@/components/posts/PostSortDropdown";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchPostJoinAuthorRows } from "@/lib/actions/data";
import { parsePostSort } from "@/lib/posts/sort";
import { getPostVoteStates } from "@/lib/actions/updownvote";
import {
  IconPencil,
  IconSortDescending,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import PostLoadingSkeleton from "@/components/posts/PostLoadingSkeleton";
import PostRowDisplay from "@/components/posts/PostsRowDisplay";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sort = parsePostSort(params.sort);
  const search = typeof params.q === "string" ? params.q : undefined;

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
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <div className="flex justify-between items-center w-full md:w-auto gap-4">
              <Link href={"/posts/create"}>
                <Button className="cursor-pointer">
                  <IconPencil />
                  Create Post
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <SearchBar placeholder="Search posts..." className="w-full md:w-1/2" />
        <PostSortDropdown value={sort} />
      </div>
      <Suspense
        key={`${sort}-${search ?? ""}`}
        fallback={<PostLoadingSkeleton />}
      >
        <PostRowDisplay sort={sort} search={search} />
      </Suspense>
    </div>
  );
}
