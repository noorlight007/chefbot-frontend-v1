import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDeDate = (dateStr: string, locale?: string): string => {
  const date = new Date(dateStr);
  // Format as: "20, December 2025" or "20, Dezember 2025" depending on locale
  const day = date.getDate();

  // map short locale (e.g. 'de') to full locale tag if necessary
  let monthLocale = "en-US";
  if (locale) {
    if (locale === "de" || locale.startsWith("de-")) monthLocale = "de-DE";
    else monthLocale = locale;
  }

  const month = date.toLocaleString(monthLocale, { month: "long" });
  const year = date.getFullYear();
  return `${day}, ${month} ${year}`;
};
