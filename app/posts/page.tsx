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
import { IconPencil, IconSortDescending, IconTrendingUp } from "@tabler/icons-react";
import Link from "next/link";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const sort = parsePostSort(params.sort);
    const search = typeof params.q === "string" ? params.q : undefined;
    const pageSize = 10;

    // Fetch initial posts on the server using cursor-based logic
    const postsRes = await fetchPostJoinAuthorRows(undefined, pageSize, sort, search);
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
                    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                        <SearchBar placeholder="Search posts..." className="w-full md:w-1/2" />
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

            <div className="flex justify-end">
                <PostSortDropdown value={sort} />
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    {search ? `No posts matching "${search}"` : "No posts found."}
                </div>
            ) : (
                <InfinitePostList
                    initialPosts={posts}
                    initialCursor={nextCursor}
                    initialVoteStates={initialVoteStates}
                    sort={sort}
                    search={search}
                />
            )}
        </div>
    );
}
