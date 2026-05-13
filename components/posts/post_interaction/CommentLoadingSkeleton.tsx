import { Skeleton } from "@/components/ui/skeleton";

export default function CommentLoadingSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-6">
        <CommentSkeleton />
        <CommentSkeleton nested />
        <CommentSkeleton />
        <CommentSkeleton nested />
      </div>
    </div>
  );
}

function CommentSkeleton({ nested = false }: { nested?: boolean }) {
  return (
    <div className={nested ? "ml-8 border-l pl-4" : ""}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-20 w-px" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
