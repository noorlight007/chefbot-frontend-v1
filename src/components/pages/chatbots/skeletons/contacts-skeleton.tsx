import { Skeleton } from "@/components/ui/skeleton";

export const ContactsSkeleton: React.FC = () => {
  return (
    <div className="p-4 lg:p-6">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>

        {/* Search & Download Skeleton */}
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Skeleton className="h-10 w-full lg:w-80 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-32 rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-8 block">
        <div className="overflow-x-auto rounded-md border">
          {/* Table Header */}
          <div className="bg-sidebar/80">
            <div className="grid grid-cols-3 gap-4 px-4 py-3">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md justify-self-center" />
              <Skeleton className="h-5 w-24 rounded-md justify-self-center" />
            </div>
          </div>
          {/* Table Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-4">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-md justify-self-center" />
                <Skeleton className="h-5 w-40 rounded-md justify-self-center" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
};
