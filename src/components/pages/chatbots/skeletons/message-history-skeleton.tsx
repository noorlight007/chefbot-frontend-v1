"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const MessageHistorySkeleton = () => {
  return (
    <div className="flex h-[80dvh] rounded-md border-4 border-sidebar-accent">
      {/* Sidebar skeleton */}
      <div className="w-80 border-r border-sidebar-accent bg-sidebar p-4">
        <Skeleton className="mb-4 h-7 w-40" />
        <ScrollArea className="h-[calc(80dvh-4rem)]">
          <div className="space-y-2 pr-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="border-0 p-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="mt-2 h-4 w-full" />
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area skeleton */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
};

export default MessageHistorySkeleton;
