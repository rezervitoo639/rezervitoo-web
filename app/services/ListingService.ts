export type ListingType = 'PROPERTY' | 'HOTEL_ROOM' | 'HOSTEL_BED' | 'TRAVEL_PACKAGE';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: string;
  location_text: string;
  cover_image: string;
  listing_type: ListingType;
  owner_name: string;
  quantity: number;
  is_active: boolean;
  approval_status: string;
}

export interface ListingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Listing[];
}

const BASE_URL = typeof window !== 'undefined' 
  ? '/api/v1/listings/' 
  : 'https://api.rezervitoo.com/api/v1/listings/';

export class ListingService {
  static async getListings(params: Record<string, string> = {}): Promise<ListingsResponse> {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${queryParams ? `?${queryParams}` : ''}`;

    try {
      console.log('Fetching listings from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching listings: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ListingService.getListings failed:', error);
      // Return empty results on error to prevent UI crash
      return { count: 0, next: null, previous: null, results: [] };
    }
  }

  static async getListingById(id: number): Promise<Listing | null> {
    try {
      const response = await fetch(`${BASE_URL}${id}/`);
      if (!response.ok) {
        throw new Error(`Error fetching listing details: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`ListingService.getListingById(${id}) failed:`, error);
      return null;
    }
  }
}
