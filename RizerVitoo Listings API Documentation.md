# RizerVitoo Listings API Documentation

**Base URL:** `http://api.rezervitoo.com/api/v1/listings/`

**Version:** 1.0  
**Last Updated:** March 11, 2026

---

## 1. Overview

The Listings API manages all accommodation and travel package listings. RizerVitoo supports **4 listing types**, each with specific fields and validation rules. 

### 🔐 Multi-Tier Access
- **🌍 Public Access (No Account Required):** Browse and view active, approved listings from verified providers.
- **💼 Provider Access:** Create and manage own listings (requires JWT authentication).
- **🛡️ Admin Access:** Full visibility and management of all listings.

**Authentication Header (for non-public access):**
```
Authorization: Bearer <access_token>
```

### ✅ Listing Approval System
Listing visibility is tied to the **Provider's Verification Status**.
- **Verified Provider:** Listings are automatically approved and public.
- **Unverified Provider:** Listings remain in `PENDING` status and are hidden from the public.
- **Manual Control:** Admins must verify the provider first to enable listing approval.

---

## 2. Listing Types & Models

### Core Types
| Type | Role Required | Description |
| :--- | :--- | :--- |
| **PROPERTY** | HOST | Houses, apartments, villas, cabins, studios. |
| **HOTEL_ROOM** | HOTEL | Managed hotel room categories. |
| **HOSTEL_BED** | HOSTEL | Shared or private hostel beds. |
| **TRAVEL_PACKAGE** | AGENCY | Multi-day travel experiences with itineraries. |

### Supported Models
- **Amenities:** Wi-Fi, Pool, Parking, etc.
- **Restrictions:** No Smoking, No Pets, etc.
- **Nearby POIs:** Beach, Metro, Mall, etc.
- **Bed Types:** Single, Double, Queen, King, Bunk.
- **Scheduling:** Blocked dates and package departure dates.

---

## 3. Key Endpoints

### 🔍 List Listings (Publicly Accessible)
Returns a paginated list of listings.

**Endpoint:** `GET /`

**Query Parameters:**
- `listing_type`: `PROPERTY`, `HOTEL_ROOM`, `HOSTEL_BED`, `TRAVEL_PACKAGE`
- `search`: Filter by title, description, or location.
- `min_price` / `max_price`: Price range filtering.
- `ordering`: `price`, `-price`, `created_at`, `-created_at`.

### 📄 Get Listing Details (Publicly Accessible)
Retrieve full details for a specific listing, including images, amenities, and availability.

**Endpoint:** `GET /{id}/`

---

## 4. Provider Management (Auth Required)

### 🏗️ Create Listings
All creation endpoints use `POST /` with `multipart/form-data`.
- **Property:** Specify bedrooms, bathrooms, and property type.
- **Hotel Room:** Specify room category and hotel stars.
- **Hostel Bed:** Specify gender and room type (DORM/PRIVATE).
- **Travel Package:** Requires a detailed day-by-day itinerary.

### 📝 Update & Delete
- **Update:** `PATCH /{id}/` (Partial updates supported)
- **Delete:** `DELETE /{id}/`

---

## 5. Advanced Features

### 📅 Availability Management
Providers can block specific dates via nested endpoints:
- `GET /listings/{id}/availability/` - List blocked dates.
- `POST /listings/{id}/availability/` - Block new dates.

### 🎒 Package Itineraries
Travel packages have structured day-by-day plans:
- `GET /listings/{id}/itinerary/` - View full itinerary.
- `POST /listings/{id}/itinerary/` - Add itinerary items.

---

## 6. Common Errors

| Code | Meaning | Solution |
| :--- | :--- | :--- |
| 400 | Bad Request | Check field validations (e.g., missing title, < 5 images). |
| 401 | Unauthorized | Missing or invalid Bearer token. |
| 403 | Forbidden | Attempting to edit a listing you don't own. |
| 404 | Not Found | The listing ID does not exist. |
| 429 | Too Many Requests | Rate limit exceeded. |
