"use client";

import { Plus, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { useGetRestaurantTableQuery } from "@/redux/reducers/restaurants-reducer";
import TableCard, {
  TableData,
} from "@/components/pages/restaurants/cards/table-card";
import AddNewTable from "@/components/pages/restaurants/modals/add-new-table";
import { useTranslations } from "next-intl";

const TablePage: FC = () => {
  const t = useTranslations("tables");
  const { id } = useParams();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: tables, isLoading } = useGetRestaurantTableQuery(id);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full bg-sidebar-accent/50 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("title")}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center gap-0 bg-primary text-white hover:bg-primary/90 sm:gap-2">
                  <Plus className="sm:mr-2 h-4 w-4" />
                  <span className="hidden lg:block">{t("addNew")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[70dvh] max-w-screen-md">
                <DialogTitle className="sr-only">{t("addNew")}</DialogTitle>
                <DialogDescription className="sr-only">
                  {t("addNewDescription")}
                </DialogDescription>
                <ScrollArea className="h-full w-full p-2">
                  <AddNewTable onClose={handleCloseDialog} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </>
          ) : !tables?.results || tables.results.length === 0 ? (
            <div className="col-span-2 mt-16 flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12" />
              <p className="text-lg">{t("noTables")}</p>
            </div>
          ) : (
            tables.results.map((tablesItem: TableData) => (
              <TableCard key={tablesItem.uid} table={tablesItem} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TablePage;
