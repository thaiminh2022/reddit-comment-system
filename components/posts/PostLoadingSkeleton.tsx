import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardAction,
  CardDescription,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function PostLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-y-5">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-7 w-3/4" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="w-full h-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter>
        <CardAction className="flex w-full gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </CardAction>
      </CardFooter>
    </Card>
  );
}
