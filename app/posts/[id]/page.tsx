import PostCommentActionBar from "@/components/comment/PostCommentActionBar";
import { CommentTree } from "@/components/posts/CommentTree";
import PostCard from "@/components/posts/PostCard";
import { fetchComments, fetchPostJoinAuthorRow } from "@/lib/actions/data";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const postRes = await fetchPostJoinAuthorRow(id);
  if (!postRes.is_success) {
    return <>No Post</>;
  }
  const post = postRes.data;
  const commentsRes = await fetchComments(id);

  return (
    <div className="flex flex-col gap-y-5">
      <PostCard post={post}>
        <PostCommentActionBar post={post} isVoted={1} />
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
