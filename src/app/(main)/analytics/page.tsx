"use client";
import React, { useState, useEffect } from "react";
import { Building, BarChart3, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useGetDashboardQuery } from "@/redux/reducers/restaurants-reducer";
import MostVisitedCard from "@/components/pages/analytics/cards/most-visited-card";
import LoadingHeatmap from "@/components/pages/analytics/skeletons/analytics-skeleton";
import TopDishesCard from "@/components/pages/analytics/cards/top-dishes-card";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  const t = useTranslations("analytics");
  const { data: loggedUser, isLoading: isGettingUser } = useGetLoggedUserQuery(
    {},
  );
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  useEffect(() => {
    if (loggedUser?.organizations?.length > 0 && !selectedOrg) {
      setSelectedOrg(loggedUser.organizations[0].uid);
    }
  }, [loggedUser, selectedOrg]);

  const { data: dashboardData, isLoading: isGettingDashboard } =
    useGetDashboardQuery(selectedOrg, {
      skip: !selectedOrg,
    });

  if (isGettingUser || isGettingDashboard) return <LoadingHeatmap />;
  if (!dashboardData)
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
          <Select
            value={selectedOrg}
            onValueChange={(value) => setSelectedOrg(value)}
          >
            <SelectTrigger className="w-full lg:w-[300px]">
              <Building className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("selectOrg")} />
            </SelectTrigger>
            <SelectContent>
              {loggedUser?.organizations.map(
                (org: { uid: string; name: string }) => (
                  <SelectItem key={org.uid} value={org.uid}>
                    {org.name}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">{t("noData.title")}</h3>
            <p className="text-sm text-gray-500">{t("noData.description")}</p>
          </CardContent>
        </Card>
      </div>
    );

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
        <Select
          value={selectedOrg}
          onValueChange={(value) => setSelectedOrg(value)}
        >
          <SelectTrigger className="w-full lg:w-[300px]">
            <Building className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("selectOrg")} />
          </SelectTrigger>
          <SelectContent>
            {loggedUser?.organizations.map(
              (org: { uid: string; name: string }) => (
                <SelectItem key={org.uid} value={org.uid}>
                  {org.name}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1">
        {!selectedOrg ? (
          <LoadingHeatmap />
        ) : (
          <>
            <MostVisitedCard organization={selectedOrg} />
            <TopDishesCard organization={selectedOrg} />
          </>
        )}
      </div>
    </div>
  );
}
