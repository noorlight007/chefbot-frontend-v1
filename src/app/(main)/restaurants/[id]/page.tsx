"use client";

import UpdateRestaurant from "@/components/pages/restaurants/modals/update-restaurant";
import RestaurantDetailsSkeleton from "@/components/pages/restaurants/skeletons/restaurant-details-skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetSingleRestaurantQuery,
  useUpdateRestaurantInfoMutation,
} from "@/redux/reducers/restaurants-reducer";
import {
  ArrowLeft,
  Camera,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FC, useRef, useState } from "react";

const RestaurantDetails: FC = () => {
  const t = useTranslations("restaurants.details");
  const { id } = useParams();
  const { data: restaurant, isLoading } = useGetSingleRestaurantQuery(id);
  const [updateRestaurantInfo, { isLoading: isRestaurantInfoUpdating }] =
    useUpdateRestaurantInfoMutation();
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading || isRestaurantInfoUpdating) {
    return <RestaurantDetailsSkeleton />;
  }
  const handleImageEdit = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      await updateRestaurantInfo({ id, data: formData });
    } catch (error) {
      console.error("Failed to update logo:", error);
      setPreviewImage(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Helper to translate day names
  const translateDay = (day: string): string => {
    const key = day.toLowerCase();
    return t(`openingHours.${key}` as `openingHours.${string}`) || day;
  };

  return (
    <div>
      <div>
        {/* Hero Section */}
        <div className="w-full bg-gray-50">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent"
                aria-label={t("back")}
              >
                <ArrowLeft size={18} className="text-white" />
              </button>

              <div
                className="relative"
                onMouseEnter={() => setShowImageEdit(true)}
                onMouseLeave={() => setShowImageEdit(false)}
              >
                <Image
                  src={
                    previewImage || restaurant?.logo || "/restaurant-demo.jpg"
                  }
                  alt={`${restaurant.name} logo`}
                  width={80}
                  height={80}
                  priority
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover md:h-20 md:w-20"
                />
                {showImageEdit && (
                  <button
                    onClick={handleImageEdit}
                    className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-xs shadow"
                  >
                    <Camera size={12} />
                    <span>{t("edit")}</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="pb-1">
                <h1 className="text-xl font-semibold text-gray-900">
                  {restaurant.name}
                </h1>
                <p className="mt-0.5 max-w-lg text-sm text-gray-600">
                  {restaurant.description?.slice(0, 120)}
                  {restaurant.description?.length > 120 && "…"}
                </p>
              </div>
            </div>

            <div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="rounded-full bg-sidebar-accent/50 p-2 shadow-sm hover:bg-sidebar-accent">
                    <MoreVertical size={18} className="text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="h-[90dvh] max-w-5xl">
                  <DialogTitle>{t("editRestaurant")}</DialogTitle>
                  <DialogDescription>{t("editDescription")}</DialogDescription>
                  <ScrollArea className="h-full w-full p-2">
                    <UpdateRestaurant
                      restaurant={restaurant}
                      id={id}
                      onClose={handleCloseDialog}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Contact Cards */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Email Card */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Mail size={16} />
              </div>
              <span className="text-xs font-semibold text-blue-600">
                {t("contact.email")}
              </span>
              {restaurant.email ? (
                <p className="text-xs text-blue-600 hover:underline">
                  {restaurant.email}
                </p>
              ) : (
                <span className="text-xs text-gray-500">
                  {t("contact.notAvailable")}
                </span>
              )}
            </div>

            {/* Website Card */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Globe size={16} />
              </div>
              <span className="text-xs font-semibold text-purple-600">
                {t("contact.website")}
              </span>
              {restaurant.website ? (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline"
                >
                  {restaurant.website}
                </a>
              ) : (
                <span className="text-xs text-gray-500">
                  {t("contact.notAvailable")}
                </span>
              )}
            </div>

            {/* WhatsApp Card */}
            {restaurant.whatsappbot ? (
              <Link
                href={`/chatbots/${restaurant.whatsappbot.uid}/message-history`}
                className="text-xs text-green-600 hover:underline"
              >
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <MessageSquare size={16} />
                  </div>
                  <span className="text-xs font-semibold text-green-600">
                    {t("contact.chatHistory")}
                  </span>
                  {restaurant.whatsapp_enabled ? (
                    <span>{restaurant.whatsapp_number}</span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {t("contact.notAvailable")}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  <MessageSquare size={16} />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {t("contact.chatHistory")}
                </span>
                <span className="text-xs text-gray-500">
                  {t("contact.notAvailable")}
                </span>
              </div>
            )}
          </div>
          {/* Reservation Reminder Section */}
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={16} />
              <h2 className="text-lg font-semibold">
                {t("reservationReminder")} -{" "}
                <span className="text-base font-medium">
                  {restaurant.reservation_booking_reminder} {t("minutes")}
                </span>
              </h2>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-red-500" size={16} />
              <h2 className="text-lg font-semibold">{t("location")}</h2>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              {restaurant.street}, {restaurant.city}, {restaurant.country}{" "}
              {restaurant.zip_code}
            </p>
          </div>

          {/* Opening Hours Section */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="text-orange-500" size={16} />
              <h2 className="text-lg font-semibold">
                {t("openingHours.title")}
              </h2>
            </div>
            <div className="grid gap-2">
              {restaurant.opening_hours.map((hour: OpeningHour) => (
                <div
                  key={hour.id}
                  className="flex flex-col rounded-md bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {translateDay(hour.day)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        hour.is_closed
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {hour.is_closed
                        ? t("openingHours.status.closed")
                        : t("openingHours.status.open")}
                    </span>
                  </div>

                  {!hour.is_closed && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="flex flex-col rounded-md bg-blue-50 p-2">
                        <span className="text-xs font-medium text-blue-700">
                          {t("openingHours.schedule.opening")}
                        </span>
                        <span className="text-xs text-blue-600">
                          {formatTimeToHHMM(hour.opening_start_time)}
                        </span>
                      </div>
                      <div className="flex flex-col rounded-md bg-orange-50 p-2">
                        <span className="text-xs font-medium text-orange-700">
                          {t("openingHours.schedule.break")}
                        </span>
                        <span className="text-xs text-orange-600">
                          {formatTimeToHHMM(hour.break_start_time)} -{" "}
                          {formatTimeToHHMM(hour.break_end_time)}
                        </span>
                      </div>
                      <div className="flex flex-col rounded-md bg-red-50 p-2">
                        <span className="text-xs font-medium text-red-700">
                          {t("openingHours.schedule.closing")}
                        </span>
                        <span className="text-xs text-red-600">
                          {formatTimeToHHMM(hour.opening_end_time)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OpeningHour {
  id: number;
  uid: string;
  day: string;
  opening_start_time: string;
  opening_end_time: string;
  break_start_time: string;
  break_end_time: string;
  is_closed: boolean;
}

const formatTimeToHHMM = (utcTime: string): string => {
  const today = new Date().toISOString().split("T")[0];
  const date = new Date(`${today}T${utcTime}`);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

export default RestaurantDetails;
