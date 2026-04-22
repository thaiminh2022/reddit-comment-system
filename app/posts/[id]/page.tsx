import PostCommentActionBar from "@/components/comment/PostCommentActionBar";
import { CommentTree } from "@/components/posts/CommentTree";
import PostCard from "@/components/posts/PostCard";
import { fetchComments, fetchPost } from "@/lib/data";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const post = fetchPost(id);
  if (post === null) {
    return <>No Post</>;
  }

  const comments = fetchComments(id);

  return (
    <div className="flex flex-col gap-y-5">
      <PostCard post={post}>
        <PostCommentActionBar post={post} />
      </PostCard>
      <CommentTree comments={comments} />
    </div>
  );
}
