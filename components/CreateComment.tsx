"use client";

import { createComment } from "@/lib/actions/data";
import CommentReplyBox from "./CommentReplyBox";
import { Button } from "./ui/button";
import { toast } from "sonner";

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
    const res = await createComment(postId, parentId, formData);
    
    if (res.is_success) {
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
      setClicked(false);
    } else {
      toast.error(res.message || "Failed to post comment");
    }
  };

  return (
    <>
      <div className="mx-3">
        <Button
          variant={"outline"}
          type="button"
          hidden={getClicked() || replyTo != undefined}
          onClick={() => setClicked(true)}
          className="w-full cursor-pointer rounded-full border-gray-300 hover:bg-gray-50 text-gray-500 justify-start px-4"
        >
          Add a comment
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
