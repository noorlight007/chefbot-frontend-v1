"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BotMessageSquare, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatbotCard from "@/components/pages/chatbots/cards/chatbot-card";
import { AddChatbot } from "@/components/pages/chatbots/modals/add-chatbot";
import { useGetWhatsappBotsQuery } from "@/redux/reducers/whatsapp-reducer";
import RestaurantCardSkeleton from "@/components/pages/restaurants/skeletons/retaurant-card-skeleton";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const ChatbotPage: FC = () => {
  const router = useRouter();
  const t = useTranslations("chatbots");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: chatbots, isLoading } = useGetWhatsappBotsQuery({});

  // Function to close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 lg:p-6">
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
            <Button className="bg-primary flex items-center justify-center gap-0 sm:gap-2 text-white hover:bg-primary/90">
              <Plus className="sm:mr-2 h-4 w-4" />{" "}
              <span className="hidden sm:block">{t("addNew")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[90dvh] max-w-screen-md">
            <DialogTitle className="sr-only">{t("addNew")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("addNewDescription")}
            </DialogDescription>
            <ScrollArea className="h-full w-full p-2">
              <AddChatbot onClose={handleCloseDialog} />
              {/* Pass the close callback */}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {isLoading ? (
            <>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </>
          ) : chatbots?.results.length === 0 ? (
            <div className="col-span-2 mt-16 flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <BotMessageSquare className="h-12 w-12" />
              <p className="text-lg">{t("noChatbots")}</p>
            </div>
          ) : (
            chatbots?.results.map((chatbot: ChatbotData) => (
              <ChatbotCard key={chatbot.uid} chatbot={chatbot} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
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

export default ChatbotPage;
