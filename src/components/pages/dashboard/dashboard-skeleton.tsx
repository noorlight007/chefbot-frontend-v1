import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FC } from "react";

const DashboardSkeleton: FC = () => {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <div className="h-6 sm:h-8 w-36 sm:w-48 rounded bg-gray-300" />
        <div className="h-8 sm:h-10 w-[150px] sm:w-[200px] rounded bg-gray-300" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Reservation today card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 bg-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex items-baseline">
              <Skeleton className="h-7 sm:h-9 w-12 sm:w-16 bg-gray-300" />
              <Skeleton className="ml-2 h-4 sm:h-5 w-16 sm:w-20 bg-gray-300" />
            </div>
          </CardContent>
        </Card>

        {/* Next reservation card skeleton */}
        <Card className="col-span-1 sm:col-span-2">
          <CardHeader>
            <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 bg-gray-300" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-auto h-20 sm:h-24 w-full max-w-[256px] bg-gray-300" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 sm:mt-6">
        {/* Sales Level card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Skeleton className="h-7 sm:h-9 w-24 sm:w-32 bg-gray-300" />
              <Skeleton className="mt-3 sm:mt-4 h-3 sm:h-4 w-full bg-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Promotions Section skeleton */}
      <div className="mt-6 sm:mt-8 md:mt-10">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <Skeleton className="h-6 sm:h-7 w-32 sm:w-40 bg-gray-300" />
          <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 rounded bg-gray-300" />
        </div>

        <Card>
          <CardContent>
            <Skeleton className="mx-auto h-20 sm:h-24 w-full max-w-[256px] bg-gray-300" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
