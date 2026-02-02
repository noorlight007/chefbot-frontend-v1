"use client";
import UpdateReservation from "@/components/pages/reservations/modals/update-reservation";
import ReservationDetailsSkeleton from "@/components/pages/reservations/skeletons/reservation-details-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDeDate, formatStoredDateTimeLocalized } from "@/lib/utils";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useGetSingleReservationQuery } from "@/redux/reducers/reservation-reducer";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  ClockIcon,
  InfoIcon,
  MenuIcon,
  MoreVertical,
  PhoneIcon,
  TableIcon,
  UsersIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ReservationDetails() {
  const { data } = useGetLoggedUserQuery({});
  const { uid } = useParams();
  const { data: reservation, isLoading } = useGetSingleReservationQuery(uid);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [isMenuDetailsOpen, setIsMenuDetailsOpen] = useState(false);
  const t = useTranslations("reservations.details");
  const s = useTranslations("reservations.filters.status");
  const c = useTranslations("restaurants.menu.form");
  const cs = useTranslations("restaurants.reservations.client");
  const locale = useLocale();

  if (isLoading) {
    return <ReservationDetailsSkeleton />;
  }

  if (!reservation) {
    return <div>{t("noReservationFound")}</div>;
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

  // Map reservation status enum values to translation keys (handles INPROGRESS -> inProgress)
  const mapStatusToKey = (status?: string | null) => {
    if (!status) return null;
    switch (String(status).toUpperCase()) {
      case "PLACED":
        return "placed";
      case "INPROGRESS":
        return "inProgress";
      case "CANCELLED":
        return "cancelled";
      case "COMPLETED":
        return "completed";
      case "RESCHEDULED":
        return "rescheduled";
      case "ABSENT":
        return "absent";
      default:
        return null;
    }
  };

  const currencySymbol = getCurrencySymbol(
    data?.currency as string | undefined,
  );

  // Fixed: More robust client display logic
  const getClientDisplay = (
    client: { name?: string } | string | null | undefined,
  ) => {
    if (!client) return t("unknownClient");
    if (typeof client === "string") return client;
    if (typeof client === "object" && client.name) return String(client.name);
    return t("unknownClient");
  };

  // Fixed: More robust client uid logic
  const getClientUid = (
    client: { uid?: string } | string | null | undefined,
  ) => {
    if (!client) return t("unknownClient");
    if (typeof client === "string") return client;
    if (typeof client === "object" && client.uid) return String(client.uid);
    return t("unknownClient");
  };

  // Fixed: More robust table display logic
  const getTableDisplay = (
    table:
      | { name?: string; category?: string; capacity?: number }
      | string
      | null
      | undefined,
  ) => {
    if (!table) return t("notSpecified");
    if (typeof table === "string") return table;
    if (typeof table === "object" && table.name) {
      return `${String(table.name)} (${table.category || t("notSpecified")}, ${t("guests")}: ${table.capacity || t("notSpecified")})`;
    }
    return t("notSpecified");
  };

  // Fixed: More robust menu summary logic
  const getMenuSummary = (
    menus: Array<{ name?: string; price?: string | number }>,
  ) => {
    if (!menus || !Array.isArray(menus) || menus.length === 0) {
      return t("noMenusSelected");
    }
    return menus
      .map((menu: { name?: string; price?: string | number }) => {
        const name = menu?.name ? String(menu.name) : t("unknownClient");
        const price = menu?.price ? String(menu.price) : "0";
        return `${name} (${currencySymbol}${price})`;
      })
      .join(", ");
  };

  const clientDisplay = getClientDisplay(reservation.client);
  const clientUid = getClientUid(reservation.client);
  const tableDisplay = getTableDisplay(reservation.table);
  const menuSummary = getMenuSummary(reservation.menus);

  // Helper function to format time from HH:mm:ss to HH:mm (24-hour format)
  const formatTime = (timeString: string) => {
    if (!timeString) return t("notSpecified");
    // If it's already in HH:mm format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) return timeString;
    // If it's in HH:mm:ss format, remove seconds
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5);
    }
    return timeString;
  };

  return (
    <div>
      {/* Header */}
      <div className="w-full bg-gray-50">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>

            <div className="text-black">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight sm:text-2xl">
                  {String(
                    reservation.reservation_name || t("unnamedReservation"),
                  )}
                </h3>
                <Badge
                  variant={
                    reservation.reservation_status === "PLACED"
                      ? "default"
                      : "destructive"
                  }
                >
                  {(() => {
                    const key = mapStatusToKey(reservation.reservation_status);
                    return String(key ? s(key) : t("status.unknown"));
                  })()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/customers/${clientUid}/message-history`}
              className="inline-flex items-center rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-white hover:bg-sidebar-accent sm:px-4"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              {t("messageHistory")}
            </Link>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent">
                  <MoreVertical size={18} className="text-white" />
                </button>
              </DialogTrigger>
              <DialogContent className="h-[90dvh] max-w-screen-lg">
                <DialogTitle className="sr-only">{t("edit")}</DialogTitle>
                <DialogDescription className="sr-only">
                  {t("edit")}
                </DialogDescription>
                <ScrollArea className="h-full w-full p-2">
                  <UpdateReservation
                    reservation={reservation}
                    onClose={() => setIsDialogOpen(false)}
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <UsersIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("clientName")}</p>
                  <p className="font-medium">{clientDisplay}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <PhoneIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("contactNumber")}</p>
                  <p className="font-medium">
                    {String(
                      reservation.client.whatsapp_number ||
                        t("phoneNotProvided"),
                    ).replace(/[^0-9+]/g, "")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <CalendarIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("date")}</p>
                  <p className="font-medium">
                    {reservation.reservation_date
                      ? formatDeDate(
                          reservation.reservation_date,
                          typeof locale === "string" ? locale : undefined,
                        )
                      : t("notSpecified")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <ClockIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("time")}</p>
                  <p className="font-medium">
                    {formatTime(reservation.reservation_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <UsersIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("partySize")}</p>
                  <p className="font-medium">
                    {String(reservation.guests || 0)} {t("guests")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <TableIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("tableSelection")}</p>
                  <p className="font-medium">{tableDisplay}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <MenuIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("menuSelection")}</p>
                  <p className="font-medium">{menuSummary}</p>
                </div>
              </div>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {t("additionalInformation")}
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <InfoIcon className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("reasonForVisit")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {String(
                        reservation.reservation_reason || t("notSpecified"),
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <InfoIcon className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("notes")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {String(reservation.notes || t("none"))}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <InfoIcon className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("promotion")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {reservation.promo_code
                        ? `${reservation.promo_code.label || t("notSpecified")}`
                        : t("notApplicable")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <ClockIcon className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("bookingReminder")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {reservation.booking_reminder_sent_at
                        ? t("bookingReminderSent", {
                            date: formatStoredDateTimeLocalized(
                              reservation.booking_reminder_sent_at,
                              typeof locale === "string" ? locale : undefined,
                            ),
                          })
                        : t("bookingReminderNotSent")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <UsersIcon className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("cancelledBy")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {String(reservation.cancelled_by || t("notCancelled"))}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => setIsMenuDetailsOpen(!isMenuDetailsOpen)}
                    >
                      <div className="flex items-center gap-3">
                        <MenuIcon className="h-5 w-5 text-purple-500" />
                        <p className="text-sm font-medium text-gray-900">
                          {t("menuDetails")}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          isMenuDetailsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {isMenuDetailsOpen && (
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        {reservation.menus?.length > 0 ? (
                          reservation.menus.map(
                            (menu: MenuDetails, index: number) => (
                              <div
                                key={menu.uid}
                                className="mt-2 border-t pt-2 first:mt-0 first:border-t-0"
                              >
                                <p className="font-medium">
                                  {t("menuItem")} {index + 1}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {t("menuItem")}:
                                  </span>{" "}
                                  {String(menu.name || t("notSpecified"))}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {t("category")}:
                                  </span>{" "}
                                  {menu.category
                                    ? c(
                                        `category.options.${menu.category
                                          .toLowerCase()
                                          .replace(
                                            /_([a-z])/g,
                                            (_: string, letter: string) =>
                                              letter.toUpperCase(),
                                          )}`,
                                      )
                                    : t("notSpecified")}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {t("classification")}:
                                  </span>{" "}
                                  {menu.classification
                                    ? c(
                                        `classification.options.${String(
                                          menu.classification,
                                        ).toLowerCase()}`,
                                      )
                                    : t("notSpecified")}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {t("price")}:
                                  </span>{" "}
                                  {currencySymbol}
                                  {String(menu.price || t("notSpecified"))}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {t("description")}:
                                  </span>{" "}
                                  {String(menu.description || t("none"))}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {t("ingredients")}:
                                  </span>{" "}
                                  {menu.ingredients &&
                                  typeof menu.ingredients === "object"
                                    ? Object.entries(menu.ingredients)
                                        .map(
                                          ([key, value]) =>
                                            `${key}: ${String(value)}`,
                                        )
                                        .join(", ")
                                    : t("none")}
                                </p>
                              </div>
                            ),
                          )
                        ) : (
                          <p>{t("noMenusSelected")}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() =>
                        setIsClientDetailsOpen(!isClientDetailsOpen)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <UsersIcon className="h-5 w-5 text-purple-500" />
                        <p className="text-sm font-medium text-gray-900">
                          {t("clientDetails")}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          isClientDetailsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {isClientDetailsOpen && (
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">{t("source")}:</span>{" "}
                          {typeof reservation.client === "object" &&
                          reservation.client?.source
                            ? cs(`source.${reservation.client.source}`) ||
                              String(reservation.client.source)
                            : t("unknownClient")}
                        </p>
                        <p>
                          <span className="font-medium">{t("allergens")}:</span>{" "}
                          {typeof reservation.client === "object" &&
                          reservation.client?.allergens &&
                          Array.isArray(reservation.client.allergens) &&
                          reservation.client.allergens.length > 0
                            ? reservation.client.allergens
                                .map(String)
                                .join(", ")
                            : t("none")}
                        </p>
                        <p>
                          <span className="font-medium">
                            {t("preferences")}:
                          </span>{" "}
                          {typeof reservation.client === "object" &&
                          reservation.client?.preferences &&
                          Array.isArray(reservation.client.preferences) &&
                          reservation.client.preferences.length > 0
                            ? reservation.client.preferences
                                .map(String)
                                .join(", ")
                            : t("none")}
                        </p>
                        <p>
                          <span className="font-medium">
                            {t("specialNotes")}:
                          </span>{" "}
                          {typeof reservation.client === "object" &&
                          reservation.client?.special_notes
                            ? String(reservation.client.special_notes)
                            : t("none")}
                        </p>
                        <p>
                          <span className="font-medium">{t("lastVisit")}:</span>{" "}
                          {typeof reservation.client === "object" &&
                          reservation.client?.last_visit
                            ? formatDeDate(
                                reservation.client.last_visit,
                                typeof locale === "string" ? locale : undefined,
                              )
                            : t("notRecorded")}
                        </p>
                        <p>
                          <span className="font-medium">
                            {t("dateOfBirth")}:
                          </span>{" "}
                          {typeof reservation.client === "object" &&
                          reservation.client?.date_of_birth
                            ? formatDeDate(
                                reservation.client.date_of_birth,
                                typeof locale === "string" ? locale : undefined,
                              )
                            : t("notProvided")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <InfoIcon className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {t("organization")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {reservation.organization.name || t("notSpecified")}
                    </p>
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

type MenuDetails = {
  uid: string;
  name: string;
  category: string;
  classification: string;
  price: string;
  description: string;
  ingredients: Record<string, string>;
};
