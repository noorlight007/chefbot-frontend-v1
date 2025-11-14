"use client";
import { ReservationType } from "@/app/(main)/reservations/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDeDate } from "@/lib/utils";
import { useDeleteSingleReservationMutation } from "@/redux/reducers/reservation-reducer";
import { Calendar, Clock, MoreVertical, Trash2, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const statusColorMap: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-800",
  INPROGRESS: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  RESCHEDULED: "bg-purple-100 text-purple-800",
  ABSENT: "bg-gray-100 text-gray-800",
};

const ReservationCard: FC<{ reservation: ReservationType }> = ({
  reservation,
}) => {
  const t = useTranslations("reservations");
  const locale = useLocale();
  const [deleteSingleReservation] = useDeleteSingleReservationMutation();
  const handleDelete = async (uid: string) => {
    await deleteSingleReservation(uid);
  };

  const status = reservation.reservation_status;
  const badgeColor = statusColorMap[status] || "bg-gray-100 text-gray-800";

  // Map raw status to translation key
  const statusKeyMap: Record<string, string> = {
    PLACED: "placed",
    INPROGRESS: "inProgress",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
    RESCHEDULED: "rescheduled",
    ABSENT: "absent",
  };
  const statusKey = statusKeyMap[status] || "placed";
  const translatedStatus = t(`filters.status.${statusKey}`);

  return (
    <Card className="flex flex-col justify-between transition-shadow duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-gray-900">
                  {reservation.reservation_name}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badgeColor} `}
                  >
                    {translatedStatus}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDelete(reservation.uid)}
                    className="cursor-pointer text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{t("card.delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {reservation.client?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {formatDeDate(
                    reservation.reservation_date,
                    typeof locale === "string" ? locale : undefined,
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {reservation.reservation_time.slice(0, 5)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-end border-t bg-gradient-to-r from-gray-50 to-gray-100 p-3">
        <Button
          variant="default"
          size="sm"
          asChild
          className="rounded-md bg-primary font-medium text-white shadow-sm"
        >
          <Link href={`/reservations/${reservation.uid}`}>
            {t("card.details")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReservationCard;
