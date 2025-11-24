"use client";
import ChatbotDetailsSkeleton from "@/components/pages/chatbots/skeletons/chatbot-details-skeleton";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useGetSingleWhatsappBotQuery,
  useUpdateWhatsappBotMutation,
} from "@/redux/reducers/whatsapp-reducer";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type SubmitData = {
  chatbot_name: string;
  sales_level: {
    level: number;
    reward_enabled?: boolean;
    priority_dish_enabled?: boolean;
    personalization_enabled?: boolean;
    reward?: {
      type?: "DRINK" | "DESSERT" | "DISCOUNT" | "CUSTOM";
      label?: string;
    };
  };
  twilio_sid: string;
  twilio_auth_token: string;
  twilio_number: string;
  openai_key: string;
  assistant_id: string;
  organization: string;
};

export interface ChatbotData {
  uid: string;
  chatbot_name: string;
  chatbot_language: string;
  chatbot_tone: string;
  chatbot_custom_tone: string | null;
  sales_level: {
    level: number;
    name: string;
    reward_enabled: boolean;
    reward: {
      uid: string;
      type: "DRINK" | "DESSERT" | "DISCOUNT" | "CUSTOM";
      label: string;
    } | null;
    personalization_enabled: boolean;
    priority_dish_enabled: boolean;
  };
  openai_key: string;
  assistant_id: string;
  twilio_sid: string;
  twilio_auth_token: string;
  twilio_number: string;
  organization: string;
  webhook_url: string;
}

const ChatbotConfigurePage = () => {
  const { uid } = useParams<{ uid: string }>();
  const [isCopied, setIsCopied] = useState(false);
  const t = useTranslations("chatbots.configure");

  const { data: chatbot, isLoading, error } = useGetSingleWhatsappBotQuery(uid);
  const [updateWhatsappBot, { isLoading: isUpdating }] =
    useUpdateWhatsappBotMutation();

  const formSchema = z
    .object({
      chatbot_name: z
        .string()
        .min(1, { message: t("errors.chatbotNameRequired") }),
      sales_level: z.object({
        level: z.number().int().min(1).max(5),
        reward_enabled: z.boolean().optional(),
        priority_dish_enabled: z.boolean().optional(),
        personalization_enabled: z.boolean().optional(),
        reward: z
          .object({
            type: z.enum(["DRINK", "DESSERT", "DISCOUNT", "CUSTOM"]).optional(),
            label: z.string().max(100).optional(),
          })
          .optional(),
      }),
      twilio_sid: z.string().min(1, { message: t("errors.twilioSidRequired") }),
      twilio_auth_token: z
        .string()
        .min(1, { message: t("errors.twilioAuthTokenRequired") }),
      twilio_number: z
        .string()
        .min(1, { message: t("errors.whatsappSenderRequired") }),
      openai_key: z
        .string()
        .min(1, { message: t("errors.openaiApiKeyRequired") }),
      assistant_id: z
        .string()
        .min(1, { message: t("errors.assistantIdRequired") }),
      organization: z.string(),
    })
    .superRefine((data, ctx) => {
      const level = data.sales_level.level;

      // Level 2: reward is required
      if (level === 2) {
        if (!data.sales_level.reward?.type) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.rewardTypeRequiredForLevel2"),
            path: ["sales_level", "reward", "type"],
          });
        }
        if (
          !data.sales_level.reward?.label ||
          data.sales_level.reward.label.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.rewardLabelRequiredForLevel2"),
            path: ["sales_level", "reward", "label"],
          });
        }
      }

      // Level 3: if reward_enabled is true, reward is required
      if (level === 3 && data.sales_level.reward_enabled) {
        if (!data.sales_level.reward?.type) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.rewardTypeRequiredWhenEnabled"),
            path: ["sales_level", "reward", "type"],
          });
        }
        if (
          !data.sales_level.reward?.label ||
          data.sales_level.reward.label.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.rewardLabelRequiredWhenEnabled"),
            path: ["sales_level", "reward", "label"],
          });
        }
      }

      // Level 4: if reward_enabled is true, reward is required
      if (level === 4 && data.sales_level.reward_enabled) {
        if (!data.sales_level.reward?.type) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.rewardTypeRequiredWhenEnabled"),
            path: ["sales_level", "reward", "type"],
          });
        }
        if (
          !data.sales_level.reward?.label ||
          data.sales_level.reward.label.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.rewardLabelRequiredWhenEnabled"),
            path: ["sales_level", "reward", "label"],
          });
        }
      }
    });

  type ChatbotFormData = z.infer<typeof formSchema>;

  const form = useForm<ChatbotFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatbot_name: "",
      sales_level: {
        level: 1,
        reward_enabled: false,
        priority_dish_enabled: false,
        personalization_enabled: false,
        reward: {
          type: undefined,
          label: "",
        },
      },
      twilio_sid: "",
      twilio_auth_token: "",
      twilio_number: "",
      openai_key: "",
      assistant_id: "",
      organization: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (chatbot) {
      const salesLevel =
        typeof chatbot.sales_level === "object"
          ? chatbot.sales_level.level
          : typeof chatbot.sales_level === "string"
            ? parseInt(chatbot.sales_level, 10)
            : chatbot.sales_level || 1;

      const salesLevelData =
        typeof chatbot.sales_level === "object"
          ? chatbot.sales_level
          : {
              level: salesLevel,
              reward_enabled: false,
              priority_dish_enabled: false,
              personalization_enabled: false,
              reward: null,
            };

      const resetData: ChatbotFormData = {
        chatbot_name: chatbot.chatbot_name || "",
        sales_level: {
          level: salesLevel,
          reward_enabled: salesLevelData.reward_enabled || false,
          priority_dish_enabled: salesLevelData.priority_dish_enabled || false,
          personalization_enabled:
            salesLevelData.personalization_enabled || false,
          reward: salesLevelData.reward
            ? {
                type: salesLevelData.reward.type,
                label: salesLevelData.reward.label || "",
              }
            : {
                type: undefined,
                label: "",
              },
        },
        twilio_sid: chatbot.twilio_sid || "",
        twilio_auth_token: chatbot.twilio_auth_token || "",
        twilio_number: chatbot.twilio_number || "",
        openai_key: chatbot.openai_key || "",
        assistant_id: chatbot.assistant_id || "",
        organization: chatbot.organization || "",
      };

      form.reset(resetData);

      // Force the form to update and trigger validation
      setTimeout(() => {
        form.trigger();
        // Force re-render by updating the sales level field
        form.setValue("sales_level.level", salesLevel);
      }, 100);
    }
  }, [chatbot, form]);

  const salesLevel = form.watch("sales_level.level");
  const rewardEnabled = form.watch("sales_level.reward_enabled");

  const onSubmit = async (data: ChatbotFormData) => {
    try {
      const submitData: SubmitData = {
        chatbot_name: data.chatbot_name,
        sales_level: {
          level: data.sales_level.level,
        },
        twilio_sid: data.twilio_sid,
        twilio_auth_token: data.twilio_auth_token,
        twilio_number: data.twilio_number,
        openai_key: data.openai_key,
        assistant_id: data.assistant_id,
        organization: data.organization,
      };

      // Level 2: Always include reward
      if (data.sales_level.level === 2) {
        submitData.sales_level.reward = data.sales_level.reward;
      }

      // Level 3: Include reward_enabled, and reward if enabled
      if (data.sales_level.level === 3) {
        submitData.sales_level.reward_enabled = data.sales_level.reward_enabled;
        if (
          data.sales_level.reward_enabled &&
          data.sales_level.reward?.type &&
          data.sales_level.reward?.label
        ) {
          submitData.sales_level.reward = data.sales_level.reward;
        }
      }

      // Level 4: Include reward_enabled, priority_dish_enabled, and reward if reward_enabled is true
      if (data.sales_level.level === 4) {
        submitData.sales_level.reward_enabled = data.sales_level.reward_enabled;
        submitData.sales_level.priority_dish_enabled =
          data.sales_level.priority_dish_enabled;
        if (
          data.sales_level.reward_enabled &&
          data.sales_level.reward?.type &&
          data.sales_level.reward?.label
        ) {
          submitData.sales_level.reward = data.sales_level.reward;
        }
      }

      // Level 5: Include priority_dish_enabled and personalization_enabled
      if (data.sales_level.level === 5) {
        submitData.sales_level.priority_dish_enabled =
          data.sales_level.priority_dish_enabled;
        submitData.sales_level.personalization_enabled =
          data.sales_level.personalization_enabled;
      }

      const res = await updateWhatsappBot({ uid, data: submitData });

      if ("data" in res) {
        toast.success(t("success.updateSuccess"));
      } else if ("error" in res) {
        console.error("Update error:", res.error);

        if (res.error && "data" in res.error) {
          const errorData = res.error.data as {
            chatbot_name?: string[];
            detail?: string;
            [key: string]: string[] | string | undefined;
          };

          if (
            errorData.chatbot_name?.[0] ===
            "A WhatsappBot already exists for this restaurant."
          ) {
            toast.error(t("errors.alreadyExists"));
          } else if (errorData.detail) {
            toast.error(errorData.detail);
          } else {
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              toast.error(firstError[0]);
            } else {
              toast.error(t("errors.updateFailed"));
            }
          }
        } else {
          toast.error(t("errors.updateFailed"));
        }
      }
    } catch (error) {
      console.error("Error updating chatbot:", error);
      toast.error(t("errors.updateError"));
    }
  };

  const maskSensitiveData = (value: string) => {
    if (!value) return "";
    if (value.length <= 5) return value;
    const firstPart = value.substring(0, 5);
    const maskedPart = "*".repeat(Math.max(0, value.length - 5));
    return `${firstPart}${maskedPart}`;
  };

  const handleCopyClick = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        chatbot?.webhook_url
      ) {
        await navigator.clipboard.writeText(chatbot.webhook_url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success(t("header.copied"));
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error(t("header.copyFailed"));
    }
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  if (isLoading) {
    return <ChatbotDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {t("errors.loadError")}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {t("errors.loadErrorDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {t("errors.notFound")}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {t("errors.notFoundDescription")}
          </p>
        </div>
      </div>
    );
  }

  const showRewardEnabled = salesLevel === 3 || salesLevel === 4;
  const showPriorityDish = salesLevel === 4 || salesLevel === 5;
  const showPersonalization = salesLevel === 5;
  const showRewardFields =
    salesLevel === 2 || (salesLevel >= 3 && salesLevel < 5 && rewardEnabled);

  return (
    <div>
      {/* Header */}
      <div className="relative h-52 w-full rounded-t-lg bg-gradient-to-b from-sidebar-accent to-sidebar">
        <div className="absolute left-4 top-4 z-10">
          <button
            onClick={handleGoBack}
            className="rounded-full bg-white/20 p-2 transition-all hover:bg-white/30"
            type="button"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/restaurant-demo.jpg"
                alt="Restaurant image"
                width={80}
                height={80}
                className="h-20 w-20 rounded-lg border-2 border-white object-cover shadow-lg"
              />
            </div>
            <div className="flex-1 text-white">
              <h3 className="text-2xl font-bold tracking-tight">
                {chatbot.chatbot_name}
              </h3>
              <p className="text-sm opacity-90">{chatbot.organization}</p>
              <p className="mt-1 text-sm opacity-90">
                {t("header.salesLevel")}:{" "}
                {typeof chatbot.sales_level === "object"
                  ? chatbot.sales_level.level
                  : chatbot.sales_level}
              </p>
              {chatbot.webhook_url && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatbot.webhook_url}
                    readOnly
                    className="flex-1 rounded border border-white/20 bg-white/10 px-3 py-1 text-xs text-white placeholder-white/50 backdrop-blur-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleCopyClick}
                    type="button"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("title")}</h2>
          <p className="mb-4 text-sm text-gray-600">{t("description")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Read-only Information Section */}
            <div className="rounded-lg border bg-gray-50/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                {t("authDetails.title")}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <FormLabel className="text-gray-600">
                    {t("authDetails.restaurant")}
                  </FormLabel>
                  <Input
                    disabled
                    value={chatbot.organization || ""}
                    className="mt-2 bg-gray-100 text-gray-700"
                  />
                </div>
                <div>
                  <FormLabel className="text-gray-600">
                    {t("authDetails.whatsappNumber")}
                  </FormLabel>
                  <Input
                    disabled
                    value={maskSensitiveData(
                      chatbot.twilio_number?.replace("whatsapp:", "") || "",
                    )}
                    className="mt-2 bg-gray-100 text-gray-700"
                  />
                </div>
                <div>
                  <FormLabel className="text-gray-600">
                    {t("authDetails.twilioSid")}
                  </FormLabel>
                  <Input
                    disabled
                    value={maskSensitiveData(chatbot.twilio_sid || "")}
                    className="mt-2 bg-gray-100 text-gray-700"
                  />
                </div>
                <div>
                  <FormLabel className="text-gray-600">
                    {t("authDetails.twilioAuthToken")}
                  </FormLabel>
                  <Input
                    disabled
                    value={maskSensitiveData(chatbot.twilio_auth_token || "")}
                    className="mt-2 bg-gray-100 text-gray-700"
                  />
                </div>
                <div>
                  <FormLabel className="text-gray-600">
                    {t("authDetails.openaiApiKey")}
                  </FormLabel>
                  <Input
                    disabled
                    value={maskSensitiveData(chatbot.openai_key || "")}
                    className="mt-2 bg-gray-100 text-gray-700"
                  />
                </div>
                <div>
                  <FormLabel className="text-gray-600">
                    {t("authDetails.assistantId")}
                  </FormLabel>
                  <Input
                    disabled
                    value={maskSensitiveData(chatbot.assistant_id || "")}
                    className="mt-2 bg-gray-100 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Editable Information Section */}
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                {t("chatbotSettings.title")}
              </h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="chatbot_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("chatbotSettings.chatbotName")}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder={t(
                            "chatbotSettings.chatbotNamePlaceholder",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sales_level.level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("chatbotSettings.salesLevel.label")}
                      </FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => {
                          if (val) {
                            field.onChange(parseInt(val, 10));
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "chatbotSettings.salesLevel.placeholder",
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">
                            {t("chatbotSettings.salesLevel.level1")}
                          </SelectItem>
                          <SelectItem value="2">
                            {t("chatbotSettings.salesLevel.level2")}
                          </SelectItem>
                          <SelectItem value="3">
                            {t("chatbotSettings.salesLevel.level3")}
                          </SelectItem>
                          <SelectItem value="4">
                            {t("chatbotSettings.salesLevel.level4")}
                          </SelectItem>
                          <SelectItem value="5">
                            {t("chatbotSettings.salesLevel.level5")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level 3 & 4: Reward Enabled Toggle */}
                {showRewardEnabled && (
                  <FormField
                    control={form.control}
                    name="sales_level.reward_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("chatbotSettings.enableRewards.label")}
                          </FormLabel>
                          <p className="text-sm text-gray-500">
                            {t("chatbotSettings.enableRewards.description")}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Level 4 & 5: Priority Dish Toggle */}
                {showPriorityDish && (
                  <FormField
                    control={form.control}
                    name="sales_level.priority_dish_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("chatbotSettings.enablePriorityDishes.label")}
                          </FormLabel>
                          <p className="text-sm text-gray-500">
                            {t(
                              "chatbotSettings.enablePriorityDishes.description",
                            )}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Level 5: Personalization Toggle */}
                {showPersonalization && (
                  <FormField
                    control={form.control}
                    name="sales_level.personalization_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("chatbotSettings.enablePersonalization.label")}
                          </FormLabel>
                          <p className="text-sm text-gray-500">
                            {t(
                              "chatbotSettings.enablePersonalization.description",
                            )}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Reward Configuration */}
                {showRewardFields && (
                  <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                    <h4 className="text-sm font-medium text-blue-800">
                      {t("chatbotSettings.rewardConfiguration.title")}{" "}
                      {salesLevel === 2 &&
                        t(
                          "chatbotSettings.rewardConfiguration.requiredForLevel2",
                        )}
                    </h4>

                    <FormField
                      control={form.control}
                      name="sales_level.reward.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              "chatbotSettings.rewardConfiguration.rewardType.label",
                            )}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "chatbotSettings.rewardConfiguration.rewardType.placeholder",
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DRINK">
                                {t(
                                  "chatbotSettings.rewardConfiguration.rewardType.drink",
                                )}
                              </SelectItem>
                              <SelectItem value="DESSERT">
                                {t(
                                  "chatbotSettings.rewardConfiguration.rewardType.dessert",
                                )}
                              </SelectItem>
                              <SelectItem value="DISCOUNT">
                                {t(
                                  "chatbotSettings.rewardConfiguration.rewardType.discount",
                                )}
                              </SelectItem>
                              <SelectItem value="CUSTOM">
                                {t(
                                  "chatbotSettings.rewardConfiguration.rewardType.custom",
                                )}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sales_level.reward.label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              "chatbotSettings.rewardConfiguration.rewardLabel.label",
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="off"
                              placeholder={t(
                                "chatbotSettings.rewardConfiguration.rewardLabel.placeholder",
                              )}
                              maxLength={100}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500">
                            {t(
                              "chatbotSettings.rewardConfiguration.rewardLabel.characterCount",
                              {
                                count: field.value?.length || 0,
                              },
                            )}
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <Button
                type="submit"
                disabled={!form.formState.isValid || isUpdating}
                className="min-w-32"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("buttons.saving")}
                  </>
                ) : (
                  t("buttons.saveChanges")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default ChatbotConfigurePage;
