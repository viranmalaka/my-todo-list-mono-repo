import { Skeleton } from "@/components/ui/skeleton";

export const TodoSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-20 w-3/4" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start gap-4 p-4 rounded-xl border bg-card">
        <Skeleton className="w-4 h-4 mt-0.5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
