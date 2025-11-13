import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersTableSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
      </div>

      {/* Mobile card skeletons */}
      <div className="mt-8 block space-y-4 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="ml-4 h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="mt-8 hidden md:block">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-sidebar/80">
              <TableRow>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24 bg-white/20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px] bg-sidebar/20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px] bg-sidebar/20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] bg-sidebar/20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] bg-sidebar/20" />
                  </TableCell>
                  <TableCell className="flex items-center justify-center">
                    <Skeleton className="h-6 w-6 rounded-full bg-sidebar/20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
