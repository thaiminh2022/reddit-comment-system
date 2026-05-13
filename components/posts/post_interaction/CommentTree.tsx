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
    <div className="py-4 bg-white">
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {isSearch ? "Search Results" : "Comments"}
        </h2>
      </div>
      {comments.length === 0 && isSearch && (
        <div className="text-center py-10 text-muted-foreground">
          No comments found matching your search.
        </div>
      )}
      <div className="space-y-1">
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
    </div>
  );
}
