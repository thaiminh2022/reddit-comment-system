import { getCommentVoteStates } from "@/lib/actions/updownvote";
import { CommentRoot } from "@/types/posts";
import { CommentCard } from "./CommentCard";

interface CommentTreeProps {
  postId: string;
  comments: CommentRoot[];
}

export async function CommentTree({
  postId,
  comments,
}: CommentTreeProps) {
  const commentIds = collectCommentIds(comments);
  const voteStatesRes = await getCommentVoteStates(commentIds);
  const commentVoteStates = voteStatesRes.is_success ? voteStatesRes.data : {};

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Discussion</h2>
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          postId={postId}
          comment={comment}
          commentVoteStates={commentVoteStates}
        />
      ))}
    </div>
  );
}

function collectCommentIds(comments: CommentRoot[]) {
  const ids: string[] = [];
  const stack = [...comments];

  while (stack.length > 0) {
    const comment = stack.pop();

    if (!comment) continue;

    ids.push(comment.id);
    stack.push(...comment.replies);
  }

  return ids;
}
