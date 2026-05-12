"use client";
import { Button } from "./ui/button";
import { Field, FieldContent, FieldTitle } from "./ui/field";
import { Textarea } from "./ui/textarea";

interface Props {
  replyTo?: string;
  onCancel?: () => void;
  submitAction: (formData: FormData) => void | Promise<void>;
}

export default function CommentReplyBox(props: Props) {
  return (
    <form action={props.submitAction} className="flex flex-col gap-y-3">
      <Field>
        <FieldTitle hidden={props.replyTo === undefined}>
          Replying to {props.replyTo}
        </FieldTitle>
        <FieldContent>
          <Textarea className="rounded-xl" name="content" required />
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
        <Button className="cursor-pointer rounded-lg" type="submit">
          Submit
        </Button>
      </div>
    </form>
  );
}
