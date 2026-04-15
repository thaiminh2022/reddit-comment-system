"use client";

import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export default function CreateComment() {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
    </>
  );
}
