"use client";

import React from "react";

// Create context to share selected client across components
export const ChatContext = React.createContext<{
  selectedClientId: string | null;
  selectedClientWhatsApp: string | null;
  setSelectedClientId: React.Dispatch<React.SetStateAction<string | null>>;
  isMobile: boolean;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  selectedClientId: null,
  selectedClientWhatsApp: null,
  setSelectedClientId: () => {},
  isMobile: false,
  showSidebar: true,
  setShowSidebar: () => {},
});

// Optional: Create a custom hook for easier context consumption
export const useChatContext = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error(
      "useChatContext must be used within a ChatContext.Provider",
    );
  }
  return context;
};
