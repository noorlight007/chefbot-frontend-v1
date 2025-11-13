import { FC } from "react";
const TableDetailSkeleton: FC = () => {
  return (
    <div>
      {/* Hero Section Skeleton */}
      <div className="relative h-48 w-full animate-pulse rounded-t-lg bg-gray-200">
        <div className="absolute left-4 top-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 p-2"></div>
        </div>
        <div className="absolute right-4 top-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 p-2"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gray-200/50 p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="min-h-[50px] min-w-[50px] animate-pulse rounded-lg bg-gray-300 md:min-h-[80px] md:min-w-[80px]"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Table Details Skeleton */}
        <div className="mb-4 space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 p-2"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 p-2"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 p-2"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 p-2"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetailSkeleton;
