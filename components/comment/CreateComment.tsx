"use client";

import { CardAction } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface Props {
  clicked: boolean;
  setClicked: (newValue: boolean) => void;
}

export default function CreateComment({ clicked, setClicked }: Props) {
  return (
    <>
      <div className="mx-3">
        <Button
          variant={"outline"}
          type="button"
          hidden={clicked}
          onClick={() => setClicked(true)}
          className="w-full cursor-pointer rounded-full"
        >
          Join the conversation
        </Button>
        <form hidden={!clicked} className="flex flex-col gap-y-3">
          <Textarea placeholder="Join the conversation" />
          <CardAction className="ml-auto">
            <Button variant="outline" onClick={() => setClicked(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </CardAction>
        </form>
      </div>
    </>
  );
}
