import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useUpdateSpecialNotesMutation } from "@/redux/reducers/reservation-reducer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDeDate } from "@/lib/utils";

interface Customer {
  uid: string;
  name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  date_of_birth: string;
  last_visit: string;
  preferences: string[];
  allergens: string[];
  special_notes: string;
  history: {
    reservation_uid: string;
    reservation_name: string;
    reservation_date: string;
    reservation_time: string;
    reservation_status: string;
    menu: string[];
  }[];
}

interface CustomerDetailsProps {
  customerInfo: Customer;
}

export function CustomerDetails({ customerInfo }: CustomerDetailsProps) {
  const t = useTranslations("customers.details");
  const s = useTranslations("reservations.filters.status");
  const locale = useLocale();
  const [updateSpecialNotes, { isLoading: isUpdating }] =
    useUpdateSpecialNotesMutation();

  // Local state for editing special notes
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(customerInfo.special_notes || "");

  useEffect(() => {
    setNotes(customerInfo.special_notes || "");
  }, [customerInfo.special_notes]);

  const handleSaveNotes = async () => {
    try {
      await updateSpecialNotes({
        uid: customerInfo.uid,
        data: { special_notes: notes },
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update special notes:", error);
    }
  };

  const handleCancelEdit = () => {
    setNotes(customerInfo.special_notes || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm" tabIndex={0}>
      {/* Basic Info Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-base font-semibold text-gray-800">
          {t("title")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t("name")}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {customerInfo.name || t("notProvided")}
            </p>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t("email")}</p>
            <p className="mt-1 break-words text-sm font-medium text-gray-900">
              {customerInfo.email || t("notProvided")}
            </p>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t("phone")}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {customerInfo.phone || t("notProvided")}
            </p>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t("whatsapp")}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {customerInfo.whatsapp_number || t("notProvided")}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Dates Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-base font-semibold text-gray-800">
          {t("dateOfBirth")} / {t("lastVisit")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t("dateOfBirth")}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {customerInfo.date_of_birth
                ? locale === "de"
                  ? formatDeDate(customerInfo.date_of_birth)
                  : customerInfo.date_of_birth
                : t("notProvided")}
            </p>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t("lastVisit")}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {customerInfo.last_visit
                ? format(new Date(customerInfo.last_visit), "PPP")
                : t("notProvided")}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Preferences Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-base font-semibold text-gray-800">
          {t("preferences")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {customerInfo.preferences && customerInfo.preferences.length > 0 ? (
            customerInfo.preferences.map((pref, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-2 py-1 text-xs"
              >
                {pref}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">{t("none")}</p>
          )}
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Allergens Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-base font-semibold text-gray-800">
          {t("allergens")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {customerInfo.allergens && customerInfo.allergens.length > 0 ? (
            customerInfo.allergens.map((allergen, index) => (
              <Badge
                key={index}
                variant="destructive"
                className="px-2 py-1 text-xs"
              >
                {allergen}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">{t("none")}</p>
          )}
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Notes Section - Editable */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            {t("specialNotes")}
          </h3>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {t("edit")}
            </Button>
          )}
        </div>
        <div className="rounded-md bg-white p-3 shadow-sm">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("specialNotesPlaceholder")}
                rows={3}
                className="resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                >
                  {isUpdating ? t("saving") : t("save")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              {customerInfo.special_notes || t("none")}
            </p>
          )}
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* History Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            {t("history")}
          </h3>
          <Link
            href={`/customers/${customerInfo.uid}/message-history`}
            className="inline-flex items-center rounded-md bg-sidebar-accent/5 px-3 py-2 text-sm text-sidebar-accent"
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
        </div>
        <div className="space-y-3">
          {customerInfo.history && customerInfo.history.length > 0 ? (
            customerInfo.history.map((visit, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("reservationName")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {visit.reservation_name || t("unnamedReservation")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("reservationDate")} & {t("reservationTime")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {locale === "de"
                        ? formatDeDate(visit.reservation_date)
                        : format(new Date(visit.reservation_date), "PPP")}{" "} 
                      {t("at")} {visit.reservation_time}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <Badge
                    variant={
                      visit.reservation_status === "PLACED"
                        ? "default"
                        : visit.reservation_status === "CONFIRMED"
                          ? "secondary"
                          : visit.reservation_status === "CANCELLED"
                            ? "destructive"
                            : "outline"
                    }
                    className="px-2 py-1 text-xs"
                  >
                    {s(
                      visit.reservation_status?.toLowerCase() ||
                        t("status.unknown"),
                    )}
                  </Badge>
                </div>

                <div className="mt-3">
                  <p className="mb-2 text-xs text-gray-500">{t("menu")}</p>
                  <div className="flex flex-wrap gap-2">
                    {visit.menu.map((item, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="px-2 py-1 text-xs"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">{t("noHistory")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
