import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatApiError(error: any, t: (key: string) => string): string {
  if (!error) return "An unknown error occurred";
  
  if (typeof error === "string") return error;
  
  if (error.message && typeof error.message === "string") return error.message;
  if (error.detail && typeof error.detail === "string") return error.detail;
  if (error.error && typeof error.error === "string") return error.error;

  if (typeof error === "object" && !Array.isArray(error)) {
    const errorEntries = Object.entries(error);
    if (errorEntries.length > 0) {
      const errorMessages = errorEntries.map(([field, msgs]) => {
        // Only format fields that look like validation errors (field name: [messages])
        if (Array.isArray(msgs) || typeof msgs === "string") {
          const fieldLabel = t(`fields.${field}`) !== `fields.${field}` ? t(`fields.${field}`) : field;
          const msg = Array.isArray(msgs) ? msgs[0] : msgs;
          return `${fieldLabel}: ${msg}`;
        }
        return null;
      }).filter(Boolean);

      if (errorMessages.length > 0) {
        return errorMessages.join(" | ");
      }
    }
  }

  return "An unknown error occurred";
}
