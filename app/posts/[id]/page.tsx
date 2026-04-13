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
    <>
      <PostCard post={post} />
      <CommentTree comments={comments} />
    </>
  );
}
