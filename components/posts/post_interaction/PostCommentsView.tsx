import { searchComments, fetchComments } from "@/lib/actions/data";
import { CommentTree } from "./CommentTree";
import { CommentSort } from "@/lib/comments/sort";

interface Props {
  search?: string;
  postId: string;
  sort: CommentSort;
}

export default async function PostCommentsView({
  search,
  postId,
  sort,
}: Props) {
  // Fetch comments based on whether there's a search query
  const commentsRes = search
    ? await searchComments(postId, search, sort)
    : await fetchComments(postId, sort);

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
