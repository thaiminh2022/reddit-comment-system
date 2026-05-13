"use client";

import { createComment } from "@/lib/actions/data";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CommentReplyBox from "./CommentReplyBox";
import { Button } from "./ui/button";

interface Props {
  postId: string;
  parentId?: string | null;
  replyTo?: string;
  getClicked?: () => boolean;
  setClicked?: (value: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateComment({
  postId,
  parentId = null,
  replyTo,
  getClicked: externalGetClicked,
  setClicked: externalSetClicked,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [internalClicked, setInternalClicked] = useState(false);

  const isClicked = externalGetClicked ? externalGetClicked() : internalClicked;
  const setIsClicked = (val: boolean) => {
    if (externalSetClicked) {
      externalSetClicked(val);
    } else {
      setInternalClicked(val);
    }
  };

  const submitAction = async (formData: FormData) => {
    const res = await createComment(postId, parentId, formData);

    if (res.is_success) {
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
      setIsClicked(false);
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } else {
      toast.error(res.message || "Failed to post comment");
    }
  };

  return (
    <>
      <div className={parentId ? "" : "mx-0"}>
        {!isClicked && !replyTo && (
          <Button
            variant={"outline"}
            type="button"
            onClick={() => setIsClicked(true)}
            className="h-12 w-full cursor-pointer justify-start rounded-lg border-border px-4 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            What are your thoughts?
          </Button>
        )}
        {isClicked && (
          <CommentReplyBox
            submitAction={submitAction}
            replyTo={replyTo}
            onCancel={() => setIsClicked(false)}
          />
        )}
      </div>
    </>
  );
}
