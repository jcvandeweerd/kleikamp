import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ItemCardSkeleton() {
  return (
    <Card className="animate-pulse border-transparent bg-white/80">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}
