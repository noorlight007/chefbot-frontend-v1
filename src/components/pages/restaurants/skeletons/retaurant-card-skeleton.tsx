import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RestaurantCardSkeleton: FC = () => {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-6 w-3/4" />
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-4 border-t bg-gray-50 p-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
};

export default RestaurantCardSkeleton;
