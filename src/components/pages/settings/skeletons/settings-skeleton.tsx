import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsSkeleton() {
  return (
    <div>
      <div>
        {/* Hero Section */}
        <div className="relative h-48 w-full rounded-t-lg bg-gray-200">
          <div className="absolute left-4 top-4">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gray-100/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="min-h-[50px] min-w-[50px] rounded-lg bg-gray-300 md:min-h-[80px] md:min-w-[80px]" />
              <Skeleton className="h-8 w-32 bg-gray-300" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
            <div className="mb-8 flex items-start justify-between border-b pb-6">
              <Skeleton className="h-8 w-48 bg-gray-300" />
            </div>

            <div className="flex flex-col gap-8 md:flex-row">
              <div className="w-full md:w-1/4">
                <Skeleton className="aspect-square w-full rounded-2xl bg-gray-300" />
              </div>

              <div className="grid w-full grid-cols-1 gap-6 md:w-2/3 md:grid-cols-2">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-lg bg-gray-50 p-4 ${
                      index === 4 ? "col-span-full" : ""
                    }`}
                  >
                    <Skeleton className="mb-2 h-4 w-24 bg-gray-300" />
                    <Skeleton className="h-6 w-32 bg-gray-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end">
              <Skeleton className="h-12 w-32 rounded-lg bg-gray-300" />
            </div>
          </div>

          <div className="my-8 h-px bg-gray-200" />

          <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48 bg-gray-300" />
              <Skeleton className="h-12 w-32 rounded-lg bg-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
