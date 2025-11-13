"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Store } from "lucide-react";
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddNewRestaurantModal from "@/components/pages/restaurants/modals/add-new-restaurant";
import { ScrollArea } from "@/components/ui/scroll-area";
import RestaurantCard, {
  RestaurantData,
} from "@/components/pages/restaurants/cards/restaurant-card";
import { useGetAllRestaurantsQuery } from "@/redux/reducers/restaurants-reducer";
import RestaurantCardSkeleton from "@/components/pages/restaurants/skeletons/retaurant-card-skeleton";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const RestaurantsPage: FC = () => {
  const router = useRouter();
  const t = useTranslations("restaurants");
  const { data: restaurants, isLoading } = useGetAllRestaurantsQuery({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to close the dialog
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary flex items-center justify-center gap-0 sm:gap-2 text-white hover:bg-primary/90">
              <Plus className="sm:mr-2 h-4 w-4" />{" "}
              <span className="hidden sm:block">{t("addNew")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[90dvh] max-w-screen-lg">
            <DialogTitle className="sr-only">{t("addNew")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("addNewDescription")}
            </DialogDescription>
            <div className="h-full overflow-auto">
              <AddNewRestaurantModal onClose={handleCloseDialog} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading ? (
            <>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </>
          ) : restaurants?.results.length === 0 ? (
            <div className="col-span-2 mt-16 flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Store className="h-12 w-12" />
              <p className="text-lg">{t("noRestaurants")}</p>
            </div>
          ) : (
            <div className="col-span-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {restaurants?.results.map((restaurant: RestaurantData) => (
                <RestaurantCard key={restaurant.uid} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RestaurantsPage;
