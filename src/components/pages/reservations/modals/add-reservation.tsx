"use client";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useAddReservationMutation } from "@/redux/reducers/reservation-reducer";
import {
  useGetRestaurantPromotionsQuery,
  useGetSingleRestaurantMenuQuery,
  useGetTablesQuery,
} from "@/redux/reducers/restaurants-reducer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Custom Dropdown Component
interface DropdownProps {
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
}

function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  multiple = false,
  searchable = false,
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
              ? options.find((opt) => opt.value === value)?.label
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

interface AddReservationModalProps {
  onClose: () => void;
}

const AddReservationModal: React.FC<AddReservationModalProps> = ({
  onClose,
}) => {
  const t = useTranslations("reservations.form");
  const { data: loggedUser, isLoading: isUserLoading } = useGetLoggedUserQuery(
    {},
  );

  const [addReservation, { isLoading: isAdding }] = useAddReservationMutation();
  const [allergenInput, setAllergenInput] = React.useState("");

  const organizations = React.useMemo(() => {
    if (!loggedUser?.organizations) return [];
    return loggedUser.organizations.map(
      (org: { name: string; uid: string }) => ({
        value: org.uid,
        label: org.name,
      }),
    );
  }, [loggedUser]);

  const reservationSchema = z.object({
    reservation_name: z.string().optional(),
    client_name: z.string().min(1, t("errors.guestNameRequired")),
    client_phone: z.string().min(1, t("errors.phoneRequired")),
    client_allergens: z.array(z.string()),
    reservation_date: z.string().min(1, t("errors.dateRequired")),
    reservation_time: z.string().min(1, t("errors.timeRequired")),
    guests: z.number().min(1, t("errors.guestsRequired")),
    reservation_reason: z.string().optional(),
    notes: z.string().optional(),
    menus: z.array(z.string()).optional(),
    table: z.string().min(1, t("errors.tableRequired")),
    organization: z.string().min(1, t("errors.restaurantRequired")),
    promo_code: z.string().optional(),
  });

  const form = useForm<z.infer<typeof reservationSchema>>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      reservation_name: "",
      client_name: "",
      client_phone: "",
      client_allergens: [],
      reservation_date: "",
      reservation_time: "",
      guests: 1,
      reservation_reason: "",
      notes: "",
      menus: [],
      table: "",
      organization: "",
      promo_code: "",
    },
  });

  const selectedRestaurant = form.watch("organization");
  const reservation_date = form.watch("reservation_date");
  const reservation_time = form.watch("reservation_time");

  const { data: promotions, isLoading: isPromotionsLoading } =
    useGetRestaurantPromotionsQuery(selectedRestaurant, {
      skip: !selectedRestaurant,
    });

  const promotionOptions = React.useMemo(() => {
    if (!promotions?.results) return [];
    return promotions.results.map(
      (promo: { uid: string; reward_label: string }) => ({
        value: promo.uid,
        label: promo.reward_label,
      }),
    );
  }, [promotions]);

  const { data: menu, isLoading: isMenuLoading } =
    useGetSingleRestaurantMenuQuery(selectedRestaurant, {
      skip: !selectedRestaurant,
    });
  const { data: tables, isLoading: isTableLoading } = useGetTablesQuery(
    { id: selectedRestaurant, reservation_date, reservation_time },
    { skip: !selectedRestaurant || !reservation_date || !reservation_time },
  );

  const tableOptions = React.useMemo(() => {
    if (!tables?.results) return [];
    return tables.results
      .filter((table: { status?: string }) => table.status === "AVAILABLE")
      .map((table: { uid: string; name: string }) => ({
        value: table.uid,
        label: table.name,
      }));
  }, [tables]);

  const menuOptions = React.useMemo(() => {
    if (!menu?.results) return [];
    return menu.results.map((item: { uid: string; name: string }) => ({
      value: item.uid,
      label: item.name,
    }));
  }, [menu]);

  React.useEffect(() => {
    form.setValue("menus", []);
    form.setValue("promo_code", "");
  }, [selectedRestaurant, form]);

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

  const handleSubmit = async (values: z.infer<typeof reservationSchema>) => {
    if (values.reservation_time) {
      values.reservation_time = `${values.reservation_time}:00`;
    }

    await addReservation(values);
    onClose();
    form.reset();
  };

  if (isUserLoading) {
    return null;
  }

  return (
    <div className="py-8">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("reservationName")}
            </label>
            <input
              type="text"
              placeholder={t("reservationNamePlaceholder")}
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
              {t("guestName")}
            </label>
            <input
              type="text"
              placeholder={t("guestNamePlaceholder")}
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
              {t("phoneNumber")}
            </label>
            <input
              type="text"
              placeholder={t("phoneNumberPlaceholder")}
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
              {t("allergens")}
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
                placeholder={t("allergensPlaceholder")}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={handleAddAllergen}
                className="hover:bg-sidebar-accent-hover rounded-lg bg-sidebar-accent px-6 py-3 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
              >
                {t("addAllergen")}
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
            {t("restaurant")}
          </label>
          <Dropdown
            options={organizations}
            placeholder={t("selectRestaurant")}
            onChange={form.setValue.bind(null, "organization")}
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
              {t("date")}
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
              {t("time")}
            </label>
            <TimePicker
              value={form.watch("reservation_time")}
              onChange={(value) => form.setValue("reservation_time", value)}
              placeholder={t("selectTime")}
            />
            {form.formState.errors.reservation_time && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reservation_time.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("numberOfGuests")}
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
              {t("tableSelection")}
            </label>
            {isTableLoading ? (
              <div className="text-sm text-gray-600">{t("loadingTables")}</div>
            ) : (
              <Dropdown
                options={tableOptions}
                placeholder={t("chooseTable")}
                onChange={form.setValue.bind(null, "table")}
                value={form.watch("table") || ""}
              />
            )}
            {form.formState.errors.table && (
              <p className="text-sm text-red-600">
                {form.formState.errors.table.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("menuSelection")}
            </label>
            {isMenuLoading ? (
              <div className="text-sm text-gray-600">{t("loadingMenus")}</div>
            ) : (
              <Dropdown
                options={menuOptions}
                placeholder={t("selectMenus")}
                onChange={(value) => form.setValue("menus", value as string[])}
                value={form.watch("menus") || []}
                multiple
                searchable
              />
            )}
            {form.formState.errors.menus && (
              <p className="text-sm text-red-600">
                {form.formState.errors.menus.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("addPromotion")}
            </label>
            {isPromotionsLoading ? (
              <div className="text-sm text-gray-600">
                {t("loadingPromotions")}
              </div>
            ) : (
              <Dropdown
                options={promotionOptions}
                placeholder={t("selectPromotion")}
                onChange={(value) =>
                  form.setValue("promo_code", value as string)
                }
                value={form.watch("promo_code") || ""}
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
            {t("reservationReason")}
          </label>
          <input
            type="text"
            placeholder={t("reservationReasonPlaceholder")}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...form.register("reservation_reason")}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("additionalNotes")}
          </label>
          <textarea
            placeholder={t("additionalNotesPlaceholder")}
            className="min-h-[120px] w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...form.register("notes")}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sidebar-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sidebar-accent/90"
          >
            {isAdding ? t("adding") : t("createReservation")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReservationModal;
