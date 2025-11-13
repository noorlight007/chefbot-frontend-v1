"use client";

import { useRef, useEffect, useContext, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetClientsMessagesQuery } from "@/redux/reducers/whatsapp-reducer";
import { ChatContext } from "./chat-context"; // Add this import
import { useTranslations } from "next-intl";

interface IMessage {
  uid: string;
  client: string;
  role: "USER" | "ASSISTANT";
  message: string;
  sent_at: string;
  media_url?: string;
}

export default function ChatPage() {
  const t = useTranslations("chatbots.chatHistory.chatPage");
  const { selectedClientId, isMobile, setShowSidebar, selectedClientWhatsApp } =
    useContext(ChatContext);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetClientsMessagesQuery(selectedClientId);
  const [allMessages, setAllMessages] = useState<IMessage[]>([]);

  // Use a ref to store the latest messages for WebSocket callbacks
  const messagesRef = useRef<IMessage[]>([]);

  // Update both state and ref when data changes
  useEffect(() => {
    if (data) {
      setAllMessages(data);
      messagesRef.current = data;
    }
  }, [data]);

  // Memoized callback for handling new messages
  const handleNewMessage = useCallback((newMessage: IMessage) => {
    setAllMessages((prevMessages) => {
      const messageExists = prevMessages.some(
        (msg) => msg.uid === newMessage.uid,
      );
      if (!messageExists) {
        const updatedMessages = [...prevMessages, newMessage];
        messagesRef.current = updatedMessages; // Keep ref in sync
        return updatedMessages;
      }
      return prevMessages;
    });
  }, []);

  // Memoized callback for handling updated messages
  const handleUpdatedMessage = useCallback((updatedMessage: IMessage) => {
    setAllMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((message) =>
        message.uid === updatedMessage.uid ? updatedMessage : message,
      );
      messagesRef.current = updatedMessages; // Keep ref in sync
      return updatedMessages;
    });
  }, []);

  useEffect(() => {
    if (!selectedClientId) return;

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKETURL}/ws/realtime/${selectedClientId}/`,
    );


    socket.onmessage = (e) => {
      try {
        const response = JSON.parse(e.data);
        // Handle the nested structure: response.data contains the actual message info
        const messageData = response.data;

        if (
          messageData &&
          messageData.action === "created" &&
          messageData.data
        ) {
          handleNewMessage(messageData.data);
        } else if (
          messageData &&
          messageData.action === "updated" &&
          messageData.data
        ) {
          handleUpdatedMessage(messageData.data);
        }
      } catch {
        // console.error("Error parsing WebSocket message:", error, e.data);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [selectedClientId, handleNewMessage, handleUpdatedMessage]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    // Method 1: Use the messages end ref
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Method 2: Try to find the ScrollArea viewport
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        return;
      }
    }

    // Method 3: Fallback to the scroll container itself
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM has updated

    return () => clearTimeout(timer);
  }, [allMessages, scrollToBottom]);

  const handleBackClick = () => {
    setShowSidebar(true);
  };

  // Render file previews
  const renderMediaPreview = (mediaUrl: string) => {
    if (mediaUrl.toLowerCase().endsWith(".pdf")) {
      return (
        <div className="mb-2 rounded border bg-white p-2">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 underline"
          >
            {(() => {
              const filename = mediaUrl.split("/").pop() || "";
              if (filename.length <= 15) return filename;
              return `${filename.slice(0, 6)}...${filename.slice(-8)}`;
            })()}
          </a>
        </div>
      );
    }

    // Default fallback for non-PDF media
    return (
      <div className="mb-2">
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-blue-500 underline"
        >
          {t("viewFile")}
        </a>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center border-b p-4">
        {isMobile && selectedClientId && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">
          {selectedClientWhatsApp
            ? `${t("selectConversation")} ${selectedClientWhatsApp} ${t("messageCount", { count: allMessages.length })}`
            : t("selectConversation")}
        </h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p>{t("loadingMessages")}</p>
          </div>
        ) : selectedClientId ? (
          <div className="space-y-4">
            {allMessages?.map((message: IMessage) => (
              <Card
                key={message.uid}
                className={`p-4 ${
                  message.role === "USER"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted"
                } max-w-[80%]`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={
                        message.role === "USER"
                          ? "text-primary"
                          : "bg-primary text-white"
                      }
                    >
                      {message.role === "USER" ? "U" : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {message.media_url && renderMediaPreview(message.media_url)}
                    <p>{message.message}</p>
                    <small className="text-xs opacity-70">
                      {t("sentAt", {
                        time: new Date(message.sent_at).toLocaleString(),
                      })}
                    </small>
                  </div>
                </div>
              </Card>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              {t("selectConversation")}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
