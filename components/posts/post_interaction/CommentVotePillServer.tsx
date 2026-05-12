import { getCommentVoteState } from "@/lib/actions/updownvote";
import { CommentVotePill } from "./CommentVotePill";

interface Props {
  commentId: string;
  score: number;
}

export default async function CommentVotePillServer({
  commentId,
  score,
}: Props) {
  const voteStateRes = await getCommentVoteState(commentId);

  if (!voteStateRes.is_success) {
    return <>Cannot fetch vote: {voteStateRes.message}</>;
  }
  return (
    <>
      <CommentVotePill
        voteState={voteStateRes.data}
        commentId={commentId}
        score={score}
      />
    </>
  );
}
