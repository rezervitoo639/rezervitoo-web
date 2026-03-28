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
  }
};
