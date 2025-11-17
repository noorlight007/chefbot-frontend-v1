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

// Format stored ISO timestamp to localized date (using formatDeDate) + HH:mm
// Example: "2025-11-20T12:45:00+06:00" -> "20, November 2025 12:45" (or German month)
export const formatStoredDateTimeLocalized = (
  iso?: string | null,
  localeArg?: string,
) => {
  if (!iso) return "";
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (m) {
    const datePart = m[1];
    const timePart = m[2];
    return `${formatDeDate(datePart, localeArg)} ${timePart}`;
  }
  // Fallback: strip timezone then attempt to extract
  const fallback = iso.replace(/Z|([+-]\d{2}:?\d{2})$/, "");
  const parts = fallback.split("T");
  if (parts.length >= 2) {
    const datePart = parts[0];
    const timeParts = parts[1].split(":");
    const time = timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : "";
    return `${formatDeDate(datePart, localeArg)}${time ? ` ${time}` : ""}`;
  }
  return iso;
};


export const safe = (v: unknown): string => {
  if (v === undefined || v === null || v === "") return "-";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};


export const formatChoiceFieldValue = (v: unknown): string => {
  if (typeof v !== "string") return safe(v);
  return v
    .split("_")
    .map((part) =>
      part
        .split("")
        .map((char: string, idx: number) =>
          idx === 0 ? char.toUpperCase() : char.toLowerCase(),
        )
        .join(""),
    )
    .join(" ");
};
