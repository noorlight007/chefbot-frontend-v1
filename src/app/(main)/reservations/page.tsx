"use client";
import ReservationCard from "@/components/pages/reservations/cards/reservation-card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, UtensilsCrossed, X } from "lucide-react";
import { useGetAllReservationsQuery } from "@/redux/reducers/reservation-reducer";
import RestaurantCardSkeleton from "@/components/pages/restaurants/skeletons/retaurant-card-skeleton";
import AddReservationModal from "@/components/pages/reservations/modals/add-reservation";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const ReservationPage: FC = () => {
  const router = useRouter();
  const t = useTranslations("reservations");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reservationStatus, setReservationStatus] = useState("all");
  const [cancelledBy, setCancelledBy] = useState("all");
  const [dateAfter, setDateAfter] = useState<string | undefined>();
  const [dateBefore, setDateBefore] = useState<string | undefined>();

  const { data: reservations, isLoading } = useGetAllReservationsQuery(
    {
      search: searchTerm || undefined,
      reservation_status:
        reservationStatus !== "all" ? reservationStatus : undefined,
      cancelled_by: cancelledBy !== "all" ? cancelledBy : undefined,
      reservation_date_after: dateAfter,
      reservation_date_before: dateBefore,
    },
    { refetchOnMountOrArgChange: true },
  );

  return (
    <div className="p-4 lg:p-6">
      <div>
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
              <Button className="flex items-center justify-center gap-0 bg-primary text-white hover:bg-primary/90 sm:gap-2">
                <Plus className="h-4 w-4 sm:mr-2" />{" "}
                <span className="hidden sm:block">{t("addNew")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[90dvh] max-w-screen-lg">
              <DialogHeader>
                <DialogTitle>{t("addNew")}</DialogTitle>
                <DialogDescription>{t("addNewDescription")}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-full w-full p-2">
                <AddReservationModal onClose={() => setIsDialogOpen(false)} />
                {/* here */}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="w-full sm:min-w-[200px] sm:flex-1">
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              className="w-full"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            defaultValue="all"
            onValueChange={(value) => setReservationStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("filters.status.label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.status.all")}</SelectItem>
              <SelectItem value="PLACED">
                {t("filters.status.placed")}
              </SelectItem>
              <SelectItem value="INPROGRESS">
                {t("filters.status.inProgress")}
              </SelectItem>
              <SelectItem value="CANCELLED">
                {t("filters.status.cancelled")}
              </SelectItem>
              <SelectItem value="COMPLETED">
                {t("filters.status.completed")}
              </SelectItem>
              <SelectItem value="RESCHEDULED">
                {t("filters.status.rescheduled")}
              </SelectItem>
              <SelectItem value="ABSENT">
                {t("filters.status.absent")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue="all"
            onValueChange={(value) => setCancelledBy(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("filters.cancelledBy.label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("filters.cancelledBy.all")}
              </SelectItem>
              <SelectItem value="SYSTEM">
                {t("filters.cancelledBy.system")}
              </SelectItem>
              <SelectItem value="CUSTOMER">
                {t("filters.cancelledBy.customer")}
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex flex-1 items-stretch overflow-hidden rounded-md border sm:flex-initial">
              <div className="relative flex-1 sm:w-[150px]">
                <Input
                  type="date"
                  value={dateAfter || ""}
                  className="h-full w-full rounded-none border-0 pr-2 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  onChange={(e) => setDateAfter(e.target.value)}
                />
              </div>
              <div className="w-px bg-border" />
              <div className="relative flex-1 sm:w-[150px]">
                <Input
                  type="date"
                  value={dateBefore || ""}
                  className="h-full w-full rounded-none border-0 pr-2 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  onChange={(e) => setDateBefore(e.target.value)}
                />
              </div>
            </div>
            {(dateAfter || dateBefore) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  setDateAfter(undefined);
                  setDateBefore(undefined);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <ScrollArea className="mt-6 h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </>
          ) : reservations?.results.length === 0 ? (
            <div className="col-span-3 mt-16 flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12" />
              <p className="text-lg">{t("noReservations")}</p>
            </div>
          ) : (
            reservations?.results?.map((reservation: ReservationType) => (
              <ReservationCard
                key={reservation?.uid}
                reservation={reservation}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

type MenuType = {
  uid: string;
  name: string;
  description: string;
  price: string;
  ingredients: string;
  category: "STARTERS" | "MAINS" | "DESSERTS" | "DRINKS";
  classification: "MEAT" | "VEGETARIAN" | "VEGAN" | "FISH" | "NEUTRAL";
};

type TableType = {
  uid: string;
  name: string;
  capacity: number;
  category: "FAMILY" | "COUPLE" | "GROUP" | "SINGLE" | "PRIVATE";
  position: string;
  status: "AVAILABLE" | "UNAVAILABLE " | "RESERVED";
};

type ClientType = {
  uid: string;
  name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  source: "WHATSAPP" | "MANUAL ";
  date_of_birth: string;
  last_visit: string;
  preferences: string[];
  allergens: string[];
  special_notes: string;
};

export type ReservationType = {
  uid: string;
  client: ClientType;
  reservation_name: string;
  reservation_phone: string;
  reservation_date: string;
  reservation_time: string;
  reservation_end_time: string;
  reservation_reason: string;
  guests: number;
  notes: string;
  reservation_status:
    | "PLACED"
    | "INPROGRESS "
    | "CANCELLED"
    | "COMPLETED"
    | "RESCHEDULED"
    | "ABSENT";
  cancelled_by?: "SYSTEM" | "CUSTOMER";
  cancellation_reason?: string;
  booking_reminder_sent: boolean;
  booking_reminder_sent_at: string;
  menus: MenuType[];
  table: TableType;
  organization: string;
  promo_code?: string;
};

export default ReservationPage;
