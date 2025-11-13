import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDeleteSingleMenuMutation } from "@/redux/reducers/restaurants-reducer";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const MenuCard: FC<{ menuItem: MenuItemData }> = ({ menuItem }) => {
  const t = useTranslations("restaurants.menu.cards");
  const c = useTranslations("restaurants.menu.form.category.options");
  const { id } = useParams();
  const [deleteSingleMenu] = useDeleteSingleMenuMutation();

  const handleDeleteMenu = async ({
    restaurant_id,
    menu_id,
  }: {
    restaurant_id: string | string[];
    menu_id: string | string[];
  }) => {
    try {
      await deleteSingleMenu({
        restaurant_id,
        menu_id,
      }).unwrap();

      toast.success("Menu deleted successfully");
    } catch (error) {
      toast.error("Failed to delete menu");
      console.error("Delete menu error:", error);
    }
  };


  return (
    <Card className="group relative flex h-full flex-col transition-all duration-300 hover:shadow-lg">
      <CardContent className="flex-1 p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg shadow">
            <Image
              src={menuItem?.image || "/restaurant-demo.jpg"}
              alt={menuItem?.name || "Menu Item"}
              width={80}
              height={80}
              className="h-full w-full transform object-cover transition-transform duration-300 group-hover:scale-105"
              priority={true}
              loading="eager"
            />
            {menuItem?.enable_upselling && (
              <Badge className="absolute -top-1 left-2 bg-primary/80 text-[10px]">
                {t("popular")}
              </Badge>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-primary">
                  {menuItem?.name}
                </h3>
                <p className="text-xs font-medium text-muted-foreground">
                  {c(
                    menuItem?.category
                      ?.toLowerCase()
                      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
                  )}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() =>
                      handleDeleteMenu({
                        restaurant_id: id,
                        menu_id: menuItem.uid,
                      })
                    }
                    className="flex items-center gap-1.5 text-xs text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {menuItem?.description}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-base font-bold text-primary">
                ${menuItem?.price}
              </p>
              {menuItem.allergens?.length > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {t("containsAllergens")}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex h-14 items-center justify-end gap-3 border-t bg-secondary/10 p-3">
        <Link href={`/restaurants/${id}/menu/${menuItem.uid}`}>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-xs transition-colors hover:bg-primary/90"
          >
            {t("viewDetails")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

interface MenuItemData {
  uid: string;
  image: string;
  name: string;
  description: string;
  price: string;
  ingredients: string[];
  category:
    | "STARTERS"
    | "MAIN_COURSES"
    | "DESSERTS"
    | "DRINKS_ALCOHOLIC"
    | "DRINKS_NON_ALCOHOLIC"
    | "SPECIALS";
  classification: "MEAT" | "FISH" | "VEGETARIAN" | "VEGAN";
  allergens: string[];
  macronutrients: string;
  upselling_priority: number;
  enable_upselling: boolean;
  recommended_combinations: string[];
}

export default MenuCard;
