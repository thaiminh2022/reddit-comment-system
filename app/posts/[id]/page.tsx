import CommentLoadingSkeleton from "@/components/posts/post_interaction/CommentLoadingSkeleton";
import PostCommentActionBar from "@/components/posts/post_interaction/PostCommentActionBar";
import PostCommentSortDropdown from "@/components/posts/post_interaction/PostCommentSortDropdown";
import PostCommentsView from "@/components/posts/post_interaction/PostCommentsView";
import PostCard from "@/components/posts/PostCard";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { fetchPostJoinAuthorRow } from "@/lib/actions/data";
import { getPostVoteState } from "@/lib/actions/updownvote";
import { parseCommentSort } from "@/lib/comments/sort";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const sort = parseCommentSort(sParams.sort);
  const search = typeof sParams.q === "string" ? sParams.q : undefined;

  const postRes = await fetchPostJoinAuthorRow(id);
  if (!postRes.is_success) {
    return <>No Post</>;
  }
  const post = postRes.data;

  const voteStateRes = await getPostVoteState(post.id);
  if (!voteStateRes.is_success) {
    return <>Cannot fetch vote state: {voteStateRes.message}</>;
  }

  const voteState = voteStateRes.data;

  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex justify-between">
        <Link href={"/posts"}>
          <Button variant={"link"} className="cursor-pointer text-link">
            <IconArrowLeft />
            Back to posts
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      <PostCard post={post}>
        <PostCommentActionBar post={post} voteState={voteState} />
      </PostCard>

      <div className="flex justify-between w-full">
        <SearchBar
          placeholder="Search comments..."
          className="w-full max-w-xl"
        />
        <PostCommentSortDropdown value={sort} />
      </div>

      <Suspense
        key={`${id}-${sort}-${search ?? ""}`}
        fallback={<CommentLoadingSkeleton />}
      >
        <PostCommentsView search={search} postId={id} sort={sort} />
      </Suspense>
    </div>
  );
}
