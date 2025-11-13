"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import MessageHistorySkeleton from "@/components/pages/reservations/skeletons/message-history-skeleton";
import { useGetClientsMessagesQuery } from "@/redux/reducers/whatsapp-reducer";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Message {
  uid: string;
  client: string;
  message: string;
  role: "ASSISTANT" | "USER";
  sent_at: string;
}

export default function MessageHistory() {
  const { uid } = useParams();
  const router = useRouter();
  const { data, isLoading } = useGetClientsMessagesQuery(uid);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("customers.chatbots.chatHistory");
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && data?.length) {
      // Scroll to the bottom element
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, data]);

  if (isLoading) {
    return <MessageHistorySkeleton />;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="border-t-4 border-primary p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-full bg-primary/40 p-2 text-white transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-2xl font-bold text-transparent">
              {t("title")}
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {t("messageCount", { count: data.length })}
          </span>
        </div>

        <ScrollArea className="h-[70vh] rounded-lg pr-4" ref={scrollRef}>
          <div className="space-y-6">
            {data.map((message: Message) => (
              <div
                key={message.uid}
                className={`animate-fade-in flex ${
                  message.role === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`group flex max-w-[80%] items-start gap-4 ${
                    message.role === "USER" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20 transition-transform group-hover:scale-110">
                    <AvatarFallback className="bg-primary/5">
                      {message.role === "USER" ? "U" : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                      message.role === "USER"
                        ? "rounded-tr-none bg-primary text-primary-foreground"
                        : "rounded-tl-none bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <span className="mt-2 block text-xs font-medium opacity-80">
                      {t("sentAt", { time: locale === "de" 
                        ? new Date(message.sent_at).toLocaleString("de-DE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          }).replace(" um ", " am ")
                        : new Date(message.sent_at).toLocaleString()
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
