import { searchComments, fetchComments } from "@/lib/actions/data";
import { CommentTree } from "./CommentTree";
import { CommentSort } from "@/lib/comments/sort";
import InfiniteCommentList from "./InfiniteCommentList";

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
  if (search) {
    const commentsRes = await searchComments(postId, search, sort);
    return (
      <>
        {commentsRes.is_success && (
          <CommentTree
            postId={postId}
            comments={commentsRes.data}
            sort={sort}
            isSearch={true}
          />
        )}
        {!commentsRes.is_success && (
          <div className="rounded-md p-2 bg-red-100 text-red-600 text-sm">
            Error searching comments: {commentsRes.message}
          </div>
        )}
      </>
    );
  }

  const commentsRes = await fetchComments(postId, sort);

  return (
    <div className="bg-white">
      {commentsRes.is_success ? (
        <InfiniteCommentList
          postId={postId}
          initialComments={commentsRes.data.comments}
          initialCursor={commentsRes.data.nextCursor}
          sort={sort}
        />
      ) : (
        <div className="rounded-md p-2 bg-red-100 text-red-600 text-sm">
          Error fetching comments: {commentsRes.message}
        </div>
      )}
    </div>
  );
}
