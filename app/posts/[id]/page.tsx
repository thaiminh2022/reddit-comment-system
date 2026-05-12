import { CommentTree } from "@/components/posts/post_interaction/CommentTree";
import PostCommentActionBar from "@/components/posts/post_interaction/PostCommentActionBar";
import PostCard from "@/components/posts/PostCard";
import SearchBar from "@/components/SearchBar";
import { fetchComments, fetchPostJoinAuthorRow, searchComments } from "@/lib/actions/data";
import { getPostVoteState } from "@/lib/actions/updownvote";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : undefined;

  const postRes = await fetchPostJoinAuthorRow(id);
  if (!postRes.is_success) {
    return <>No Post</>;
  }
  const post = postRes.data;

  // Fetch comments based on whether there's a search query
  const commentsRes = search
    ? await searchComments(id, search)
    : await fetchComments(id);

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

      <div className="px-4">
        <SearchBar placeholder="Search comments..." className="max-w-md" />
      </div>

      {commentsRes.is_success && (
        <CommentTree
          postId={id}
          comments={commentsRes.data}
          isSearch={!!search}
        />
      )}
      {!commentsRes.is_success && (
        <div className="rounded-md p-2  bg-red-100">
          Error fetching comments: {commentsRes.message}
        </div>
      )}
    </div>
  );
}
