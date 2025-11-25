import { FC } from "react";
const MenuDetailsSkeleton: FC = () => {
  return (
    <div>
      <div>
        {/* Compact single-row header skeleton */}
        <div className="h-20 w-full animate-pulse bg-gray-200">
          <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-4">
            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-40 rounded bg-gray-300"></div>
              <div className="h-4 w-60 rounded bg-gray-300"></div>
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
