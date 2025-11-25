import { FC } from "react";
const TableDetailSkeleton: FC = () => {
  return (
    <div>
      {/* Compact single-row header skeleton */}
      <div className="h-20 w-full animate-pulse bg-gray-200">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="min-h-[48px] min-w-[48px] animate-pulse rounded-lg bg-gray-300 md:min-h-[64px] md:min-w-[64px]"></div>
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 p-2"></div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 p-2"></div>
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
