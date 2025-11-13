"use client";

import { createContext, useContext, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type Locale = "en" | "de";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

interface LocaleProviderProps {
  children: React.ReactNode;
}

export default function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

  useEffect(() => {
    // Initialize locale from cookie or localStorage
    const cookieLocale = Cookies.get("locale") as Locale;
    const storageLocale = localStorage.getItem("local") as Locale;

    const initialLocale = cookieLocale || storageLocale || "en";
    const validLocale = ["en", "de"].includes(initialLocale)
      ? (initialLocale as Locale)
      : "en";

    setLocaleState(validLocale);

    // Ensure cookie is set
    if (!cookieLocale || cookieLocale !== validLocale) {
      Cookies.set("locale", validLocale, { expires: 365 });
    }

    setIsLoading(false);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setIsLoading(true);

    // Update state
    setLocaleState(newLocale);

    // Update cookie
    Cookies.set("locale", newLocale, { expires: 365 });

    // Update localStorage for backward compatibility
    localStorage.setItem("local", newLocale);

    // Refresh the page to apply new locale
    window.location.reload();
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}
