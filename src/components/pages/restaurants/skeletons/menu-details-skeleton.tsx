import { FC } from "react";
const MenuDetailsSkeleton: FC = () => {
  return (
    <div>
      <div>
        {/* Hero Section Skeleton */}
        <div className="relative h-48 w-full animate-pulse rounded-t-lg bg-gray-200">
          <div className="absolute left-4 top-4">
            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gray-300/30 p-4">
            <div className="flex items-center gap-4">
              <div className="min-h-[50px] min-w-[50px] rounded-lg bg-gray-300 md:min-h-[80px] md:min-w-[80px]"></div>
              <div className="space-y-2">
                <div className="h-6 w-40 rounded bg-gray-300"></div>
                <div className="h-4 w-60 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Price and Category Skeleton */}
          <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-24 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded bg-gray-200"></div>
              <div className="h-6 w-20 rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Ingredients Skeleton */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 h-6 w-32 rounded bg-gray-200"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-24 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>

          {/* Allergens Skeleton */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 h-6 w-32 rounded bg-gray-200"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-6 w-24 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>

          {/* Macronutrients Skeleton */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 h-6 w-48 rounded bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="h-4 w-12 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Upselling Skeleton */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 h-6 w-48 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetailsSkeleton;
