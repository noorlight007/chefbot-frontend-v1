import { ArrowLeft, MoreVertical } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { CardContent } from "@/components/ui/card"

export default function PromotionDetailsSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="relative h-48 w-full rounded-t-lg bg-gradient-to-r from-gray-700 to-gray-800">
        <div className="absolute left-4 top-4">
          <button className="rounded-full bg-gray-600/20 p-2">
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
        </div>
        <div className="absolute right-4 top-4">
          <button className="rounded-full bg-gray-600/20 p-2">
            <MoreVertical size={20} className="text-gray-300" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gray-700/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="bg-gray-300    h-[80px] w-[80px] rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="bg-gray-300    h-8 w-48" />
                <Skeleton className="bg-gray-300    h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border bg-gray-100 p-4 shadow-sm">
                  <Skeleton className="bg-gray-300    h-5 w-5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="bg-gray-300    h-4 w-24" />
                    <Skeleton className="bg-gray-300    h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Skeleton className="bg-gray-300    h-8 w-48" />
              <div className="space-y-3">
                <div className="rounded-lg border bg-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="bg-gray-300    h-5 w-5" />
                    <Skeleton className="bg-gray-300    h-4 w-24" />
                  </div>
                  <Skeleton className="bg-gray-300    h-16 w-full" />
                </div>

                <div className="rounded-lg border bg-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="bg-gray-300    h-5 w-5" />
                      <Skeleton className="bg-gray-300    h-4 w-32" />
                    </div>
                    <Skeleton className="bg-gray-300    h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
