import { FC } from "react";
const ChatbotDetailsSkeleton: FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header skeleton (compact) */}
      <div className="h-20 w-full animate-pulse bg-gray-200" />

      <div className="mx-auto w-full space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="rounded-lg border p-6">
          <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-full rounded-lg border p-6">
          <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDetailsSkeleton;
