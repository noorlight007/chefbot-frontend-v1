import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import { useAddWhatsappBotMutation } from "@/redux/reducers/whatsapp-reducer";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const AddChatbot = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("chatbots");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: user, isLoading } = useGetLoggedUserQuery({});
  const [addWhatsappBot, { isLoading: isAdding }] = useAddWhatsappBotMutation();

  const form = useForm<ChatbotFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatbot_name: "",
      twilio_sid: "",
      twilio_auth_token: "",
      twilio_number: "",
      openai_key: "",
      organization_uid: "",
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = async (data: ChatbotFormData) => {
    try {
      const res = await addWhatsappBot(data);

      if ("data" in res) {
        onClose();
        toast.success(t("messages.createSuccess"));
      } else if ("error" in res) {
        if (res.error && "data" in res.error) {
          const errorData = res.error.data as {
            chatbot_name?: string[];
            detail?: string;
          };
          if (
            errorData.chatbot_name &&
            errorData.chatbot_name[0] ===
              "A WhatsappBot already exists for this restaurant."
          ) {
            toast.error(t("messages.alreadyExists"));
          } else {
            const errorMessage = errorData.detail || t("messages.createFailed");
            toast.error(errorMessage);
          }
        } else {
          toast.error(t("messages.createFailed"));
        }
      }
    } catch (error) {
      console.error("Error creating chatbot:", error);
      toast.error(t("messages.errorOccurred"));
    }
  };

  const restaurants = user?.organizations;

  const filteredRestaurants =
    restaurants?.filter((restaurant: RestaurantData) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("form.title")}</h2>
          <p className="mb-4 text-sm text-gray-600">{t("form.description")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="chatbot_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.chatbotName")}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder={t("form.chatbotNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Twilio Configuration */}
            <div className="space-y-4">
              <hr className="border-gray-200" />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="twilio_sid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.twilioSid")}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="new-password"
                          placeholder={t("form.twilioSidPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twilio_auth_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.twilioAuthToken")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showTwilioToken ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={t("form.twilioAuthTokenPlaceholder")}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowTwilioToken(!showTwilioToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showTwilioToken ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twilio_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.whatsappSender")}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder={t("form.whatsappSenderPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Final Configuration */}
            <div className="space-y-4">
              <hr className="border-gray-200" />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="openai_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.openaiApiKey")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showOpenAIKey ? "text" : "password"}
                            autoComplete="off"
                            placeholder={t("form.openaiApiKeyPlaceholder")}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showOpenAIKey ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization_uid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.selectRestaurant")}</FormLabel>
                      <FormControl>
                        <div className="relative" ref={dropdownRef}>
                          <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer bg-white"
                          >
                            <span className="text-sm">
                              {selectedRestaurant || t("form.selectRestaurantPlaceholder")}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </div>
                          {dropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                              <Input
                                placeholder={t("form.searchRestaurants")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0 border-b rounded-none"
                              />
                              <div className="max-h-40 overflow-y-auto">
                                {isLoading ? (
                                  <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                  </div>
                                ) : filteredRestaurants.length === 0 ? (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    {t("form.noRestaurantsFound")}
                                  </div>
                                ) : (
                                  filteredRestaurants.map(
                                    (restaurant: RestaurantData) => (
                                      <div
                                        key={restaurant.uid}
                                        onClick={() => {
                                          setSelectedRestaurant(restaurant.name);
                                          field.onChange(restaurant.uid);
                                          setDropdownOpen(false);
                                        }}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                      >
                                        {restaurant.name}
                                      </div>
                                    ),
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end border-t pt-6">
              <Button type="submit" disabled={!form.formState.isValid}>
                {isAdding ? t("form.addingButton") : t("form.addButton")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

const formSchema = z.object({
  chatbot_name: z.string().min(1, { message: "Chatbot name is required" }),
  twilio_sid: z.string().min(1, { message: "Twilio SID is required" }),
  twilio_auth_token: z
    .string()
    .min(1, { message: "Twilio Auth Token is required" }),
  twilio_number: z.string().min(1, { message: "WhatsApp sender is required" }),
  openai_key: z.string().min(1, { message: "OpenAI API key is required" }),
  organization_uid: z
    .string()
    .min(1, { message: "Restaurant selection is required" }),
});

type ChatbotFormData = z.infer<typeof formSchema>;

type RestaurantData = {
  uid: string;
  name: string;
};
