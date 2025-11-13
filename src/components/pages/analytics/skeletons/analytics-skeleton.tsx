const LoadingHeatmap = () => (
  <div className="w-full rounded-xl p-6 ">
    <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="h-10 w-full animate-pulse rounded bg-gray-200 lg:w-[300px]"></div>
    </div>
    <div className="grid grid-cols-1 gap-6">
      <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200"></div>
      <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200"></div>
    </div>
  </div>
);
export default LoadingHeatmap;