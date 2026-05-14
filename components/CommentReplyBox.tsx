"use client";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Field, FieldContent, FieldTitle } from "./ui/field";
import { Textarea } from "./ui/textarea";
import { IconLoader2 } from "@tabler/icons-react";

interface Props {
  replyTo?: string;
  onCancel?: () => void;
  submitAction: (formData: FormData) => void | Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      className="cursor-pointer rounded-lg min-w-[80px]" 
      type="submit" 
      disabled={pending}
    >
      {pending ? <IconLoader2 className="animate-spin" size={18} /> : "Submit"}
    </Button>
  );
}

export default function CommentReplyBox(props: Props) {
  return (
    <form action={props.submitAction} className="flex flex-col gap-y-3">
      <Field>
        <FieldTitle hidden={props.replyTo === undefined}>
          Replying to {props.replyTo}
        </FieldTitle>
        <FieldContent>
          <Textarea 
            className="rounded-xl focus-visible:ring-blue-500" 
            name="content" 
            required 
            placeholder="What are your thoughts?"
          />
        </FieldContent>
      </Field>
      <div className="flex ml-auto gap-x-3">
        <Button
          onClick={props.onCancel}
          type="button"
          variant={"secondary"}
          className="cursor-pointer rounded-lg"
        >
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
