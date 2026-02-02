"use client";

import { ReservationType } from "@/app/(main)/reservations/page";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useUpdateReservationMutation } from "@/redux/reducers/reservation-reducer";
import {
  useGetRestaurantPromotionsQuery,
  useGetSingleRestaurantMenuQuery,
  useGetTablesQuery,
} from "@/redux/reducers/restaurants-reducer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Custom Dropdown Component
interface DropdownProps {
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  displayValue?: string;
}

function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  multiple = false,
  searchable = false,
  displayValue,
}: DropdownProps) {
  const t = useTranslations("reservations.form");
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase()?.includes(search.toLowerCase()),
  );

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter((v) => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
    } else {
      onChange(selectedValue);
      setIsOpen(false);
      setSearch("");
    }
  };

  const handleRemove = (valueToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter((v) => v !== valueToRemove);
      onChange(newValues);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-gray-700">
          {multiple
            ? Array.isArray(value) && value.length > 0
              ? `Selected ${value.length} item${value.length > 1 ? "s" : ""}`
              : placeholder
            : value
              ? options.find((opt) => opt.value === value)?.label ||
                displayValue ||
                value ||
                placeholder
              : placeholder}
        </span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {searchable && (
            <div className="sticky top-0 bg-white p-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
          )}
          {filteredOptions.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              {t("noResults")}
            </div>
          )}
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${
                Array.isArray(value) && value.includes(option.value)
                  ? "bg-blue-50 text-blue-700"
                  : value === option.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((val) => {
            const option = options.find((opt) => opt.value === val);
            return option ? (
              <div
                key={val}
                className="flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => handleRemove(val)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// Time Picker Component
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const [hour, minute] = value ? value.split(":") : ["", ""];

  const handleHourChange = (newHour: string) => {
    const newTime = `${newHour}:${minute || "00"}`;
    onChange(newTime);
  };

  const handleMinuteChange = (newMinute: string) => {
    const newTime = `${hour || "00"}:${newMinute}`;
    onChange(newTime);
  };

  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <Dropdown
          options={hourOptions}
          value={hour || ""}
          onChange={(value) => handleHourChange(value as string)}
          placeholder="HH"
        />
      </div>
      <div className="flex items-center justify-center">
        <span className="font-medium text-gray-500">:</span>
      </div>
      <div className="flex-1">
        <Dropdown
          options={minuteOptions}
          value={minute || ""}
          onChange={(value) => handleMinuteChange(value as string)}
          placeholder="MM"
        />
      </div>
    </div>
  );
}

// Updated Zod Schema with conditional cancellation_reason
const updateReservationSchema = z
  .object({
    reservation_name: z.string().min(1, "Reservation name is required"),
    client_name: z.string().min(1, "Guest name is required"),
    client_phone: z.string().min(1, "Phone number is required"),
    client_allergens: z.array(z.string()),
    reservation_date: z.string().min(1, "Date is required"),
    reservation_time: z.string().min(1, "Time is required"),
    guests: z.number().min(1, "Number of guests is required"),
    reservation_reason: z.string().optional(),
    notes: z.string().optional(),
    reservation_status: z.enum([
      "PLACED",
      "INPROGRESS",
      "CANCELLED",
      "COMPLETED",
      "RESCHEDULED",
      "ABSENT",
    ]),
    cancelled_by: z.enum(["SYSTEM", "CUSTOMER"]).optional(),
    cancellation_reason: z.string().optional(),
    menus: z.array(z.string()).optional(),
    table: z.string().min(1, "Table selection is required"),
    organization: z.string().min(1, "Restaurant selection is required"),
    promo_code: z.string().optional(),
  })
  .refine(
    (data) => {
      // If status is CANCELLED, cancellation_reason is required
      if (data.reservation_status === "CANCELLED") {
        return (
          data.cancellation_reason && data.cancellation_reason.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "errors.cancellationRequiredWhenCancelled",
      path: ["cancellation_reason"],
    },
  );

type UpdateReservationFormData = z.infer<typeof updateReservationSchema>;

interface UpdateReservationModalProps {
  onClose: () => void;
  reservation: ReservationType;
}

const UpdateReservation: React.FC<UpdateReservationModalProps> = ({
  onClose,
  reservation,
}) => {
  const t = useTranslations("reservations");
  const tf = useTranslations("reservations.form");

  const translateForm = (key: string, fallback: string) => {
    try {
      const res = tf(key);
      // If translation not found, next-intl returns a dotted key like 'reservations.form.key'
      if (typeof res === "string" && res.includes("reservations.form")) {
        return fallback;
      }
      return res;
    } catch (e) {
      return fallback;
    }
  };
  const { data: loggedUser, isLoading: isUserLoading } = useGetLoggedUserQuery(
    {},
  );
  const [updateReservation, { isLoading: isUpdating }] =
    useUpdateReservationMutation();
  const [allergenInput, setAllergenInput] = React.useState("");
  const [promoDisplay, setPromoDisplay] = React.useState("");

  // Helper functions to extract UIDs from nested objects - using useMemo for stable references
  const initialOrgUid = React.useMemo(() => {
    return typeof reservation.organization === "object" &&
      reservation.organization !== null
      ? (reservation.organization as { uid?: string }).uid || ""
      : "";
  }, [reservation.organization]);

  const initialPromoCode = React.useMemo(() => {
    if (reservation.promo_code) {
      return typeof reservation.promo_code === "object" &&
        reservation.promo_code !== null
        ? (reservation.promo_code as { uid?: string }).uid || ""
        : reservation.promo_code;
    }
    return "";
  }, [reservation.promo_code]);

  const initialPromoLabel = React.useMemo(() => {
    if (!reservation.promo_code) return "";
    if (
      typeof reservation.promo_code === "object" &&
      reservation.promo_code !== null
    ) {
      const promo = reservation.promo_code as {
        reward_label?: string;
        label?: string;
        name?: string;
      };
      return promo.reward_label || promo.label || promo.name || "";
    } else {
      return reservation.promo_code as string;
    }
  }, [reservation.promo_code]);

  React.useEffect(() => {
    setPromoDisplay(initialPromoLabel);
  }, [initialPromoLabel]);

  // Compute initial table label (used when table options haven't loaded yet)
  const initialTableLabel = React.useMemo(() => {
    if (!reservation.table) return "";
    if (typeof reservation.table === "object" && reservation.table !== null) {
      const tbl = reservation.table as {
        name?: string;
        label?: string;
        uid?: string;
      };
      return tbl.name || tbl.label || tbl.uid || "";
    }
    // reservation.table might already be a string label
    return reservation.table as string;
  }, [reservation.table]);

  const getInitialTableUid = () => {
    return reservation.table?.uid || "";
  };

  const getInitialMenuUids = () => {
    if (reservation.menus && Array.isArray(reservation.menus)) {
      return reservation.menus.map((menu) => menu.uid);
    }
    return [];
  };

  // Format time to HH:MM (remove seconds)
  const getInitialTime = (timeString: string) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  // Convert API organization data to Dropdown-compatible format
  const organizations = React.useMemo(() => {
    if (!loggedUser?.organizations) return [];
    return loggedUser.organizations.map(
      (org: { name: string; uid: string }) => ({
        value: org.uid,
        label: org.name,
      }),
    );
  }, [loggedUser]);

  const form = useForm<UpdateReservationFormData>({
    resolver: zodResolver(updateReservationSchema),
    defaultValues: {
      reservation_name: reservation.reservation_name || "",
      client_name: reservation.client.name || "",
      client_phone: reservation.client.whatsapp_number || "",
      client_allergens: reservation.client.allergens || [],
      reservation_date: reservation.reservation_date || "",
      reservation_time: getInitialTime(reservation.reservation_time || ""),
      reservation_reason: reservation.reservation_reason || "",
      guests: reservation.guests || 1,
      notes: reservation.notes || "",
      reservation_status:
        (reservation.reservation_status as
          | "PLACED"
          | "INPROGRESS"
          | "CANCELLED"
          | "COMPLETED"
          | "RESCHEDULED"
          | "ABSENT"
          | undefined) || "PLACED",
      cancelled_by: reservation.cancelled_by || undefined,
      cancellation_reason: reservation.cancellation_reason || "",
      menus: getInitialMenuUids(),
      table: getInitialTableUid(),
      organization: initialOrgUid,
      promo_code: initialPromoCode,
    },
  });

  // Keep a snapshot of initial form values so we can detect actual value changes
  const initialValuesRef = React.useRef<Record<string, unknown> | null>(null);
  React.useEffect(() => {
    initialValuesRef.current = form.getValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch menu data based on selected organization
  const selectedRestaurant = form.watch("organization");
  const promoValue = form.watch("promo_code");
  const reservationStatus = form.watch("reservation_status");
  const reservation_date = form.watch("reservation_date");
  const reservation_time = form.watch("reservation_time");

  const { data: promotions, isLoading: isPromotionsLoading } =
    useGetRestaurantPromotionsQuery(selectedRestaurant, {
      skip: !selectedRestaurant,
    });

  const { data: menu, isLoading: isMenuLoading } =
    useGetSingleRestaurantMenuQuery(selectedRestaurant, {
      skip: !selectedRestaurant,
    });

  const { data: tables, isLoading: isTableLoading } = useGetTablesQuery(
    { id: selectedRestaurant, reservation_date, reservation_time },
    {
      skip: !selectedRestaurant,
    },
  );

  // Convert promotion data to Dropdown-compatible format
  const promotionOptions = React.useMemo(() => {
    if (!promotions?.results) return [];
    return promotions.results.map(
      (promo: { uid: string; reward_label?: string; label?: string }) => ({
        value: promo.uid,
        label: promo.reward_label || promo.label || promo.uid,
      }),
    );
  }, [promotions]);

  // Convert table data to Dropdown-compatible format
  const tableOptions = React.useMemo(() => {
    if (!tables?.results) return [];
    return tables.results.map((item: { uid: string; name: string }) => ({
      value: item.uid,
      label: item.name,
    }));
  }, [tables]);

  // Convert menu data to Dropdown-compatible format
  const menuOptions = React.useMemo(() => {
    if (!menu?.results) return [];
    return menu.results.map((item: { uid: string; name: string }) => ({
      value: item.uid,
      label: item.name,
    }));
  }, [menu]);

  // Update promo display when options or value change
  React.useEffect(() => {
    if (!promoValue) {
      setPromoDisplay("");
      return;
    }
    const option = promotionOptions.find(
      (opt: { value: string; label: string }) => opt.value === promoValue,
    );
    if (option) {
      setPromoDisplay(option.label);
    } else {
      setPromoDisplay(initialPromoLabel || promoValue);
    }
  }, [promotionOptions, promoValue, initialPromoLabel]);

  // Track if this is the first load
  const isFirstLoad = React.useRef(true);

  // Reset menus and promo_code when organization changes, but preserve initial values on first load
  React.useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (selectedRestaurant !== initialOrgUid) {
      form.setValue("menus", []);
      form.setValue("promo_code", "");
      setPromoDisplay("");
    }
  }, [selectedRestaurant, form, initialOrgUid]);

  // Adjust promo_code if it's a code string to uid after promotions load
  React.useEffect(() => {
    if (isPromotionsLoading || !promotionOptions.length) return;

    const currentPromo = form.getValues("promo_code");
    if (
      currentPromo &&
      !promotionOptions.find(
        (opt: { value: string; label: string }) => opt.value === currentPromo,
      )
    ) {
      // Assume it's a code, find by label
      const matching = promotionOptions.find(
        (opt: { value: string; label: string }) => opt.label === currentPromo,
      );
      if (matching) {
        form.setValue("promo_code", matching.value);
      }
      // else leave as is (will display the code)
    }
  }, [promotionOptions, form, isPromotionsLoading]);

  const handleAddAllergen = () => {
    if (allergenInput.trim()) {
      const currentAllergens = form.watch("client_allergens") || [];
      if (!currentAllergens.includes(allergenInput.trim())) {
        form.setValue("client_allergens", [
          ...currentAllergens,
          allergenInput.trim(),
        ]);
      }
      setAllergenInput("");
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    const currentAllergens = form.watch("client_allergens") || [];
    form.setValue(
      "client_allergens",
      currentAllergens.filter((a) => a !== allergen),
    );
  };

  const handleSubmit = async (values: UpdateReservationFormData) => {
    try {
      // Build payload by comparing current values to the initial snapshot
      const initial = initialValuesRef.current || {};
      const payload: Record<string, unknown> = {};

      Object.keys(values).forEach((key) => {
        const k = key as keyof UpdateReservationFormData;
        const newVal = values[k];
        const oldVal = (initial as Record<string, unknown>)[key];

        const isEqual = (() => {
          if (Array.isArray(newVal) || Array.isArray(oldVal)) {
            return JSON.stringify(newVal) === JSON.stringify(oldVal);
          }
          if (
            typeof newVal === "object" &&
            newVal !== null &&
            typeof oldVal === "object" &&
            oldVal !== null
          ) {
            return JSON.stringify(newVal) === JSON.stringify(oldVal);
          }
          return newVal === oldVal;
        })();

        if (!isEqual) {
          let val: unknown = newVal;

          // If time was changed, append seconds
          if (key === "reservation_time" && typeof val === "string" && val) {
            val = `${val}:00`;
          }

          // If promo_code was explicitly cleared by user, don't send empty string
          if (key === "promo_code" && val === "") {
            return; // omit
          }

          payload[key] = val;
        }
      });

      // If nothing changed, notify and skip request
      if (Object.keys(payload).length === 0) {
        toast.error(translateForm("noChanges", "No changes to update"));
        return;
      }

      await updateReservation({
        uid: reservation.uid,
        data: payload,
      }).unwrap();

      // toast success
      toast.success(
        translateForm(
          "success.reservationUpdated",
          "Reservation updated successfully",
        ),
      );
      onClose();
      form.reset();
    } catch (error: unknown) {
      console.error("Failed to update reservation:", error);

      if (typeof error === "object" && error !== null) {
        const errObj = error as {
          status?: number;
          data?: Record<string, unknown>;
        };

        if (errObj.status === 400 && errObj.data) {
          const errors = errObj.data;

          Object.keys(errors).forEach((key) => {
            const v = errors[key];
            const errorMessage = Array.isArray(v) ? (v as unknown[])[0] : v;
            if (typeof errorMessage === "string") {
              toast.error(errorMessage);
            } else {
              toast.error(String(errorMessage));
            }
          });
          return;
        }
      }

      toast.error(
        translateForm(
          "failure.reservationUpdate",
          "Failed to update reservation. Please try again.",
        ),
      );
    }
  };

  if (isUserLoading) {
    return <div className="p-8 text-center text-gray-600">{t("loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl rounded-xl p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h2>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.reservationName")}
            </label>
            <input
              type="text"
              placeholder={t("details.reservationName")}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...form.register("reservation_name")}
            />
            {form.formState.errors.reservation_name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reservation_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.clientName")}
            </label>
            <input
              type="text"
              placeholder={t("details.clientName")}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...form.register("client_name")}
            />
            {form.formState.errors.client_name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.client_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.contactNumber")}
            </label>
            <input
              type="text"
              placeholder={t("details.contactNumber")}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...form.register("client_phone")}
            />
            {form.formState.errors.client_phone && (
              <p className="text-sm text-red-600">
                {form.formState.errors.client_phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.allergens")}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAllergen();
                  }
                }}
                placeholder={t("details.allergens")}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={handleAddAllergen}
                className="hover:bg-sidebar-accent-hover rounded-lg bg-sidebar-accent px-6 py-3 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
              >
                {t("details.add")}
              </button>
            </div>
            {form.watch("client_allergens") &&
              form.watch("client_allergens").length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.watch("client_allergens").map((allergen) => (
                    <div
                      key={allergen}
                      className="flex items-center rounded-full bg-red-50 px-3 py-1.5 text-sm text-red-700"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("details.organization")}
          </label>
          <Dropdown
            options={organizations}
            placeholder={t("details.organization")}
            onChange={(value) => form.setValue("organization", value as string)}
            value={form.watch("organization")}
            searchable
          />
          {form.formState.errors.organization && (
            <p className="text-sm text-red-600">
              {form.formState.errors.organization.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.date")}
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...form.register("reservation_date")}
            />
            {form.formState.errors.reservation_date && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reservation_date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.time")}
            </label>
            <TimePicker
              value={form.watch("reservation_time")}
              onChange={(value) => form.setValue("reservation_time", value)}
              placeholder={t("details.time")}
            />
            {form.formState.errors.reservation_time && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reservation_time.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.partySize")}
            </label>
            <input
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              min={1}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...form.register("guests", { valueAsNumber: true })}
            />
            {form.formState.errors.guests && (
              <p className="text-sm text-red-600">
                {form.formState.errors.guests.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.tableSelection")}
            </label>
            {isTableLoading ? (
              <div className="text-sm text-gray-600">{t("loading")}</div>
            ) : (
              <Dropdown
                options={tableOptions}
                placeholder={t("details.tableSelection")}
                onChange={(value) => form.setValue("table", value as string)}
                value={form.watch("table") || ""}
                displayValue={initialTableLabel}
              />
            )}
            {form.formState.errors.table && (
              <p className="text-sm text-red-600">
                {form.formState.errors.table.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("filters.status.label")}
            </label>
            <Dropdown
              options={[
                { value: "PLACED", label: t("form.status.placed") },
                { value: "INPROGRESS", label: t("form.status.inProgress") },
                { value: "CANCELLED", label: t("form.status.cancelled") },
                { value: "COMPLETED", label: t("form.status.completed") },
                { value: "RESCHEDULED", label: t("form.status.rescheduled") },
                { value: "ABSENT", label: t("form.status.absent") },
              ]}
              placeholder={t("details.status.selectStatus")}
              onChange={(value) =>
                form.setValue(
                  "reservation_status",
                  value as
                    | "PLACED"
                    | "INPROGRESS"
                    | "CANCELLED"
                    | "COMPLETED"
                    | "RESCHEDULED"
                    | "ABSENT",
                )
              }
              value={form.watch("reservation_status")}
            />
            {form.formState.errors.reservation_status && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reservation_status.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("details.menuSelection")}
            </label>
            {isMenuLoading ? (
              <div className="text-sm text-gray-600">{t("loading")}</div>
            ) : (
              <>
                <Dropdown
                  options={menuOptions}
                  placeholder={t("details.menuSelection")}
                  onChange={(value) =>
                    form.setValue("menus", value as string[])
                  }
                  value={form.watch("menus") || []}
                  multiple
                  searchable
                />
              </>
            )}
            {form.formState.errors.menus && (
              <p className="text-sm text-red-600">
                {form.formState.errors.menus.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("form.promotionCode")}
            </label>
            {isPromotionsLoading ? (
              <div className="text-sm text-gray-600">{t("loading")}</div>
            ) : (
              <Dropdown
                options={promotionOptions}
                placeholder={t("form.promotionCodePlaceholder")}
                onChange={(value) =>
                  form.setValue("promo_code", value as string)
                }
                value={form.watch("promo_code") || ""}
                displayValue={promoDisplay}
                searchable
              />
            )}
            {form.formState.errors.promo_code && (
              <p className="text-sm text-red-600">
                {form.formState.errors.promo_code.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("details.reasonForVisit")}
          </label>
          <input
            type="text"
            placeholder={t("details.reasonForVisit")}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...form.register("reservation_reason")}
          />
          {form.formState.errors.reservation_reason && (
            <p className="text-sm text-red-600">
              {form.formState.errors.reservation_reason.message}
            </p>
          )}
        </div>

        {reservationStatus === "CANCELLED" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cancellation Reason *
            </label>
            <textarea
              placeholder="Please provide a reason for cancellation"
              className="min-h-[100px] w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...form.register("cancellation_reason")}
            />
            {form.formState.errors.cancellation_reason && (
              <p className="text-sm text-red-600">
                {translateForm(
                  String(
                    form.formState.errors.cancellation_reason?.message ||
                      "errors.cancellationRequiredWhenCancelled",
                  ),
                  "Cancellation reason is required when status is CANCELLED",
                )}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("details.notes")}
          </label>
          <textarea
            placeholder={t("details.notes")}
            className="min-h-[120px] w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...form.register("notes")}
          />
          {form.formState.errors.notes && (
            <p className="text-sm text-red-600">
              {form.formState.errors.notes.message}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {t("details.back")}
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-lg bg-sidebar-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sidebar-accent/90 disabled:opacity-50"
          >
            {isUpdating ? t("loading") : t("details.update")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateReservation;
