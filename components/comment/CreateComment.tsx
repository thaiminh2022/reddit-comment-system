"use client";

import CommentReplyBox from "../CommentReplyBox";
import { Button } from "../ui/button";

interface Props {
  replyTo?: string;
  onSubmit?: () => void;
  getClicked: () => boolean;
  setClicked: (value: boolean) => void;
}

export default function CreateComment({
  replyTo,
  onSubmit,
  getClicked,
  setClicked,
}: Props) {
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
            onSubmit={onSubmit}
            replyTo={replyTo}
            onCancel={() => setClicked(false)}
          />
        )}
      </div>
    </>
  );
}
