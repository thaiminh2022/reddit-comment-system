import CommentLoadingSkeleton from "@/components/posts/post_interaction/CommentLoadingSkeleton";
import { CommentTree } from "@/components/posts/post_interaction/CommentTree";
import PostCommentActionBar from "@/components/posts/post_interaction/PostCommentActionBar";
import PostCommentSortDropdown from "@/components/posts/post_interaction/PostCommentSortDropdown";
import PostCommentsView from "@/components/posts/post_interaction/PostCommentsView";
import PostCard from "@/components/posts/PostCard";
import PostSortDropdown from "@/components/posts/PostSortDropdown";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  fetchComments,
  fetchPostJoinAuthorRow,
  searchComments,
} from "@/lib/actions/data";
import { getPostVoteState } from "@/lib/actions/updownvote";
import { parseCommentSort } from "@/lib/comments/sort";
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
      <PostCard post={post}>
        <PostCommentActionBar post={post} voteState={voteState} />
      </PostCard>

      <Link href={"/posts"}>
        <Button variant={"link"}>Back to posts</Button>
      </Link>

      <div className="flex justify-between w-full">
        <SearchBar
          placeholder="Search comments..."
          className="w-full max-w-xl"
        />
        <PostCommentSortDropdown value={sort} />
      </div>

      <Suspense fallback={<CommentLoadingSkeleton />}>
        <PostCommentsView search={search} postId={id} sort={sort} />
      </Suspense>
    </div>
  );
}
