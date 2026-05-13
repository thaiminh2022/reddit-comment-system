import type { CommentSort } from "@/lib/comments/sort";
import { CommentRoot } from "@/types/posts";
import { CommentCard } from "./CommentCard";

interface Props {
  postId: string;
  comments: CommentRoot[];
  sort: CommentSort;
  isSearch?: boolean;
}

export async function CommentTree({
  postId,
  comments,
  sort,
  isSearch = false,
}: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">
        {isSearch ? "Search Results" : "Discussion"}
      </h2>
      {comments.length === 0 && isSearch && (
        <div className="rounded-md border border-dashed py-12 text-center">
          <p className="text-sm font-medium text-gray-900">
            No matching comments
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a shorter search term or clear the search field.
          </p>
        </div>
      )}
      {comments.length === 0 && !isSearch && (
        <div className="rounded-md border border-dashed py-12 text-center">
          <p className="text-sm font-medium text-gray-900">No comments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start the discussion with the first reply.
          </p>
        </div>
      )}
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          postId={postId}
          comment={comment}
          sort={sort}
          hideReplies={isSearch}
        />
      ))}
    </div>
  );
}
