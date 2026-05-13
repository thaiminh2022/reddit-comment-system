import { searchComments, fetchComments } from "@/lib/actions/data";
import { CommentTree } from "./CommentTree";

interface Props {
  search?: string;
  postId: string;
}

export default async function PostCommentsView({ search, postId }: Props) {
  // Fetch comments based on whether there's a search query
  const commentsRes = search
    ? await searchComments(postId, search)
    : await fetchComments(postId);

  return (
    <>
      {commentsRes.is_success && (
        <CommentTree
          postId={postId}
          comments={commentsRes.data}
          isSearch={search != undefined && search != ""}
        />
      )}
      {!commentsRes.is_success && (
        <div className="rounded-md p-2  bg-red-100">
          Error fetching comments: {commentsRes.message}
        </div>
      )}
    </>
  );
}
