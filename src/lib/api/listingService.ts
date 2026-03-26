/**
 * RizerVitoo Listings Service
 * Communicates with backend API
 */

import { authService } from "./authService";
import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/api/v1/listings`;

export const getTranslatedName = (resource: any, currentLang: string): string => {
  if (!resource) return "";
  const translated = resource[`name_${currentLang}`];
  return translated || resource.name || "";
};

export type ListingType = "PROPERTY" | "HOTEL_ROOM" | "HOSTEL_BED" | "TRAVEL_PACKAGE";

export interface Amenity {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_fr?: string;
  icon: string | null;
}

export interface Restriction {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_fr?: string;
  icon: string | null;
}

export interface Nearby {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_fr?: string;
  icon: string | null;
}

export interface Bed {
  id: number;
  bed_type_details: {
    id: number;
    name: string;
    name_ar?: string;
    name_en?: string;
    name_fr?: string;
    icon: string;
  };
  quantity: number;
}

export interface ItineraryItem {
  id: number;
  day: number;
  title: string;
  description: string;
}

export interface PackageSchedule {
  id: number;
  start_date: string;
  end_date: string;
  max_capacity: number;
  spots_booked: number;
  spots_available: number;
  is_fully_booked: boolean;
}

export interface BaseListing {
  id: number;
  owner: number;
  owner_name: string;
  title: string;
  description: string;
  price: string; // Backend returns decimal as string
  cover_image: string;
  location_text?: string;
  state?: string;
  province?: string;
  location_lat?: number;
  location_lng?: number;
  is_active: boolean;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  listing_type: ListingType;
  created_at: string;
  updated_at: string;
  images: { id: number; image: string }[];
  amenity_details?: Amenity[];
  restriction_details?: Restriction[];
  nearby_details?: Nearby[];
  negotiable?: boolean;
  is_wishlisted?: boolean;
}

export interface PropertyListing extends BaseListing {
  listing_type: "PROPERTY";
  property_type: "HOUSE" | "APARTMENT" | "VILLA" | "CABIN" | "STUDIO";
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  min_duration: number;
  beds: Bed[];
}

export interface HotelListing extends BaseListing {
  listing_type: "HOTEL_ROOM";
  room_category: "SINGLE" | "DOUBLE" | "SUITE" | "DELUXE" | "FAMILY";
  hotel_stars: number;
  max_guests: number;
  min_duration: number;
  quantity: number;
  beds: Bed[];
}

export interface HostelListing extends BaseListing {
  listing_type: "HOSTEL_BED";
  room_type: "DORM" | "PRIVATE";
  gender: "MALE" | "FEMALE" | "MIXED";
  max_guests: number;
  quantity: number;
  beds: Bed[];
}

export interface PackageListing extends BaseListing {
  listing_type: "TRAVEL_PACKAGE";
  package_type: "LOCAL" | "HAJJ" | "UMRAH" | "INTERNATIONAL";
  duration_days: number;
  itinerary_items: ItineraryItem[];
  schedules: PackageSchedule[];
  beds?: Bed[];
}

export type Listing = PropertyListing | HotelListing | HostelListing | PackageListing;

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const listingService = {
  /** Fetch listings with filters */
  async fetchListings(params?: Record<string, string | number | boolean>): Promise<PaginatedResult<Listing>> {
    const query = params 
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";
    
    const response = await fetch(`${BASE_URL}${query}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch listings");
    }
    
    return response.json();
  },

  /** Fetch a single listing by ID */
  async fetchListingById(id: string | number): Promise<Listing> {
    const response = await fetch(`${BASE_URL}/${id}/`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch listing details");
    }
    
    return response.json();
  },

  /** Create a new listing with progress tracking */
  async createListing(formData: FormData, onProgress?: (progress: number) => void): Promise<Listing> {
    const token = authService.getAccessToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve({} as Listing);
          }
        } else {
          let errorData;
          try {
            errorData = JSON.parse(xhr.responseText);
          } catch (e) {
            errorData = { detail: xhr.statusText };
          }
          const error: any = new Error(errorData.detail || "Failed to create listing");
          error.status = xhr.status;
          error.data = errorData;
          reject(error);
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },

  /** Update an existing listing with progress tracking */
  async updateListing(id: string | number, formData: FormData, onProgress?: (progress: number) => void): Promise<Listing> {
    const token = authService.getAccessToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PATCH", `${BASE_URL}/${id}/`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve({} as Listing);
          }
        } else {
          let errorData;
          try {
            errorData = JSON.parse(xhr.responseText);
          } catch (e) {
            errorData = { detail: xhr.statusText };
          }
          const error: any = new Error(errorData.detail || "Failed to update listing");
          error.status = xhr.status;
          error.data = errorData;
          reject(error);
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },

  /** Create a schedule for a travel package */
  async createPackageSchedule(listingId: number | string, scheduleData: { start_date: string, max_capacity: number }): Promise<PackageSchedule> {
    const token = authService.getAccessToken();
    const response = await fetch(`${BASE_URL}/${listingId}/schedules/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(scheduleData)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create package schedule");
    }
    return response.json();
  },

  /** Update an existing schedule for a travel package */
  async updatePackageSchedule(listingId: number | string, scheduleId: number | string, scheduleData: any): Promise<PackageSchedule> {
    const token = authService.getAccessToken();
    const response = await fetch(`${BASE_URL}/${listingId}/schedules/${scheduleId}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(scheduleData)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to update package schedule");
    }
    return response.json();
  },

  /** Delete a schedule for a travel package */
  async deletePackageSchedule(listingId: number | string, scheduleId: number | string): Promise<void> {
    const token = authService.getAccessToken();
    const response = await fetch(`${BASE_URL}/${listingId}/schedules/${scheduleId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete package schedule");
    }
  },

  /** Metadata fetching */
  async fetchAmenities(): Promise<Amenity[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/resources/amenities/`);
    return response.ok ? response.json() : [];
  },

  async fetchRestrictions(): Promise<Restriction[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/resources/restrictions/`);
    return response.ok ? response.json() : [];
  },

  async fetchNearby(): Promise<Nearby[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/resources/nearby/`);
    return response.ok ? response.json() : [];
  },

  async fetchBedTypes(): Promise<{ id: number; name: string; icon: string }[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/resources/bed-types/`);
    return response.ok ? response.json() : [];
  }
};
