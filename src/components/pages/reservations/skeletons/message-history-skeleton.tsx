import { Card } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { FC } from "react";
const MessageHistorySkeleton: FC = () => {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="animate-pulse border-t-4 border-primary p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="h-8 w-48 rounded-lg bg-gray-200" />
          </div>
          <div className="h-5 w-24 rounded-md bg-gray-200" />
        </div>

        <ScrollArea className="h-[70vh] rounded-lg pr-4">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-start">
                <div className="group flex max-w-[80%] items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="w-64 rounded-2xl rounded-tl-none bg-gray-200 p-4">
                    <div className="mb-2 h-4 w-full rounded bg-gray-300" />
                    <div className="h-4 w-3/4 rounded bg-gray-300" />
                    <div className="mt-2 h-3 w-24 rounded bg-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default MessageHistorySkeleton;
