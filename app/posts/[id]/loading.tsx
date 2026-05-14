import CommentLoadingSkeleton from "@/components/posts/post_interaction/CommentLoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      <div className="rounded-none bg-card py-4 text-card-foreground ring-1 ring-foreground/10">
        <div className="space-y-3 px-4 pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-3 w-14 rounded-md" />
          </div>
          <Skeleton className="h-6 w-8/12 rounded-md" />
        </div>

        <div className="space-y-2 px-4 py-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-10/12 rounded-md" />
          <Skeleton className="h-4 w-6/12 rounded-md" />
        </div>

        <div className="mt-2 flex items-center gap-2 border-t border-border px-4 pt-4">
          <Skeleton className="h-[38px] w-32 rounded-full" />
          <Skeleton className="h-[38px] w-20 rounded-full" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-xl rounded-full" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <CommentLoadingSkeleton />
    </div>
  );
}
