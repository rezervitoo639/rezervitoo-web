import type { AppNotification } from "@/lib/api/notificationService";

const num = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Deep-link target for a notification, aligned with RezerVitoo notification payloads
 * (REST `type` + `payload`, and WebSocket `data` field shapes).
 */
export function getNotificationLink(notification: AppNotification): string | null {
  const rawType = (notification.notification_type || "").toLowerCase();
  const payload =
    notification.data && typeof notification.data === "object" ? (notification.data as Record<string, unknown>) : {};

  const bookingId = num(payload.booking_id);
  const listingId = num(payload.listing_id);
  const reviewId = num(payload.review_id);
  const hasGuestEmail = typeof payload.guest_email === "string" && payload.guest_email.length > 0;
  const hasStatus = typeof payload.status === "string" && payload.status.length > 0;

  const bookingQuery = bookingId != null ? `?bookingId=${bookingId}` : "";

  // --- Explicit REST types (support API) ---
  switch (rawType) {
    case "booking_created":
    case "booking_update":
      return `/my-bookings${bookingQuery}`;
    case "new_booking":
      return `/dashboard/bookings${bookingQuery}`;
    case "new_review":
      return listingId != null ? `/listing/${listingId}` : `/dashboard/bookings`;
    case "account_approved":
      return `/dashboard/profile`;
    case "new_user":
    case "new_listing":
    case "new_report":
      return null;
    default:
      break;
  }

  // --- Infer from payload (WebSocket / legacy) ---
  if (reviewId != null && listingId != null) {
    return `/listing/${listingId}`;
  }
  // Provider: new booking (guest_email present per docs)
  if (bookingId != null && hasGuestEmail) {
    return `/dashboard/bookings${bookingQuery}`;
  }
  // Customer: booking status changed (booking_id + status, no guest_email)
  if (bookingId != null && hasStatus && !hasGuestEmail) {
    return `/my-bookings${bookingQuery}`;
  }
  if (bookingId != null) {
    return `/my-bookings${bookingQuery}`;
  }

  return null;
}
