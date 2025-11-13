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
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useGetAllPromotionsQuery } from "@/redux/reducers/promotions-reducer";
import PromotionCard, {
  PromotionData,
} from "@/components/pages/promotions/cards/promotion-card";
import AddPromotionModal from "@/components/pages/promotions/modals/add-new-promotion";

const PromotionPage: FC = () => {
  const router = useRouter();
  const t = useTranslations("promotions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: promotions, isLoading } = useGetAllPromotionsQuery({});

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
        {/* <div className="w-full sm:w-auto"> */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className=" bg-primary flex items-center justify-center gap-0 sm:gap-2 text-white hover:bg-primary/90">
                <Plus className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:block">{t("addNew")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[90vh] w-[95vw] sm:h-[90dvh] sm:max-w-screen-xl">
              <DialogTitle className="sr-only">{t("addNew")}</DialogTitle>
              <DialogDescription className="sr-only">
                {t("addNewDescription")}
              </DialogDescription>
              <ScrollArea className="h-full w-full p-2">
                <AddPromotionModal onClose={handleCloseDialog} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        {/* </div> */}
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </>
          ) : !promotions?.results || promotions.results.length === 0 ? (
            <div className="col-span-full mt-8 flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground sm:mt-16">
              <UtensilsCrossed className="h-8 w-8 sm:h-12 sm:w-12" />
              <p className="text-center text-base sm:text-lg">
                {t("noPromotions")}
              </p>
            </div>
          ) : (
            promotions.results.map((promotionItem: PromotionData) => (
              <PromotionCard
                key={promotionItem.uid}
                promotion={promotionItem}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PromotionPage;
