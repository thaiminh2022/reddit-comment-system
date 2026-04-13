import { FullComment } from "@/types/posts";
import { CommentCard } from "./CommentCard";

interface CommentTreeProps {
  comments: FullComment[];
}

export const CommentTree: React.FC<CommentTreeProps> = ({ comments }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Discussion</h2>
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
