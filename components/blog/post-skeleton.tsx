"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div className="space-y-10">
      {/* Banner skeleton */}
      <div className="-mx-4 md:-mx-6 relative h-[50vh] min-h-[400px] max-h-[600px]">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="text-center space-y-4">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-12 w-full max-w-3xl mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>

        <div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
}
