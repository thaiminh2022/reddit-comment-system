"use client";

import { createComment } from "@/lib/actions/data";
import CommentReplyBox from "./CommentReplyBox";
import { Button } from "./ui/button";

interface Props {
  postId: string;
  parentId?: string | null;
  replyTo?: string;
  getClicked: () => boolean;
  setClicked: (value: boolean) => void;
}

export default function CreateComment({
  postId,
  parentId = null,
  replyTo,
  getClicked,
  setClicked,
}: Props) {
  const submitAction = async (formData: FormData) => {
    await createComment(postId, parentId, formData);
    setClicked(false);
  };

  return (
    <>
      <div className="mx-3">
        <Button
          variant={"outline"}
          type="button"
          hidden={getClicked() || replyTo != undefined}
          onClick={() => setClicked(true)}
          className="w-full cursor-pointer rounded-full"
        >
          Join the conversation
        </Button>
        {getClicked() && (
          <CommentReplyBox
            submitAction={submitAction}
            replyTo={replyTo}
            onCancel={() => setClicked(false)}
          />
        )}
      </div>
    </>
  );
}
