"use client";

import MessageHistorySkeleton from "@/components/pages/chatbots/skeletons/message-history-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDeDate } from "@/lib/utils";
import { useGetWhatsappBotClientsQuery } from "@/redux/reducers/whatsapp-reducer";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChatContext } from "./chat-context"; // Import from the separate file

// Define client type based on your structure
interface Client {
  uid: string;
  whatsapp_number: string;
  last_message: string | null;
  last_message_sent_at: string | null;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const t = useTranslations("chatbots.chatHistory");
  const locale = useLocale();
  const { uid } = useParams();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientWhatsApp, setSelectedClientIWhatsApp] = useState<
    string | null
  >(null);
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(true);
  const { data, isLoading } = useGetWhatsappBotClientsQuery({ uid });

  // Effect to handle sidebar visibility based on selection and device
  useEffect(() => {
    if (isMobile && selectedClientId) {
      setShowSidebar(false);
    } else if (!isMobile) {
      setShowSidebar(true);
    }
  }, [selectedClientId, isMobile]);

  if (isLoading) {
    return <MessageHistorySkeleton />;
  }
  // Demo client data
  const clients: Client[] = data?.results || [];

  // Handle client selection
  const handleClientSelect = (clientId: string, clientWhatsApp: string) => {
    setSelectedClientId(clientId);
    setSelectedClientIWhatsApp(clientWhatsApp);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedClientId,
        setSelectedClientId,
        selectedClientWhatsApp,
        isMobile,
        showSidebar,
        setShowSidebar,
      }}
    >
      <div className="flex h-[80dvh] rounded-md border-4 border-sidebar-accent">
        {/* Sidebar with client list - conditionally shown based on showSidebar state */}
        {showSidebar && (
          <div
            className={`${isMobile ? "w-full" : "w-80"} border-r border-sidebar-accent bg-sidebar p-4`}
          >
            <div className="mb-4 flex items-center gap-4">
              <Button
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8 rounded-full bg-sidebar-accent/50 text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-sidebar-accent">
                {t("title")}
              </h2>
            </div>
            <ScrollArea className="h-[calc(80dvh-4rem)]">
              <div className="space-y-2 pr-3">
                {clients?.map((client) => (
                  <Card
                    key={client.uid}
                    className={`cursor-pointer border-0 p-3 transition-colors hover:bg-sidebar-accent/10 hover:text-white ${selectedClientId === client.uid ? "bg-sidebar-accent/20 text-white" : ""}`}
                    onClick={() =>
                      handleClientSelect(client.uid, client.whatsapp_number)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{client.whatsapp_number}</h3>
                      <span className="text-xs text-muted-foreground">
                        {(() => {
                          if (!client.last_message_sent_at) return "";
                          const messageDate = new Date(
                            client.last_message_sent_at,
                          );
                          if (
                            typeof locale === "string" &&
                            locale.startsWith("de")
                          )
                            return formatDeDate(
                              client.last_message_sent_at,
                              locale,
                            );
                          const now = new Date();
                          const diffInMinutes = Math.floor(
                            (now.getTime() - messageDate.getTime()) /
                              (1000 * 60),
                          );

                          if (diffInMinutes < 1) return t("justNow");
                          if (diffInMinutes === 1) return t("minuteAgo");
                          if (diffInMinutes < 60)
                            return t("minutesAgo", { count: diffInMinutes });

                          const diffInHours = Math.floor(diffInMinutes / 60);
                          if (diffInHours === 1) return t("hourAgo");
                          if (diffInHours < 24)
                            return t("hoursAgo", { count: diffInHours });

                          const diffInDays = Math.floor(diffInHours / 24);
                          if (diffInDays === 1) return t("yesterday");
                          if (diffInDays < 7)
                            return t("daysAgo", { count: diffInDays });

                          return messageDate.toLocaleDateString();
                        })()}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {client.last_message && client.last_message.length > 20
                        ? t("messagePreview", {
                            preview: client.last_message.substring(0, 20),
                          })
                        : client.last_message || t("noMessages")}
                    </p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main chat area - conditionally shown based on selection and device */}
        {(!isMobile || (isMobile && !showSidebar)) && (
          <div className="flex flex-1 flex-col">{children}</div>
        )}
      </div>
    </ChatContext.Provider>
  );
};

export default Layout;
