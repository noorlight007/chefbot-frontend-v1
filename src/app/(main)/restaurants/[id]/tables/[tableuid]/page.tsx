"use client";

import UpdateTable from "@/components/pages/restaurants/modals/update-table";
import TableDetailSkeleton from "@/components/pages/restaurants/skeletons/table-details-skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetSingleTableQuery } from "@/redux/reducers/restaurants-reducer";
import {
  ArrowLeft,
  Circle,
  MapPin,
  MoreVertical,
  Tag,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FC, useState } from "react";

const TableDetails: FC = () => {
  const t = useTranslations("tables.details");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id, tableuid } = useParams<{ id: string; tableuid: string }>();
  const { data, isLoading } = useGetSingleTableQuery({ id, tid: tableuid });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <TableDetailSkeleton />;
  }

  return (
    <div>
      <div>
        {/* Hero Section */}
        <div className="relative h-40 w-full bg-gray-50">
          <div className="absolute left-4 top-4 z-10">
            <button
              onClick={() => window.history.back()}
              className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent"
              aria-label={t("actions.back")}
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
          </div>
          <div className="absolute right-4 top-4 z-10">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div className="cursor-pointer rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent">
                  <MoreVertical size={20} className="text-white" />
                </div>
              </DialogTrigger>
              <DialogContent className="h-[60dvh] max-w-screen-md">
                <DialogTitle className="sr-only">
                  {t("actions.edit")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("actions.edit")}
                </DialogDescription>
                <ScrollArea className="h-full w-full p-2">
                  <UpdateTable table={data} onClose={handleCloseDialog} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src="/restaurant-demo.jpg"
                  alt={t("image.alt")}
                  width={100}
                  height={100}
                  priority={true}
                  loading="eager"
                  className="max-h-[50px] min-h-[50px] min-w-[50px] max-w-[50px] rounded-lg border-2 border-white object-cover shadow-lg md:min-h-[80px] md:min-w-[80px]"
                />
              </div>
              <div className="text-black">
                <h1 className="text-xl font-bold md:text-2xl">{data?.name}</h1>
                <p className="mt-1 text-xs opacity-90 md:text-sm">
                  {t(
                    `category.${data?.category?.toLowerCase() || "notAvailable"}`,
                  )}{" "}
                  {t("category.suffix")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Table Details */}
          <div className="mb-4 space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("information")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 transition-all hover:border-purple-100 hover:bg-purple-50">
                <div className="rounded-full bg-purple-100 p-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("capacity.label")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {data?.capacity} {t("capacity.unit")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 transition-all hover:border-blue-100 hover:bg-blue-50">
                <div className="rounded-full bg-blue-100 p-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("category.label")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {t(
                      `category.${data?.category?.toLowerCase() || "notAvailable"}`,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 transition-all hover:border-orange-100 hover:bg-orange-50">
                <div className="rounded-full bg-orange-100 p-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("position.label")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {data?.position || t("position.notSpecified")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 transition-all hover:border-green-100 hover:bg-green-50">
                <div className="rounded-full bg-green-100 p-2">
                  <Circle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("status.label")}
                  </p>
                  <p className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {t(
                      `status.${data?.status?.toLowerCase() || "notAvailable"}`,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetails;
