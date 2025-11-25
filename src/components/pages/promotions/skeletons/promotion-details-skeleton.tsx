import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PromotionDetailsSkeleton() {
  return (
    <div>
      {/* Compact single-row header skeleton */}
      <div className="h-20 w-full animate-pulse bg-gray-200">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-[56px] w-[56px] rounded-lg bg-gray-300" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-gray-300" />
              <Skeleton className="h-4 w-32 bg-gray-300" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-300" />
            <div className="h-8 w-8 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>

      <div>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border bg-gray-100 p-4 shadow-sm"
                  >
                    <Skeleton className="h-5 w-5 bg-gray-300" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-300" />
                      <Skeleton className="h-4 w-32 bg-gray-300" />
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-3">
              <Skeleton className="h-8 w-48 bg-gray-300" />
              <div className="space-y-3">
                <div className="rounded-lg border bg-gray-100 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-3">
                    <Skeleton className="h-5 w-5 bg-gray-300" />
                    <Skeleton className="h-4 w-24 bg-gray-300" />
                  </div>
                  <Skeleton className="h-16 w-full bg-gray-300" />
                </div>

                <div className="rounded-lg border bg-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 bg-gray-300" />
                      <Skeleton className="h-4 w-32 bg-gray-300" />
                    </div>
                    <Skeleton className="h-5 w-5 bg-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
