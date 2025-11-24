"use client";
import { UpdateMenu } from "@/components/pages/restaurants/modals/update-menu";
import MenuDetailsSkeleton from "@/components/pages/restaurants/skeletons/menu-details-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import {
  useGetSingleMenuItemQuery,
  useUpdateSingleMenuMutation,
} from "@/redux/reducers/restaurants-reducer";
import { ArrowLeft, Camera, MoreVertical } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FC, useRef, useState } from "react";
import { toast } from "sonner";

const MenuDetails: FC = () => {
  const { data } = useGetLoggedUserQuery({});
  const t = useTranslations("restaurants.menu.details");
  const c = useTranslations("restaurants.menu.form");
  const locale = useLocale();
  const { id, menuid } = useParams<{ id: string; menuid: string }>();
  const { data: menuItem, isLoading } = useGetSingleMenuItemQuery({
    id,
    menuid,
  });
  const [updateSingleMenu] = useUpdateSingleMenuMutation();
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading || !menuItem) {
    return <MenuDetailsSkeleton />;
  }

  const getCurrencySymbol = (currency?: string) => {
    if (!currency) return "$";
    switch (currency.toUpperCase()) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "YEN":
        return "¥";
      case "AED":
        return "د.إ";
      default:
        return "$";
    }
  };

  const currencySymbol = getCurrencySymbol(
    data?.currency as string | undefined,
  );

  const handleImageEdit = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      await updateSingleMenu({
        restaurant_id: id,
        menu_id: menuid,
        data: formData,
      }).unwrap();

      toast.success(t("imageUpdateSuccess"));
    } catch (error) {
      console.error("Failed to update image:", error);
      toast.error(t("imageUpdateError"));
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div>
        {/* Hero Section */}
        <div className="w-full bg-transparent">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>

              <div
                className="relative"
                onMouseEnter={() => setShowImageEdit(true)}
                onMouseLeave={() => setShowImageEdit(false)}
              >
                <Image
                  src={previewImage || menuItem.image || "/restaurant-demo.jpg"}
                  alt={menuItem.name || "Menu item image"}
                  width={80}
                  height={80}
                  priority={true}
                  loading="eager"
                  className={`h-12 w-12 rounded-lg border-2 border-white object-cover shadow-lg md:h-20 md:w-20 ${isUploading ? "opacity-50" : ""}`}
                />
                {showImageEdit && !isUploading && (
                  <button
                    onClick={handleImageEdit}
                    className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-xs shadow-md transition-all hover:bg-gray-50"
                  >
                    <Camera size={12} />
                    <span>{t("image.edit")}</span>
                  </button>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              <div className="text-black">
                <h1 className="text-2xl font-bold">{menuItem.name}</h1>
                <p className="mt-1 max-w-lg text-sm opacity-90">
                  {(menuItem.description && menuItem.description.length > 200
                    ? menuItem.description.slice(0, 200) + "..."
                    : menuItem.description) || t("description")}
                </p>
              </div>
            </div>

            <div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent">
                    <MoreVertical size={20} className="text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="h-[90dvh] max-w-screen-md">
                  <DialogTitle className="sr-only">
                    {t("editMenuItem")}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {t("editMenuDescription")}
                  </DialogDescription>
                  <ScrollArea className="h-full w-full p-2">
                    <UpdateMenu
                      initialData={menuItem}
                      onClose={handleCloseDialog}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Price and Category */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-600">
              {currencySymbol}
              {Number(menuItem.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <div className="flex gap-2">
              {menuItem.category ? (
                <span className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-600">
                  {c(
                    `category.options.${menuItem.category
                      ?.toLowerCase()
                      .replace(/_([a-z])/g, (_: string, letter: string) =>
                        letter.toUpperCase(),
                      )}`,
                  )}
                </span>
              ) : (
                <span className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  {t("category")}
                </span>
              )}
              {menuItem.classification ? (
                <span className="rounded-md bg-green-100 px-3 py-1 text-sm text-green-600">
                  {c(
                    `classification.options.${menuItem.classification.toLowerCase()}`,
                  )}
                </span>
              ) : (
                <span className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  {t("classification")}
                </span>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6 rounded-lg bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              {t("ingredients")}
            </h2>
            {menuItem.ingredients &&
            Object.keys(menuItem.ingredients).length > 0 ? (
              <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                {Object.entries(
                  menuItem.ingredients as Record<string, string>,
                ).map(([ingredient, amount]) => (
                  <div
                    key={ingredient}
                    className="flex items-center justify-between rounded-md border border-gray-100 bg-white/60 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-purple-50 text-xs font-medium text-purple-600">
                        {ingredient.charAt(0).toUpperCase()}
                      </div>
                      <span className="capitalize text-gray-800">
                        {ingredient.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {amount || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">{t("noIngredients")}</span>
            )}
          </div>

          {/* Allergens */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="mb-2 text-lg font-semibold">{t("allergens")}</h2>
              <Badge>{t("badge")}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {menuItem.allergens && menuItem.allergens.length > 0 ? (
                menuItem.allergens.map((allergen: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-600"
                  >
                    {allergen}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">{t("noAllergens")}</span>
              )}
            </div>
          </div>

          {/* Macronutrients */}
          <div className="mb-4 rounded-lg bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("nutrition")}
              </h2>
              <Badge className="text-[10px]">{t("badge")}</Badge>
            </div>
            {menuItem.macronutrients &&
            Object.keys(menuItem.macronutrients).length > 0 ? (
              <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                {Object.entries(menuItem.macronutrients as Macronutrients).map(
                  ([key, value]) => {
                    const label =
                      locale === "de"
                        ? key === "fat"
                          ? "Fett"
                          : key === "iron"
                            ? "Eisen"
                            : key === "fiber"
                              ? "Ballaststoffe"
                              : key === "sugar"
                                ? "Zucker"
                                : key === "sodium"
                                  ? "Natrium"
                                  : key === "calcium"
                                    ? "Kalzium"
                                    : key === "protein"
                                      ? "Protein"
                                      : key === "calories"
                                        ? "Kalorien"
                                        : key === "vitamin_c"
                                          ? "Vitamin C"
                                          : key === "carbohydrates"
                                            ? "Kohlenhydrate"
                                            : key.replace("_", " ")
                        : key.replace("_", " ");

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-md border border-gray-100 bg-white/60 p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-green-50 text-xs font-medium text-green-600">
                            {key.charAt(0).toUpperCase()}
                          </div>
                          <span className="capitalize text-gray-800">
                            {label}:
                          </span>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {value}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <span className="text-gray-500">{t("noNutrition")}</span>
            )}
          </div>

          {/* Upselling Information */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h2 className="mb-2 text-lg font-semibold">{t("combinations")}</h2>
            <div className="flex flex-wrap gap-2">
              {menuItem.enable_upselling &&
              Array.isArray(menuItem?.recommended_combinations) &&
              menuItem.recommended_combinations.length > 0 ? (
                menuItem.recommended_combinations.map(
                  (combo: { uid: string; name: string }) => {
                    if (typeof combo === "object" && combo !== null) {
                      return (
                        <span
                          key={combo.uid}
                          className="rounded-md bg-purple-100 px-3 py-1 text-sm text-purple-600"
                        >
                          <span className="font-medium">
                            {typeof combo.name === "string" ? combo.name : ""}
                          </span>
                        </span>
                      );
                    }
                    return null;
                  },
                )
              ) : (
                <span className="text-gray-500">{t("noCombinations")}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Macronutrients {
  fat: number;
  iron: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium: number;
  protein: number;
  calories: number;
  vitamin_c: number;
  carbohydrates: number;
}

export default MenuDetails;
