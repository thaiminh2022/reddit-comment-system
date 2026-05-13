import CommentLoadingSkeleton from "@/components/posts/post_interaction/CommentLoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-y-5">
      <Skeleton className="h-9 w-32" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-xl rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      <CommentLoadingSkeleton />
    </div>
  );
}
