import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatApiError(error: any, t: (key: string) => string): string {
  if (!error) return "An unknown error occurred";
  
  if (typeof error === "string") return error;
  
  // Preferred structured API error format from services: { status, data, message }
  const status: number | undefined = typeof error.status === "number" ? error.status : undefined;
  const data = error.data ?? undefined;
  const rawMessage: string | undefined =
    (typeof error.message === "string" && error.message) ||
    (typeof error.detail === "string" && error.detail) ||
    (typeof error.error === "string" && error.error) ||
    (typeof data?.detail === "string" && data.detail) ||
    (typeof data?.error === "string" && data.error) ||
    (typeof data?.message === "string" && data.message) ||
    undefined;

  // Auth/session translations
  if (status === 401) {
    if (data?.code === "token_not_valid" || rawMessage?.toLowerCase().includes("token")) {
      return t("errors.auth.sessionExpired") || "Session expired. Please login again.";
    }
    if (rawMessage?.includes("No active account found")) {
      return t("login.invalidCredentials") || "Invalid email or password. Please try again.";
    }
  }

  // Email verification translations
  if (rawMessage?.toLowerCase().includes("verification") && rawMessage?.toLowerCase().includes("expired")) {
    return t("verifyEmail.expiredLink") || rawMessage;
  }

  if (rawMessage) return rawMessage;

  if (typeof error === "object" && !Array.isArray(error)) {
    const obj = (data && typeof data === "object" && !Array.isArray(data)) ? data : error;
    const errorEntries = Object.entries(obj);
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
