import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to Taiwan timezone (UTC+8) with AM/PM
 * @param dateInput Date object or timestamp string/number
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string in Taiwan timezone with AM/PM in English
 */
export function formatTaiwanDate(
  dateInput: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);

  // Default options for date and time format
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Use 12-hour format with AM/PM
    timeZone: "Asia/Taipei", // Taiwan timezone (UTC+8)
  };

  // Merge default options with provided options
  const finalOptions = { ...defaultOptions, ...options };

  // Format the date using English locale but Taiwan timezone
  return new Intl.DateTimeFormat("en-US", finalOptions).format(date);
}
