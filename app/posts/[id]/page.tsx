import { CommentTree } from "@/components/posts/post_interaction/CommentTree";
import PostCommentActionBar from "@/components/posts/post_interaction/PostCommentActionBar";
import PostCard from "@/components/posts/PostCard";
import { fetchComments, fetchPostJoinAuthorRow } from "@/lib/actions/data";
import { getPostVoteState } from "@/lib/actions/updownvote";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const postRes = await fetchPostJoinAuthorRow(id);
  if (!postRes.is_success) {
    return <>No Post</>;
  }
  const post = postRes.data;
  const commentsRes = await fetchComments(id);

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
      {commentsRes.is_success && (
        <CommentTree postId={id} comments={commentsRes.data} />
      )}
      {!commentsRes.is_success && (
        <div className="rounded-md p-2  bg-red-100">
          Error fetching comments: {commentsRes.message}
        </div>
      )}
    </div>
  );
}
