/**
 * RizerVitoo Bookings Service
 * Communicates with backend API
 */
 
import { authService } from "./authService";
import { Listing } from "./listingService";
import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/api/v1/bookings`;

export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface GuestDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  pfp: string | null;
}

export interface Booking {
  id: number;
  user: number;
  listing: number;
  listing_title: string;
  listing_type_at_booking: string;
  start_date: string;
  end_date: string;
  schedule: number | null;
  guests_count: number;
  total_price: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  listing_details: Listing;
  guest_details?: GuestDetails;
  // Legacy enriched fields (kept for compatibility)
  user_name?: string;
  user_phone?: string;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UnavailableDateRange {
  id: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

const normalizeListResponse = <T>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  return [];
};

export const bookingService = {
  /** List bookings (auth handled by interceptor or headers) */
  async fetchBookings(params?: Record<string, string | number | boolean>): Promise<PaginatedResult<Booking>> {
    const query = params 
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";
    
    const response = await fetch(`${BASE_URL}/${query}`, {
      headers: {
        "Authorization": `Bearer ${authService.getAccessToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch bookings");
    }
    
    return response.json();
  },

  /** Create a new booking */
  async createBooking(bookingData: {
    listing: number;
    start_date?: string;
    end_date?: string;
    schedule?: number;
    guests_count: number;
  }): Promise<Booking> {
    const response = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getAccessToken()}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      let errorMessage = "Failed to create booking";
      try {
        const error = await response.json();
        const firstError = Object.values(error)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] as string : (typeof firstError === 'string' ? firstError : "Failed to create booking");
      } catch (e) {
        // Fallback if response is not JSON
        errorMessage = `Server Error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /** Accept a booking (Provider only) */
  async acceptBooking(id: number): Promise<{ status: string }> {
    const response = await fetch(`${BASE_URL}/${id}/accept/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authService.getAccessToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to accept booking");
    }

    return response.json();
  },

  /** Reject a booking (Provider only) */
  async rejectBooking(id: number): Promise<{ status: string }> {
    const response = await fetch(`${BASE_URL}/${id}/reject/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authService.getAccessToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to reject booking");
    }

    return response.json();
  },

  /** Cancel own booking (User) */
  async cancelBooking(id: number): Promise<{ status: string }> {
    const token = authService.getAccessToken();
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
    };

    // Backend contract from API team:
    // DELETE /api/v1/bookings/{id}/ with owner authorization.
    let response = await fetch(`${BASE_URL}/${id}/`, {
      method: "DELETE",
      headers,
    });

    // Compatibility fallback for older environments
    if (response.status === 404 || response.status === 405) {
      response = await fetch(`${BASE_URL}/${id}/cancel/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to cancel booking");
    }

    if (response.status === 204) return { status: "cancelled" };
    const data = await response.json().catch(() => ({}));
    return data?.status ? data : { status: "cancelled" };
  },

  /** Fetch blocked/unavailable ranges for a listing */
  async fetchListingUnavailableDates(listingId: number | string): Promise<UnavailableDateRange[]> {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${listingId}/availability/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch listing availability");
    }

    const data = await response.json();
    return normalizeListResponse<UnavailableDateRange>(data);
  },
};
