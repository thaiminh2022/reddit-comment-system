import { CommentRoot } from "@/types/posts";
import { CommentCard } from "./CommentCard";

interface CommentTreeProps {
  postId: string;
  comments: CommentRoot[];
  isSearch?: boolean;
}

export async function CommentTree({
  postId,
  comments,
  isSearch = false,
}: CommentTreeProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">
        {isSearch ? "Search Results" : "Discussion"}
      </h2>
      {comments.length === 0 && isSearch && (
        <div className="text-center py-10 text-muted-foreground">
          No comments found matching your search.
        </div>
      )}
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          postId={postId}
          comment={comment}
          hideReplies={isSearch}
        />
      ))}
    </div>
  );
}
