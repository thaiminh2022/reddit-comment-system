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
    <>
      Loading posts....
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}
function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="w-3/4" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="w-full h-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton />
      </CardContent>
      <CardFooter>
        <CardAction className="w-full">
          <Skeleton className="w-full h-4" />
        </CardAction>
      </CardFooter>
    </Card>
  );
}
