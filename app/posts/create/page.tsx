import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  return (
    <>
      <h1>Create a new post</h1>
      <form className="flex flex-col mt-3 gap-y-3">
        <Field>
          <FieldLabel htmlFor="post-title">
            Title <span className="text-red-600">*</span>
          </FieldLabel>
          <Input id="post-title" placeholder="A beautiful title" required />
        </Field>
        <Field className="">
          <FieldLabel htmlFor="post-content">Content</FieldLabel>
          <Textarea
            id="post-content"
            placeholder="A beautiful title"
            className="min-h-36"
          />
        </Field>
        <div className="ml-auto flex gap-x-3">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </>
  );
}
