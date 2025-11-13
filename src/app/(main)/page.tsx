"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Building, CalendarDays, Clock, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useGetDashboardQuery } from "@/redux/reducers/restaurants-reducer";
import DashboardSkeleton from "@/components/pages/dashboard/dashboard-skeleton";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";



export default function Dashboard() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const { data: loggedUser, isLoading: isGettingUser } = useGetLoggedUserQuery(
    {},
  );
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  const triggerTypeOptions = [
    { value: "YEARLY", label: t("triggerTypeOptions.YEARLY") },
    { value: "MENU_SELECTED", label: t("triggerTypeOptions.MENU_SELECTED") },
    { value: "INACTIVITY", label: t("triggerTypeOptions.INACTIVITY") },
    {
      value: "RESERVATION_COUNT",
      label: t("triggerTypeOptions.RESERVATION_COUNT"),
    },
  ];

  useEffect(() => {
    if (loggedUser?.organizations?.length > 0 && !selectedOrg) {
      setSelectedOrg(loggedUser.organizations[0].uid);
    }
  }, [loggedUser, selectedOrg]);

  const { data: dashboardData, isLoading: isGettingDashboard } =
    useGetDashboardQuery(selectedOrg, {
      skip: !selectedOrg,
    });

  if (isGettingUser || isGettingDashboard) return <DashboardSkeleton />;

  if (!dashboardData) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
          <h1 className="text-xl font-bold lg:text-2xl">{t("title")}</h1>
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
            <Building className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">{t("noData.title")}</h3>
            <p className="text-sm text-gray-500">{t("noData.description")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {/* Reservation today card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {t("todayReservations.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.today_reservation !== undefined ? (
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold lg:text-3xl">
                  {dashboardData.today_reservation}
                </p>
                <p className="ml-2 text-sm text-gray-500">
                  {t("todayReservations.bookings")}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">{t("todayReservations.noData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Next reservation card */}
        <Card className="col-span-1 sm:col-span-2">
          <CardHeader className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <CardTitle className="text-base font-medium">
              {t("nextReservation.title")}
            </CardTitle>
            {dashboardData.next_reservation && (
              <span
                className={`rounded px-2 py-1 text-sm ${
                  dashboardData.next_reservation.menu_selected
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {dashboardData.next_reservation.menu_selected
                  ? t("nextReservation.menuSelected")
                  : t("nextReservation.menuPending")}
              </span>
            )}
          </CardHeader>
          <CardContent>
            {dashboardData.next_reservation ? (
              <div className="w-full">
                <div className="w-full space-y-3">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {dashboardData.next_reservation.reservation_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {dashboardData.next_reservation.reservation_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {dashboardData.next_reservation.guests}{" "}
                        {t("nextReservation.guests")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">{t("nextReservation.noUpcoming")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 lg:mt-6">
        {/* Sales Level card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {t("salesLevel.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.sales_level !== undefined ? (
              <div className="mt-2">
                <p className="text-2xl font-bold lg:text-3xl">
                  {t("salesLevel.level")} {dashboardData.sales_level}
                </p>
                <Progress value={20} className="mt-4" />
              </div>
            ) : (
              <p className="text-gray-500">{t("salesLevel.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Promotions Section */}
      <div className="mt-8 lg:mt-10">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center lg:mb-6">
          <h2 className="text-lg font-semibold lg:text-xl">
            {t("activePromotions.title")}
          </h2>
          <span className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800">
            {dashboardData.active_promotions?.length || 0}{" "}
            {t("activePromotions.active")}
          </span>
        </div>

        {dashboardData.active_promotions &&
        dashboardData.active_promotions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {dashboardData.active_promotions.map(
              (promotion: {
                uid: string;
                title: string;
                type: string;
                message: string;
              }) => (
                <Card
                  key={promotion.uid}
                  className="relative overflow-hidden border-b-0 border-l-4 border-r-0 border-t-0 border-sidebar-accent transition-all duration-200 hover:shadow-sm"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {promotion.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">
                      Type:{" "}
                      <span className="text-sm text-gray-600">
                        {triggerTypeOptions.find(
                          (option) => option.value === promotion.type,
                        )?.label || promotion.type}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{promotion.message}</p>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center lg:py-8">
              <p className="text-gray-500">
                {t("activePromotions.noPromotions")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
