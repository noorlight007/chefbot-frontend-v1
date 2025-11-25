export default function PromotionReportsSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="relative h-32 w-full animate-pulse rounded-t-lg bg-gradient-to-r">
        <div className="absolute left-4 top-4">
          <div className="h-8 w-8 rounded-full bg-white/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-sidebar/30 p-4 backdrop-blur-sm">
          <div className="h-8 w-48 animate-pulse rounded bg-white/30" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-4 shadow">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-10 w-20 animate-pulse rounded bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Search skeleton */}
      <div className="mt-8">
        <div className="mb-4 flex w-full items-center justify-between">
          <div className="flex flex-1 items-center">
            <div className="mr-2 h-5 w-5 animate-pulse rounded bg-gray-300" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full">
            <thead className="bg-sidebar/80">
              <tr>
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-5 w-24 animate-pulse rounded bg-white/40" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
