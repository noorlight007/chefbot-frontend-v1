/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateRestaurantInfoMutation } from "@/redux/reducers/restaurants-reducer";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import * as z from "zod";

const getDayTranslationKey = (day: string): string => {
  const dayMap: Record<string, string> = {
    MONDAY: "monday",
    TUESDAY: "tuesday",
    WEDNESDAY: "wednesday",
    THURSDAY: "thursday",
    FRIDAY: "friday",
    SATURDAY: "saturday",
    SUNDAY: "sunday",
  };
  return dayMap[day] || day.toLowerCase();
};

const formSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  whatsapp_number: z.string().min(8, "Valid WhatsApp number is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().optional(),
  website: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
  street: z.string().optional(),
  zip_code: z.string().optional(),
  whatsapp_enabled: z.boolean().optional(),
  reservation_booking_reminder: z.union([z.string(), z.number()]).optional(),
  opening_hours: z
    .array(
      z.object({
        day: z.string(),
        opening_start_time: z.string(),
        opening_end_time: z.string(),
        break_start_time: z.string(),
        break_end_time: z.string(),
        is_closed: z.boolean(),
        no_break: z.boolean(),
      }),
    )
    .min(1, "At least one day is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CountryOption {
  value: string;
  label: string;
}

interface OpeningHour {
  id: number;
  uid: string;
  day: string;
  opening_start_time: string;
  opening_end_time: string;
  break_start_time: string;
  break_end_time: string;
  is_closed: boolean;
  no_break?: boolean;
}

interface Restaurant {
  uid: string;
  logo: string;
  name: string;
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  email: string;
  description: string;
  website: string;
  country: string;
  city: string;
  street: string;
  zip_code: string;
  reservation_booking_reminder: string;
  opening_hours: OpeningHour[];
}

interface UpdateRestaurantProps {
  onClose: () => void;
  restaurant: Restaurant;
  id: string | string[];
}

const UpdateRestaurant: FC<UpdateRestaurantProps> = ({
  restaurant,
  onClose,
  id,
}) => {
  const t = useTranslations("restaurants");
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const defaultOpeningHours = days.map((day) => {
    const existingHour = restaurant.opening_hours.find((h) => h.day === day);
    return {
      day,
      opening_start_time: existingHour?.opening_start_time || "00:00:00.000Z",
      opening_end_time: existingHour?.opening_end_time || "00:00:00.000Z",
      break_start_time: existingHour?.break_start_time || "00:00:00.000Z",
      break_end_time: existingHour?.break_end_time || "00:00:00.000Z",
      is_closed: existingHour?.is_closed || false,
      // If existingHour explicitly sets no_break use that, otherwise treat
      // break times of "00:00:00.000Z" as meaning "no break" and enable
      // the no_break toggle by default.
      no_break:
        existingHour?.no_break ??
        ((existingHour?.break_start_time || "00:00:00") === "00:00:00" &&
          (existingHour?.break_end_time || "00:00:00") === "00:00:00"),
    };
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: restaurant.name || "",
      whatsapp_number: restaurant.whatsapp_number || "+",
      email: restaurant.email || "",
      description: restaurant.description || "",
      website: restaurant.website || "",
      country: restaurant.country || "",
      city: restaurant.city || "",
      street: restaurant.street || "",
      zip_code: restaurant.zip_code || "",
      whatsapp_enabled: restaurant.whatsapp_enabled,
      reservation_booking_reminder: restaurant.reservation_booking_reminder,
      opening_hours: defaultOpeningHours,
    },
  });

  const reservation_booking_reminderS = [
    {
      value: "30",
      label: t("form.fields.reservation_booking_reminder.options.30"),
    },
    {
      value: "45",
      label: t("form.fields.reservation_booking_reminder.options.45"),
    },
    {
      value: "60",
      label: t("form.fields.reservation_booking_reminder.options.60"),
    },
  ];

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryOption[]>(
    [],
  );
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [updateRestaurantInfo, { isLoading: isRestaurantInfoUpdating }] =
    useUpdateRestaurantInfoMutation();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name",
        );
        const data = await response.json();
        const countryOptions = data
          .map((country: { name: { common: string } }) => ({
            value: country.name.common,
            label: country.name.common,
          }))
          .sort((a: CountryOption, b: CountryOption) =>
            a.label.localeCompare(b.label),
          );
        setCountries(countryOptions);
        setFilteredCountries(countryOptions);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = countries.filter((country) =>
        country.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchTerm, countries]);

  const onSubmit = async (data: FormData) => {
    setApiErrors({});
    // Prepare opening_hours payload for API: remove frontend-only `no_break` and
    // ensure break times are zeroed when no_break is true.
    const opening_hours_payload = data.opening_hours.map(
      (h: FormData["opening_hours"][number]) => {
        const { no_break, ...rest } = (h as any) || {};
        if (no_break) {
          rest.break_start_time = "00:00:00.000Z";
          rest.break_end_time = "00:00:00.000Z";
        }
        return rest;
      },
    );

    const res = await updateRestaurantInfo({
      id,
      data: { ...data, opening_hours: opening_hours_payload },
    });

    if (res.data) {
      onClose();
      toast.success(t("form.success"));
    } else if (res?.error && "data" in res.error && res.error.data) {
      const errorData = res.error.data;

      // Handle opening hours errors
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "opening_hours" in errorData &&
        errorData.opening_hours
      ) {
        const openingHoursErrors: Record<string, string[]> = {};

        Object.entries(
          errorData.opening_hours as Record<string, string[] | string>,
        ).forEach(([day, messages]) => {
          if (Array.isArray(messages)) {
            openingHoursErrors[day] = messages;
          } else if (typeof messages === "string") {
            openingHoursErrors[day] = [messages];
          }
        });

        setApiErrors(openingHoursErrors);
        toast.error(t("form.openingHours.errors"));
      }

      // Handle whatsapp_number specific error
      if (
        (errorData as any).whatsapp_number &&
        Array.isArray((errorData as any).whatsapp_number) &&
        (errorData as any).whatsapp_number[0] ===
          "organization with this whatsapp number already exists."
      ) {
        setError("whatsapp_number", {
          type: "manual",
          message: t("form.fields.whatsapp_number.exists"),
        });
        toast.error(t("form.fields.whatsapp_number.exists"));
      }

      // Handle other field-specific errors
      Object.entries(errorData).forEach(([field, messages]) => {
        if (
          field !== "opening_hours" &&
          field !== "whatsapp_number" &&
          Array.isArray(messages)
        ) {
          setError(field as keyof FormData, {
            type: "manual",
            message: messages[0],
          });
        }
      });

      if (
        typeof errorData === "object" &&
        errorData !== null &&
        !("opening_hours" in errorData) &&
        !("whatsapp_number" in errorData)
      ) {
        toast.error(t("form.error.validation"));
      }
    } else {
      toast.error(t("form.error.generic"));
    }
  };

  const formatTimeForInput = (isoTime: string) => {
    if (!isoTime || !isoTime.includes(":")) return "";
    const [timePart] = isoTime.split(".");
    const [hours, minutes] = timePart.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const formatTimeForSubmit = (time: string) => {
    if (!time) return "00:00:00.000Z";
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00.000Z`;
  };

  const getDayError = (day: string) => {
    return (
      apiErrors[day] ||
      apiErrors[day.toLowerCase()] ||
      apiErrors[day.toUpperCase()]
    );
  };

  return (
    <div className="space-y-4 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.fields.name.label")}*</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="name"
                placeholder={t("form.fields.name.placeholder")}
                className="w-full"
              />
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">
            {t("form.fields.whatsapp_number.label")}*
          </Label>
          <Controller
            name="whatsapp_number"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                country={"de"}
                value={value?.replace(/^\+/, "") || ""}
                onChange={(phone) => onChange("+" + phone)}
                enableSearch={true}
                countryCodeEditable={false}
                searchPlaceholder={t("form.fields.country.search")}
                inputClass="w-full p-2 rounded-md border border-gray-200"
                inputStyle={{
                  width: "100%",
                  height: "40px",
                  fontSize: "16px",
                  padding: "8px 45px",
                  borderRadius: "6px",
                  border: errors.whatsapp_number
                    ? "1px solid #ef4444"
                    : "1px solid #e2e8f0",
                }}
                buttonStyle={{
                  borderRadius: "6px 0 0 6px",
                  border: errors.whatsapp_number
                    ? "1px solid #ef4444"
                    : "1px solid #e2e8f0",
                }}
                searchStyle={{
                  width: "100%",
                  padding: "8px",
                  margin: "0",
                }}
              />
            )}
          />
          {errors.whatsapp_number && (
            <p className="text-xs text-red-500">
              {errors.whatsapp_number.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("form.fields.email.label")}*</Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder={t("form.fields.email.placeholder")}
                className="w-full"
              />
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">
            {t("form.fields.description.label")}
          </Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="description"
                placeholder={t("form.fields.description.placeholder")}
                className="w-full"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">{t("form.fields.website.label")}</Label>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="website"
                type="url"
                placeholder={t("form.fields.website.placeholder")}
                className="w-full"
              />
            )}
          />
          {errors.website && (
            <p className="text-xs text-red-500">
              {t("form.fields.website.invalid")}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">{t("form.fields.country.label")}*</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-10 w-full justify-between text-left ${
                      errors.country ? "border-red-500" : "border-gray-200"
                    } bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isLoadingCountries}
                  >
                    <span className="truncate">
                      {field.value
                        ? countries.find(
                            (country) => country.value === field.value,
                          )?.label
                        : isLoadingCountries
                          ? t("form.fields.country.loading")
                          : t("form.fields.country.placeholder")}
                    </span>
                    <svg
                      className="ml-2 h-4 w-4 shrink-0 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                  {isDropdownOpen && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <Input
                          placeholder={t("form.fields.country.search")}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                          disabled={isLoadingCountries}
                        />
                      </div>
                      {filteredCountries.length === 0 &&
                        !isLoadingCountries && (
                          <div className="p-2 text-sm text-gray-500">
                            {t("form.fields.country.noResults")}
                          </div>
                        )}
                      {filteredCountries.map((country) => (
                        <div
                          key={country.value}
                          className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => {
                            field.onChange(country.value);
                            setIsDropdownOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          {country.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
            {errors.country && (
              <p className="text-xs text-red-500">{errors.country.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("form.fields.city.label")}</Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="city"
                  placeholder={t("form.fields.city.placeholder")}
                  className="w-full"
                />
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">{t("form.fields.street.label")}</Label>
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="street"
                placeholder={t("form.fields.street.placeholder")}
                className="w-full"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code">{t("form.fields.zip_code.label")}</Label>
          <Controller
            name="zip_code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="zip_code"
                placeholder={t("form.fields.zip_code.placeholder")}
                className="w-full"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reservation_booking_reminder">
            {t("form.fields.reservation_booking_reminder.label")}
          </Label>
          <Controller
            name="reservation_booking_reminder"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "form.fields.reservation_booking_reminder.placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {reservation_booking_reminderS.map((reminder) => (
                      <SelectItem key={reminder.value} value={reminder.value}>
                        {reminder.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.reservation_booking_reminder && (
            <p className="text-xs text-red-500">
              {errors.reservation_booking_reminder.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Label>{t("form.fields.whatsapp_enabled.label")}</Label>
          <Controller
            name="whatsapp_enabled"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xl font-semibold text-gray-900">
              {t("form.openingHours.title")}
            </Label>
          </div>

          {Object.keys(apiErrors).length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div className="mt-3 space-y-2">
                {Object.entries(apiErrors).map(([day, messages]) => (
                  <div key={day} className="text-sm text-red-700">
                    <span className="font-semibold capitalize">{day}:</span>
                    <ul className="ml-4 list-disc">
                      {messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4 overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="hidden grid-cols-7 gap-6 border-b border-gray-100 pb-4 md:grid">
              <Label className="col-span-1 text-sm font-medium text-gray-700">
                {t("form.openingHours.day")}
              </Label>
              <Label className="col-span-1 text-sm font-medium text-gray-700">
                {t("form.openingHours.openingTime")}
              </Label>
              <Label className="col-span-1 text-sm font-medium text-gray-700">
                {t("form.openingHours.closingTime")}
              </Label>
              <Label className="col-span-1 text-sm font-medium text-gray-700">
                {t("form.openingHours.breakStart")}
              </Label>
              <Label className="col-span-1 text-sm font-medium text-gray-700">
                {t("form.openingHours.breakEnd")}
              </Label>
              <Label className="col-span-1 text-center text-sm font-medium text-gray-700">
                {t("form.openingHours.noBreak")}
              </Label>
              <Label className="col-span-1 text-center text-sm font-medium text-gray-700">
                {t("form.openingHours.closed")}
              </Label>
            </div>
            {days.map((day) => {
              const dayError = getDayError(day);
              const hasError = !!dayError;

              return (
                <div key={day} className="space-y-2">
                  <div
                    className={`grid grid-cols-1 items-start gap-4 rounded-lg py-3 transition-colors md:grid-cols-7 md:gap-6 ${
                      hasError ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Label
                      className={`col-span-1 font-medium ${hasError ? "text-red-700" : "text-gray-900"}`}
                    >
                      {t(`form.openingHours.${getDayTranslationKey(day)}`)}
                    </Label>
                    <Controller
                      name={`opening_hours.${days.indexOf(day)}.opening_start_time`}
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-gray-700 md:hidden">
                            {t("form.openingHours.openingTime")}
                          </span>
                          <div className="flex gap-2">
                            <select
                              onChange={(e) => {
                                const minutes =
                                  field.value?.split(":")[1] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${e.target.value}:${minutes}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[0]
                              }
                              disabled={watch(
                                `opening_hours.${days.indexOf(day)}.is_closed`,
                              )}
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                            <select
                              onChange={(e) => {
                                const hours =
                                  field.value?.split(":")[0] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${hours}:${e.target.value}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[1]
                              }
                              disabled={watch(
                                `opening_hours.${days.indexOf(day)}.is_closed`,
                              )}
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 4 }, (_, i) => (
                                <option
                                  key={i}
                                  value={(i * 15).toString().padStart(2, "0")}
                                >
                                  {(i * 15).toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    />

                    <Controller
                      name={`opening_hours.${days.indexOf(day)}.opening_end_time`}
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-gray-700 md:hidden">
                            {t("form.openingHours.closingTime")}
                          </span>
                          <div className="flex gap-2">
                            <select
                              onChange={(e) => {
                                const minutes =
                                  field.value?.split(":")[1] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${e.target.value}:${minutes}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[0]
                              }
                              disabled={watch(
                                `opening_hours.${days.indexOf(day)}.is_closed`,
                              )}
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                            <select
                              onChange={(e) => {
                                const hours =
                                  field.value?.split(":")[0] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${hours}:${e.target.value}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[1]
                              }
                              disabled={watch(
                                `opening_hours.${days.indexOf(day)}.is_closed`,
                              )}
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 4 }, (_, i) => (
                                <option
                                  key={i}
                                  value={(i * 15).toString().padStart(2, "0")}
                                >
                                  {(i * 15).toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    />
                    <Controller
                      name={`opening_hours.${days.indexOf(day)}.break_start_time`}
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-gray-700 md:hidden">
                            {t("form.openingHours.breakStart")}
                          </span>
                          <div className="flex gap-2">
                            <select
                              onChange={(e) => {
                                const minutes =
                                  field.value?.split(":")[1] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${e.target.value}:${minutes}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[0]
                              }
                              disabled={
                                watch(
                                  `opening_hours.${days.indexOf(day)}.is_closed`,
                                ) ||
                                watch(
                                  `opening_hours.${days.indexOf(day)}.no_break`,
                                )
                              }
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                            <select
                              onChange={(e) => {
                                const hours =
                                  field.value?.split(":")[0] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${hours}:${e.target.value}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[1]
                              }
                              disabled={
                                watch(
                                  `opening_hours.${days.indexOf(day)}.is_closed`,
                                ) ||
                                watch(
                                  `opening_hours.${days.indexOf(day)}.no_break`,
                                )
                              }
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 4 }, (_, i) => (
                                <option
                                  key={i}
                                  value={(i * 15).toString().padStart(2, "0")}
                                >
                                  {(i * 15).toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    />
                    <Controller
                      name={`opening_hours.${days.indexOf(day)}.break_end_time`}
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-gray-700 md:hidden">
                            {t("form.openingHours.breakEnd")}
                          </span>
                          <div className="flex gap-2">
                            <select
                              onChange={(e) => {
                                const minutes =
                                  field.value?.split(":")[1] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${e.target.value}:${minutes}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[0]
                              }
                              disabled={
                                watch(
                                  `opening_hours.${days.indexOf(day)}.is_closed`,
                                ) ||
                                watch(
                                  `opening_hours.${days.indexOf(day)}.no_break`,
                                )
                              }
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                            <select
                              onChange={(e) => {
                                const hours =
                                  field.value?.split(":")[0] || "00";
                                field.onChange(
                                  formatTimeForSubmit(
                                    `${hours}:${e.target.value}`,
                                  ),
                                );
                              }}
                              value={
                                formatTimeForInput(field.value || "").split(
                                  ":",
                                )[1]
                              }
                              disabled={
                                watch(
                                  `opening_hours.${days.indexOf(day)}.is_closed`,
                                ) ||
                                watch(
                                  `opening_hours.${days.indexOf(day)}.no_break`,
                                )
                              }
                              className={`w-1/2 rounded-md ${
                                hasError
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                            >
                              {Array.from({ length: 4 }, (_, i) => (
                                <option
                                  key={i}
                                  value={(i * 15).toString().padStart(2, "0")}
                                >
                                  {(i * 15).toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    />
                    <div className="col-span-1 flex md:justify-center">
                      <Controller
                        name={`opening_hours.${days.indexOf(day)}.no_break`}
                        control={control}
                        render={({ field }) => {
                          const isClosed = watch(
                            `opening_hours.${days.indexOf(day)}.is_closed`,
                          );

                          return (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-700 md:hidden">
                                {t("form.openingHours.noBreak")}
                              </span>
                              <Switch
                                checked={field.value}
                                disabled={isClosed}
                                onCheckedChange={(checked) => {
                                  // prevent toggling when the day is marked closed
                                  if (isClosed) return;
                                  field.onChange(checked);
                                  if (checked) {
                                    setValue(
                                      `opening_hours.${days.indexOf(day)}.break_start_time`,
                                      "00:00:00.000Z",
                                    );
                                    setValue(
                                      `opening_hours.${days.indexOf(day)}.break_end_time`,
                                      "00:00:00.000Z",
                                    );
                                    // Clear errors for this day when no_break is set
                                    const newErrors = { ...apiErrors };
                                    delete newErrors[day];
                                    delete newErrors[day.toLowerCase()];
                                    delete newErrors[day.toUpperCase()];
                                    setApiErrors(newErrors);
                                  }
                                }}
                                className={`${field.value ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-200 hover:bg-gray-300"} ${isClosed ? "cursor-not-allowed opacity-50" : ""}`}
                              />
                            </div>
                          );
                        }}
                      />
                    </div>
                    <div className="col-span-1 flex md:justify-center">
                      <Controller
                        name={`opening_hours.${days.indexOf(day)}.is_closed`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 md:hidden">
                              {t("form.openingHours.closed")}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  setValue(
                                    `opening_hours.${days.indexOf(day)}.opening_start_time`,
                                    "00:00:00.000Z",
                                  );
                                  setValue(
                                    `opening_hours.${days.indexOf(day)}.opening_end_time`,
                                    "00:00:00.000Z",
                                  );
                                  setValue(
                                    `opening_hours.${days.indexOf(day)}.break_start_time`,
                                    "00:00:00.000Z",
                                  );
                                  setValue(
                                    `opening_hours.${days.indexOf(day)}.break_end_time`,
                                    "00:00:00.000Z",
                                  );
                                  // Clear errors for this day when closed
                                  const newErrors = { ...apiErrors };
                                  delete newErrors[day];
                                  delete newErrors[day.toLowerCase()];
                                  delete newErrors[day.toUpperCase()];
                                  setApiErrors(newErrors);
                                }
                              }}
                              className={`${field.value ? "bg-red-500 hover:bg-red-600" : "bg-gray-200 hover:bg-gray-300"}`}
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  {dayError && (
                    <div className="ml-1 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <div className="flex-1">
                        {dayError.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <hr className="!mt-8 border-primary/20 sm:hidden" />
                </div>
              );
            })}
          </div>

          {errors.opening_hours && (
            <p className="text-sm font-medium text-red-500">
              {errors.opening_hours.message}
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("form.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={isRestaurantInfoUpdating}>
            {isRestaurantInfoUpdating
              ? t("form.buttons.saving")
              : t("form.buttons.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateRestaurant;
