"use client";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  GiftIcon,
  TagIcon,
  ArrowLeft,
  MoreVertical,
  BellIcon,
  InfoIcon,
  ChevronDown,
  BuildingIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetSinglePromotionsQuery } from "@/redux/reducers/promotions-reducer";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PromotionDetailsSkeleton from "@/components/pages/promotions/skeletons/promotion-details-skeleton";
import UpdatePromotionModal from "@/components/pages/promotions/modals/update-promotion";
import { useLocale, useTranslations } from "next-intl";
import { formatDeDate } from "@/lib/utils";

export default function PromotionDetails() {
  const { uid } = useParams();
  const { data: promotion, isLoading } = useGetSinglePromotionsQuery(uid);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTriggerDetailsOpen, setIsTriggerDetailsOpen] = useState(false);
  const t = useTranslations("promotions");
  const locale = useLocale();

  if (isLoading) {
    return <PromotionDetailsSkeleton />;
  }

  const getTriggerTypeLabel = (type: string) => {
    return (
      triggerTypeOptions.find((option) => option.value === type)?.label || type
    );
  };

  const getYearlyCategoryLabel = (category: string) => {
    return (
      yearlyCategoryOptions.find((option) => option.value === category)
        ?.label || category
    );
  };

  const renderTriggerDetails = () => {
    const { trigger } = promotion;
    return (
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">{t("details.type")}:</span>{" "}
          {getTriggerTypeLabel(trigger.type)}
        </p>
        {trigger.type === "YEARLY" && (
          <>
            <p>
              <span className="font-medium">
                {t("details.yearlyCategory")}:
              </span>{" "}
              {getYearlyCategoryLabel(trigger.yearly_category)}
            </p>
            {trigger.type === "YEARLY" &&
              (trigger.yearly_category === "BIRTHDAY" ||
                trigger.yearly_category === "ANNIVERSARY") && (
                <p>
                  <span className="font-medium">
                    {t("details.daysBefore")}:
                  </span>{" "}
                  {trigger.days_before}
                </p>
              )}
          </>
        )}
        {trigger.type === "INACTIVITY" && (
          <p>
            <span className="font-medium">{t("details.inactivityDays")}:</span>{" "}
            {trigger.inactivity_days}
          </p>
        )}
        {trigger.type === "RESERVATION_COUNT" && (
          <p>
            <span className="font-medium">{t("details.minimumCount")}:</span>{" "}
            {trigger.min_count}
          </p>
        )}
        {trigger.type === "MENU_SELECTED" && trigger.menus && (
          <div className="mt-3 space-y-3">
            <p className="font-medium">{t("details.selectedMenus")}:</p>
            {trigger.menus.map((menu: { uid: string; name: string; description: string; category: string; classification: string; price: number; ingredients: Record<string, string> }) => (
              <div key={menu.uid} className="rounded border bg-white p-3 shadow-sm">
                <p className="font-semibold">{menu.name}</p>
                <p className="text-xs text-gray-500">{menu.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span>Category: {menu.category}</span>
                  <span>Classification: {menu.classification}</span>
                  <span>Price: ${menu.price}</span>
                </div>
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-gray-600">Ingredients</summary>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    {Object.entries(menu.ingredients).map(([ing, qty]) => (
                      <li key={ing}>{`${ing}: ${qty}`}</li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="relative h-40 w-full rounded-t-lg bg-gradient-to-b from-sidebar-accent to-sidebar">
        <div className="absolute left-4 top-4 z-10">
          <button
            onClick={() => window.history.back()}
            className="rounded-full bg-white/20 p-2 transition-all hover:bg-white/30"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
        </div>
        <div className="absolute right-4 top-4 z-10">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="rounded-full bg-white/20 p-2 transition-all hover:bg-white/30">
                <MoreVertical size={20} className="text-white" />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[90dvh] max-w-screen-lg">
              <DialogTitle className="sr-only">
                {t("details.editPromotion")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("details.editDescription")}
              </DialogDescription>
              <ScrollArea className="h-full w-full p-2">
                <UpdatePromotionModal
                  promotion={promotion}
                  onClose={() => setIsDialogOpen(false)}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-sidebar/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {promotion.title}
                  </h3>
                  <Badge
                    variant={promotion.is_enabled ? "default" : "destructive"}
                  >
                    {promotion.is_enabled
                      ? t("details.status.active")
                      : t("details.status.inactive")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <BuildingIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">
                    {t("details.organization")}
                  </p>
                  <p className="font-medium">{promotion.organization.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <GiftIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("details.reward")}</p>
                  <p className="font-medium">{promotion.reward.label}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <GiftIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">
                    {t("details.rewardType")}
                  </p>
                  <p className="font-medium">
                    {t(
                      `form.dropdownValues.rewardTypeOptions.${promotion.reward.type}`,
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <TagIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">
                    {t("details.promoCode")}
                  </p>
                  <p className="font-medium">{promotion.reward.promo_code}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <CalendarIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">
                    {t("details.validFrom")}
                  </p>
                  <p className="font-medium">
                    <p className="font-medium">
                      {locale === "de"
                        ? formatDeDate(promotion.valid_from)
                        : new Date(promotion.valid_from).toLocaleDateString()}
                    </p>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <CalendarIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">
                    {t("details.validTo")}
                  </p>
                  <p className="font-medium">
                    {locale === "de"
                      ? formatDeDate(promotion.valid_to)
                      : new Date(promotion.valid_to).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {t("details.title")}
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <InfoIcon className="h-5 w-5 text-orange-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("details.message")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {promotion.message}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() =>
                        setIsTriggerDetailsOpen(!isTriggerDetailsOpen)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <BellIcon className="h-5 w-5 text-orange-500" />
                        <p className="text-sm font-medium text-gray-900">
                          {t("details.triggerDetails")}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          isTriggerDetailsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {isTriggerDetailsOpen && renderTriggerDetails()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </div>
    </div>
  );
}

const triggerTypeOptions = [
  { value: "YEARLY", label: "Yearly" },
  { value: "MENU_SELECTED", label: "Menu Selected" },
  { value: "INACTIVITY", label: "Inactivity" },
  { value: "RESERVATION_COUNT", label: "Reservation Count" },
];

const yearlyCategoryOptions = [
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "BIRTHDAY", label: "Birthday" },
];
