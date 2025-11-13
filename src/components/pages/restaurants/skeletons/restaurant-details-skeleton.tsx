"use client";

import { FC } from "react";

const RestaurantDetailsSkeleton: FC = () => {
  return (
    <div className="animate-pulse">
      <div className="relative h-48 w-full rounded-t-lg bg-gray-200">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-4">
            <div className="min-h-[50px] min-w-[50px] rounded-lg bg-gray-300 md:min-h-[80px] md:min-w-[80px]"></div>
            <div>
              <div className="h-7 w-48 rounded bg-gray-300"></div>
              <div className="mt-2 h-4 w-64 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-200"></div>
          ))}
        </div>

        <div className="mb-4 h-24 rounded-lg bg-gray-200"></div>

        <div className="rounded-lg bg-gray-200 p-3">
          <div className="mb-3 h-6 w-32 rounded bg-gray-300"></div>
          <div className="grid gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-10 rounded-md bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailsSkeleton;
