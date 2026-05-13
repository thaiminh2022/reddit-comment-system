"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/actions/data";
import { ActionResState } from "@/types/error_handler";
import { faker } from "@faker-js/faker";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import Link from "next/link";
import { useActionState, useRef } from "react";
import z from "zod";

const initialState: ActionResState<
  null,
  AuthError | PostgrestError | z.ZodError
> = {
  is_success: true,
  data: null,
};

export default function Page() {
  const [state, action, isPending] = useActionState(createPost, initialState);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Create a new post</h1>
          </CardTitle>
          <CardAction>
            <Button
              type="button"
              onClick={() => {
                if (titleRef.current)
                  titleRef.current.value = `[Generated Post] ${faker.lorem.sentence()}`;
                if (contentRef.current)
                  contentRef.current.value = faker.lorem.paragraphs(3);
              }}
            >
              Quick generate
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
      <form className="flex flex-col mt-3 gap-y-3" action={action}>
        <Field>
          <FieldLabel htmlFor="post-title">
            Title <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="post-title"
            placeholder="A beautiful title"
            name="title"
            ref={titleRef}
            required
          />
        </Field>
        <Field className="">
          <FieldLabel htmlFor="post-content">Content</FieldLabel>
          <Textarea
            id="post-content"
            placeholder="A beautiful content"
            className="min-h-36"
            name="content"
            ref={contentRef}
          />
        </Field>
        {!state.is_success && (
          <div className="rounded-md bg-destructive/10 p-2 text-destructive">
            {state.is_success
              ? "Post created successfully!"
              : state.message && `Error creating post: ${state.message}`}
          </div>
        )}

        <div className="ml-auto flex gap-x-3">
          <Link href={"/posts"}>
            <Button type="button" variant={"outline"} disabled={isPending}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
