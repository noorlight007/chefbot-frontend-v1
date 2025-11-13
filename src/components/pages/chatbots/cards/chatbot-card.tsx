"use client";
import { FC, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChatbotData } from "@/app/(main)/chatbots/page";
import Link from "next/link";
import { useTranslations } from "next-intl";

const ChatbotCard: FC<{ chatbot: ChatbotData }> = ({ chatbot }) => {
  const [isCopied, setIsCopied] = useState(false);
  const t = useTranslations("chatbots.card");

  const handleCopyClick = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(chatbot.webhook_url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
      }
    } catch (err) {
      console.error(t("copyFailed"), err);
    }
  };

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-lg shadow-sm">
            <Image
              src={"/chatbot-demo.png"}
              alt={chatbot.chatbot_name}
              width={80}
              height={80}
              className="h-full w-full transform object-cover transition-transform duration-200 hover:scale-105"
              priority={true}
              loading="eager"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{chatbot.chatbot_name}</h3>
            <p className="text-sm text-muted-foreground">
              {chatbot.organization}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("salesLevel")}: {chatbot.sales_level.level}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={chatbot.webhook_url}
                readOnly
                className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-1 text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 hover:bg-gray-100"
                onClick={handleCopyClick}
                title={t("copyWebhook")}
              >
                {isCopied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="green"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-3 border-t bg-gradient-to-r from-gray-50 to-gray-100 p-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full rounded-md border-gray-200 font-medium shadow-sm transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
        >
          <Link href={`/chatbots/${chatbot.uid}/contacts`}>{t("contacts")}</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full rounded-md border-gray-200 font-medium shadow-sm transition-all duration-200 hover:bg-primary hover:text-white"
        >
          <Link href={`/chatbots/${chatbot.uid}/message-history`}>
            {t("chatHistory")}
          </Link>
        </Button>
        <Button
          variant="default"
          size="sm"
          asChild
          className="w-full rounded-md bg-primary font-medium text-white shadow-sm"
        >
          <Link href={`/chatbots/${chatbot.uid}`}>{t("configure")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChatbotCard;
