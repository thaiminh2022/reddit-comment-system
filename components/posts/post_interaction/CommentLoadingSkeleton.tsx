import { Skeleton } from "@/components/ui/skeleton";

const rows = [
  { width: "w-11/12", depth: 0, replies: 2 },
  { width: "w-8/12", depth: 1, replies: 1 },
  { width: "w-10/12", depth: 1, replies: 0 },
  { width: "w-9/12", depth: 0, replies: 1 },
];

export default function CommentLoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-card py-4 text-card-foreground ring-1 ring-border">
      <div className="mb-6 flex items-center justify-between px-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-3 w-44 rounded-md" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full delay-75" />
          <Skeleton className="h-2 w-2 rounded-full delay-150" />
        </div>
      </div>

      <div className="px-4">
        <div className="space-y-5">
          {rows.map((row, index) => (
            <CommentRowSkeleton
              key={`${row.depth}-${row.width}-${index}`}
              depth={row.depth}
              replies={row.replies}
              width={row.width}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentRowSkeleton({
  depth,
  replies,
  width,
}: {
  depth: number;
  replies: number;
  width: string;
}) {
  return (
    <div className={depth > 0 ? "ml-8 md:ml-10" : ""}>
      <div className="flex gap-3">
        <div className="flex w-7 shrink-0 flex-col items-center">
          <Skeleton className="h-7 w-7 rounded-full" />
          {replies > 0 && <Skeleton className="mt-2 h-16 w-px" />}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
          <Skeleton className={`h-4 ${width} rounded-md`} />
          <Skeleton className="h-4 w-7/12 rounded-md" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
