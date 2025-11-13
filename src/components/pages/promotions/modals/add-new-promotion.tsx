/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useAddNewPromotionMutation } from "@/redux/reducers/promotions-reducer";
import { toast } from "sonner";
import {
  useGetMessageTemplatesQuery,
  useGetSingleRestaurantMenuQuery,
} from "@/redux/reducers/restaurants-reducer";

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
    option.label.toLowerCase().includes(search.toLowerCase()),
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
                placeholder="Search here..."
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
          )}
          {filteredOptions.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Opps! there is none.
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



const promotionSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("form.errors.titleRequired")),
    message_template: z.string().min(1, t("form.errors.messageTemplateRequired")),
    message: z.string().min(1, t("form.errors.messageRequired")),
    reward: z.object({
      uid: z.string(),
      type: z.enum(["DRINK", "DESSERT", "DISCOUNT", "CUSTOM"]),
      label: z
        .string()
        .min(1, t("form.errors.rewardLabelInvalid"))
        .max(24, t("form.errors.rewardLabelInvalid")),
    }),
    organization: z.string().min(1, t("form.errors.restaurantRequired")),
    valid_from: z.string().min(1, t("form.errors.validFromRequired")),
    valid_to: z.string().min(1, t("form.errors.validToRequired")),
    trigger: z.object({
      uid: z.string(),
      type: z.enum(
        ["YEARLY", "MENU_SELECTED", "INACTIVITY", "RESERVATION_COUNT"],
      ),
      yearly_category: z.enum(["ANNIVERSARY", "BIRTHDAY"]).optional(),
      days_before: z.number().min(1, t("form.errors.daysBeforeInvalid")).optional(),
      inactivity_days: z.number().min(1, t("form.errors.inactivityDaysInvalid")).optional(),
      min_count: z.number().min(1, t("form.errors.minCountInvalid")).optional(),
      menus: z.array(z.string()).optional(),
    }),
    is_enabled: z.boolean(),
  });

type PromotionFormData = z.infer<ReturnType<typeof promotionSchema>>;

interface AddPromotionModalProps {
  onClose: () => void;
}

const AddPromotionModal: React.FC<AddPromotionModalProps> = ({ onClose }) => {
  const t = useTranslations("promotions");
  const locale = useLocale()
  
  const { data: loggedUser, isLoading: isUserLoading } = useGetLoggedUserQuery(
    {},
  );

  const rewardTypeOptions = [
    { value: "DRINK", label: t("form.dropdownValues.rewardTypeOptions.DRINK") },
    {
      value: "DESSERT",
      label: t("form.dropdownValues.rewardTypeOptions.DESSERT"),
    },
    {
      value: "DISCOUNT",
      label: t("form.dropdownValues.rewardTypeOptions.DISCOUNT"),
    },
    {
      value: "CUSTOM",
      label: t("form.dropdownValues.rewardTypeOptions.CUSTOM"),
    },
  ];

  const YearlyCategory = [
    {
      value: "ANNIVERSARY",
      label: t("form.dropdownValues.yearlyCategoryOptions.ANNIVERSARY"),
    },
    {
      value: "BIRTHDAY",
      label: t("form.dropdownValues.yearlyCategoryOptions.BIRTHDAY"),
    },
  ];

  const triggerTypeOptions = [
    {
      value: "YEARLY",
      label: t("form.dropdownValues.triggerTypeOptions.YEARLY"),
    },
    {
      value: "MENU_SELECTED",
      label: t("form.dropdownValues.triggerTypeOptions.MENU_SELECTED"),
    },
    {
      value: "INACTIVITY",
      label: t("form.dropdownValues.triggerTypeOptions.INACTIVITY"),
    },
    {
      value: "RESERVATION_COUNT",
      label: t("form.dropdownValues.triggerTypeOptions.RESERVATION_COUNT"),
    },
  ];

  const [addNewPromotion, { isLoading: isAdding }] =
    useAddNewPromotionMutation();

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema(t)),
    defaultValues: {
      title: "",
      message_template: "",
      message: "",
      reward: {
        uid: "",
        type: "DRINK",
        label: "",
      },
      organization: "",
      valid_from: "",
      valid_to: "",
      trigger: {
        uid: "",
        type: "YEARLY",
        yearly_category: "BIRTHDAY",
        days_before: 0,
        menus: [],
      },
      is_enabled: true,
    },
  });

  const organizations = React.useMemo(() => {
    if (!loggedUser?.organizations) return [];
    return loggedUser.organizations.map(
      (org: { name: string; uid: string }) => ({
        value: org.uid,
        label: org.name,
      }),
    );
  }, [loggedUser]);

  const selectedRestaurant = form.watch("organization");
  const { data: messageTemplatesData, isLoading: isMessageTemplatesLoading } =
    useGetMessageTemplatesQuery(selectedRestaurant, {
      skip: !selectedRestaurant,
    });

  // Fetch menu data based on selected organization
  const { data: menu, isLoading: isMenuLoading } =
    useGetSingleRestaurantMenuQuery(selectedRestaurant, {
      skip: !selectedRestaurant,
    });

  const selectedMessageTemplate = form.watch("message_template");
  const messageTemplates = React.useMemo(() => {
    if (!messageTemplatesData) return [];
    return messageTemplatesData?.results?.map(
      (org: { name: string; uid: string }) => ({
        value: org.uid,
        label: org.name,
      }),
    );
  }, [messageTemplatesData]);

  const menuOptions = React.useMemo(() => {
    if (!menu?.results) return [];
    return menu.results.map((item: { uid: string; name: string }) => ({
      value: item.uid,
      label: item.name,
    }));
  }, [menu]);

  const messageContent = messageTemplatesData?.results?.find(
    (message: { uid: string }) => message.uid === selectedMessageTemplate,
  )?.content;

  const messageContentVariables = React.useMemo(() => {
    return messageTemplatesData?.results?.find(
      (message: { uid: string }) => message.uid === selectedMessageTemplate,
    )?.content_variables;
  }, [messageTemplatesData, selectedMessageTemplate]);

  // Update message field when messageContent changes
  React.useEffect(() => {
    if (messageContent) {
      form.setValue("message", messageContent);
    }
  }, [messageContent, form]);

  const triggerType = form.watch("trigger.type");
  const yearlyCategory = form.watch("trigger.yearly_category");
  const validFrom = form.watch("valid_from");
  const validTo = form.watch("valid_to");

  // Reset relevant fields when trigger type changes
  React.useEffect(() => {
    if (triggerType !== "YEARLY") {
      form.setValue("trigger.yearly_category", undefined);
      form.setValue("trigger.days_before", undefined);
    }
    if (triggerType !== "INACTIVITY") {
      form.setValue("trigger.inactivity_days", undefined);
    }
    if (triggerType !== "RESERVATION_COUNT") {
      form.setValue("trigger.min_count", undefined);
    }
    if (triggerType !== "MENU_SELECTED") {
      form.setValue("trigger.menus", []);
    }
  }, [triggerType, form]);

  // Reset menus when restaurant changes
  React.useEffect(() => {
    form.setValue("trigger.menus", []);
  }, [selectedRestaurant, form]);

  // Validate and adjust valid_to when valid_from changes
  React.useEffect(() => {
    if (validFrom && validTo && validFrom > validTo) {
      form.setValue("valid_to", validFrom);
    }
  }, [validFrom, validTo, form]);

  const handleSubmit = async (values: PromotionFormData) => {
    try {
      await addNewPromotion(values).unwrap();
      toast.success(t("form.success.promotionAdded"));
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Failed to add promotion:", error);

      // Handle specific validation errors from the API
      if (error?.status === 400 && error?.data) {
        const errors = error.data;

        // Display reward label error
        if (errors.reward?.label) {
          form.setError("reward.label", {
            type: "manual",
            message: errors.reward.label[0] || t("form.failure.rewardLabel"),
          });
          toast.error(errors.reward.label[0] || t("form.failure.rewardLabel"));
        }

        // Handle other potential errors
        Object.keys(errors).forEach((key) => {
          if (key !== "reward" && errors[key]) {
            const errorMessage = Array.isArray(errors[key])
              ? errors[key][0]
              : errors[key];
            toast.error(`${key}: ${errorMessage}`);
          }
        });
      } else {
        toast.error(t("form.failure.promotionAdd"));
      }
    }
  };

  if (isUserLoading) {
    return <div className="p-8 text-center text-gray-600">{t("form.loading.user")}</div>;
  }

  return (
    <div className="mx-auto max-w-full rounded-xl">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900">{t("form.title")}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t("form.description")}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {t("form.titleLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={t("form.titlePlaceholder")}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.title.message ?? t("form.errors.titleRequired")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {t("form.restaurantLabel")} <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={organizations}
              placeholder={t("form.restaurantPlaceholder")}
              onChange={(value: string | string[]) => {
                if (typeof value === "string") {
                  form.setValue("organization", value);
                }
              }}
              value={form.watch("organization")}
              searchable
            />
            {form.formState.errors.organization && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.organization.message ??
                  t("form.errors.restaurantRequired")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {t("form.messageTemplateLabel")} <span className="text-red-500">*</span>
          </label>
          {isMessageTemplatesLoading ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              {t("form.loading.messageTemplates")}
            </div>
          ) : messageTemplates && messageTemplates.length > 0 ? (
            <Dropdown
              options={messageTemplates}
              placeholder={t("form.messageTemplatePlaceholder")}
              onChange={(value: string | string[]) => {
                if (typeof value === "string") {
                  form.setValue("message_template", value);
                }
              }}
              value={form.watch("message_template")}
              searchable
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              {t("form.noData.messageTemplates")}
            </div>
          )}
          {form.formState.errors.message_template && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.message_template.message ??
                t("form.errors.messageTemplateRequired")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {t("form.messageLabel")} <span className="text-red-500">*</span>
          </label>
          <textarea
            className="h-32 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder={t("form.messagePlaceholder")}
            value={messageContent || ""}
            readOnly
            {...form.register("message")}
          />
          {messageContentVariables ? (
            <div className="mt-2 text-xs text-gray-600">
              <div className="mb-1 font-medium">{t("form.availableVariables")}:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(messageContentVariables).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-block rounded bg-blue-100 px-2 py-1 text-blue-700"
                  >
                    {locale === "de"
                      ? `${key}: ${
                          key === "1"
                            ? "Kundenname"
                            : key === "2"
                            ? "Restaurantname"
                            : key === "3"
                            ? "Angebotsbeschreibung"
                            : key === "4"
                            ? "Angebotscode"
                            : key === "5"
                            ? "Ablaufdatum"
                            : (value as string)
                        }`
                      : `${key}: ${value as string}`}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-600">
              {t("form.noVariables")}
            </div>
          )}
          {form.formState.errors.message && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.message.message ?? t("form.errors.messageRequired")}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 ">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t("form.rewardDetails")}
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t("form.rewardTypeLabel")} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={rewardTypeOptions}
                placeholder={t("form.rewardTypePlaceholder")}
                onChange={(value) =>
                  form.setValue(
                    "reward.type",
                    value as "DRINK" | "DESSERT" | "DISCOUNT" | "CUSTOM",
                  )
                }
                value={form.watch("reward.type")}
              />
              {form.formState.errors.reward?.type && (
                <p className="mt-1 text-sm text-red-600">{t("form.errors.rewardTypeInvalid")}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t("form.rewardLabelLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder={t("form.rewardLabelPlaceholder")}
                maxLength={24}
                {...form.register("reward.label")}
              />
              <p className="text-xs text-gray-500">
                {t("form.characterCount", { count: form.watch("reward.label")?.length || 0 })}
              </p>
              {form.formState.errors.reward?.label && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.reward.label.message ??
                    t("form.errors.rewardLabelInvalid")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 ">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t("form.validityPeriod")}
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t("form.validFromLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                {...form.register("valid_from")}
              />
              {form.formState.errors.valid_from && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.valid_from.message ??
                    t("form.errors.validFromRequired")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t("form.validToLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={validFrom || undefined}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                {...form.register("valid_to")}
              />
              {form.formState.errors.valid_to && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.valid_to.message ??
                    t("form.errors.validToRequired")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t("form.triggerSettings")}
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t("form.triggerTypeLabel")} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={triggerTypeOptions}
                placeholder={t("form.triggerTypePlaceholder")}
                onChange={(value) =>
                  form.setValue(
                    "trigger.type",
                    value as
                      | "YEARLY"
                      | "MENU_SELECTED"
                      | "INACTIVITY"
                      | "RESERVATION_COUNT",
                  )
                }
                value={form.watch("trigger.type")}
              />
              {form.formState.errors.trigger?.type && (
                <p className="mt-1 text-sm text-red-600">
                  {t("form.errors.triggerTypeInvalid")}
                </p>
              )}
            </div>

            {/* Yearly Category - Show only when trigger type is YEARLY */}
            {triggerType === "YEARLY" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("form.yearlyCategoryLabel")} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={YearlyCategory}
                  placeholder={t("form.yearlyCategoryPlaceholder")}
                  onChange={(value) =>
                    form.setValue(
                      "trigger.yearly_category",
                      value as "ANNIVERSARY" | "BIRTHDAY",
                    )
                  }
                  value={form.watch("trigger.yearly_category") || ""}
                />
                {form.formState.errors.trigger?.yearly_category && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.trigger.yearly_category.message}
                  </p>
                )}
              </div>
            )}

            {/* Days Before - Show when trigger type is YEARLY and yearly category is selected */}
            {triggerType === "YEARLY" && yearlyCategory && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("form.daysBeforeLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder={t("form.daysBeforePlaceholder")}
                  {...form.register("trigger.days_before", {
                    valueAsNumber: true,
                  })}
                />
                {form.formState.errors.trigger?.days_before && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.trigger.days_before.message}
                  </p>
                )}
              </div>
            )}

            {/* Menu Selection - Show when trigger type is MENU_SELECTED */}
            {triggerType === "MENU_SELECTED" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("form.menuSelectionLabel")} <span className="text-red-500">*</span>
                </label>
                {isMenuLoading ? (
                  <div className="text-sm text-gray-600">{t("form.loading.menus")}</div>
                ) : menuOptions && menuOptions.length > 0 ? (
                  <Dropdown
                    options={menuOptions}
                    placeholder={t("form.menuSelectionPlaceholder")}
                    onChange={(value) =>
                      form.setValue("trigger.menus", value as string[])
                    }
                    value={form.watch("trigger.menus") || []}
                    multiple
                    searchable
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                    {t("form.noMenusAvailable")}
                  </div>
                )}
                {form.formState.errors.trigger?.menus && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.trigger.menus.message}
                  </p>
                )}
              </div>
            )}

            {/* Inactivity Days - Show when trigger type is INACTIVITY */}
            {triggerType === "INACTIVITY" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("form.inactivityDaysLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder={t("form.inactivityDaysPlaceholder")}
                  {...form.register("trigger.inactivity_days", {
                    valueAsNumber: true,
                  })}
                />
                {form.formState.errors.trigger?.inactivity_days && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.trigger.inactivity_days.message}
                  </p>
                )}
              </div>
            )}

            {/* Minimum Count - Show when trigger type is RESERVATION_COUNT */}
            {triggerType === "RESERVATION_COUNT" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("form.minimumCountLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder={t("form.minimumCountPlaceholder")}
                  {...form.register("trigger.min_count", {
                    valueAsNumber: true,
                  })}
                />
                {form.formState.errors.trigger?.min_count && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.trigger.min_count.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 rounded-lg bg-gray-50">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-200"
            {...form.register("is_enabled")}
          />
          <label className="text-sm font-medium text-gray-700">
            {t("form.enablePromotion")}
          </label>
        </div>

        <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {t("form.cancelButton")}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sidebar-accent px-6 py-2.5 text-sm font-medium text-white"
            disabled={isAdding}
          >
            {isAdding ? t("form.addingButton") : t("form.createButton")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPromotionModal;
