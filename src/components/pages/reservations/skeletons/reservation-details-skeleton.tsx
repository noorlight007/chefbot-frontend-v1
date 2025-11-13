const ReservationDetailsSkeleton = () => {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="relative h-48 w-full animate-pulse rounded-t-lg bg-gradient-to-b from-sidebar-accent to-sidebar">
        <div className="absolute left-4 top-4">
          <div className="h-8 w-8 rounded-full bg-white/20" />
        </div>
        <div className="absolute right-4 top-4">
          <div className="h-8 w-8 rounded-full bg-white/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="min-h-[50px] min-w-[50px] rounded-lg bg-gray-300 md:min-h-[80px] md:min-w-[80px]" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-48 rounded bg-gray-300" />
                  <div className="h-4 w-16 rounded bg-gray-300" />
                </div>
                <div className="h-4 w-32 rounded bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="pt-6">
        <div className="grid gap-6">
          {/* Guest Info Section */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* Date/Time/Party Size Section */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-4 w-28 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* Table/Menu Section */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-4">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-full rounded bg-gray-200" />
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-full rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsSkeleton;
