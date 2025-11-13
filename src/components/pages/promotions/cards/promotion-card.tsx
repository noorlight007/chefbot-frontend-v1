import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeletePromotionMutation } from "@/redux/reducers/promotions-reducer";
import { useTranslations } from "next-intl";

export interface PromotionData {
  uid: string;
  title: string;
  message: string;
  reward: {
    uid: string;
    type: "DRINK" | "DESSERT" | "DISCOUNT" | "CUSTOM";
    label: string;
    promo_code: string;
  };
  organization: string;
  valid_from: string;
  valid_to: string;
  trigger: {
    uid: string;
    type: "BIRTHDAY" | "MENU_SELECTED" | "INACTIVITY" | "RESERVATION_COUNT";
    days_before: number;
    description: string;
  };
  is_enabled: boolean;
}

const PromotionCard: FC<{ promotion: PromotionData }> = ({ promotion }) => {
  const t = useTranslations("promotions.card");
  const s = useTranslations("promotions");
  const rewardType = s(
    `form.dropdownValues.rewardTypeOptions.${promotion.reward.type}`,
  );
  const [deletePromotion] = useDeletePromotionMutation();

  const handleDeletePromotion = async () => {
    await deletePromotion(promotion.uid);
  };
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promotion.reward.promo_code);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg">
      <CardContent className="flex flex-1 gap-6 p-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-primary">
                {promotion.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {promotion.message}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={handleDeletePromotion}
                  className="flex items-center gap-1.5 text-sm text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-medium">
              {t("rewardType")}: {rewardType}
            </Badge>
            <Badge
              variant={promotion.is_enabled ? "secondary" : "destructive"}
              className="text-sm font-medium"
            >
              {promotion.is_enabled ? t("status.active") : t("status.inactive")}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t("promoCode")}:</span>
              <div className="group/code relative inline-flex items-center">
                <code className="rounded bg-secondary/30 px-2 py-1 font-mono text-sm">
                  {promotion.reward.promo_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-1 h-6 w-6"
                  onClick={handleCopyCode}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex h-16 items-center justify-end gap-3 border-t bg-secondary/10 p-4">
        <Link href={`/promotions/${promotion.uid}/reports`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-md border-gray-200 font-medium shadow-sm transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
          >
            {t("reports")}
          </Button>
        </Link>
        <Link href={`/promotions/${promotion.uid}`}>
          <Button
            variant="default"
            size="sm"
            className="gap-2 text-sm font-medium transition-colors hover:bg-primary/90"
          >
            {t("viewDetails")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;
