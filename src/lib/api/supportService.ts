/**
 * RizerVitoo Support Service
 * Communicates with backend API for Wishlist, Reviews, and Reports
 */
 
import { authService } from "./authService";
import { Listing } from "./listingService";
import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/api/v1/support`;

export interface WishlistItem {
  id: number;
  user: number;
  listing: number;
  listing_details: Listing;
  created_at: string;
}

export interface Review {
  id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_picture: string | null;
  review_type: "USER_TO_LISTING" | "PROVIDER_TO_USER";
  listing_title?: string;
  rating: number;
  comment: string;
  image: string | null;
  created_at: string;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const supportService = {
  /** --- Wishlist --- */
  
  async fetchWishlist(): Promise<PaginatedResult<WishlistItem>> {
    const response = await fetch(`${BASE_URL}/wishlist/`, {
      headers: {
        "Authorization": `Bearer ${authService.getAccessToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch wishlist");
    }

    return response.json();
  },

  async toggleWishlist(listingId: number | string): Promise<{ wishlisted: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/wishlist/toggle/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getAccessToken()}`
      },
      body: JSON.stringify({ listing: listingId })
    });

    if (!response.ok) {
      throw new Error("Failed to toggle wishlist");
    }

    return response.json();
  },

  /** --- Reviews --- */

  async fetchReviews(params?: Record<string, string | number>): Promise<PaginatedResult<Review>> {
    const query = params 
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";
    
    const response = await fetch(`${BASE_URL}/reviews/${query}`);

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },

  async createReview(reviewData: FormData): Promise<Review> {
    const response = await fetch(`${BASE_URL}/reviews/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authService.getAccessToken()}`
      },
      body: reviewData // FormData handles multipart/form-data
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },

  /** --- Reports --- */
  
  async createReport(reportData: { reported: number; reason: string }): Promise<any> {
    const response = await fetch(`${BASE_URL}/reports/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getAccessToken()}`
      },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      const error = await response.json();
      const firstError = Object.values(error)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : "Failed to submit report");
    }

    return response.json();
  },

  /** --- Support Contact --- */

  async fetchSupportContact(): Promise<SupportContact> {
    const response = await fetch(`${API_BASE_URL}/api/v1/support-contact/`);

    if (!response.ok) {
      throw new Error("Failed to fetch support contact");
    }

    return response.json();
  }
};

export interface SupportContact {
  id: number;
  whatsapp_phone: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  linkedin: string | null;
  updated_at: string;
}
