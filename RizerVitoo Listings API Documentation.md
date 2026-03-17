# RizerVitoo Listings API Documentation

**Base URL:** `http://localhost:8000/api/v1/listings/`

**Version:** 1.0  
**Last Updated:** January 4, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Listing Types](#listing-types)
3. [Common Models](#common-models)
4. [Endpoints](#endpoints)
   - [List Listings](#1-list-listings)
   - [Create Property Listing](#2-create-property-listing)
   - [Create Hotel Room Listing](#3-create-hotel-room-listing)
   - [Create Hostel Bed Listing](#4-create-hostel-bed-listing)
   - [Create Travel Package Listing](#5-create-travel-package-listing)
   - [Get Listing Details](#6-get-listing-details)
   - [Update Listing](#7-update-listing)
   - [Delete Listing](#8-delete-listing)
   - [Manage Itinerary Items](#9-manage-itinerary-items-packages-only)
   - [Manage Unavailable Dates](#10-manage-unavailable-dates)
5. [Business Logic](#business-logic)
6. [Common Errors](#common-errors)

---

## Overview

The Listings API manages all accommodation and travel package listings. RizerVitoo supports **4 listing types**, each with specific fields and validation rules. All listings share common attributes (title, description, images, amenities) but differ in type-specific fields.

### Authentication

- **Public Access:** List and view active, approved listings from verified providers
- **Provider Access:** Create and manage own listings (requires JWT authentication)
- **Admin Access:** View all listings, delete inappropriate content

**Authentication Header:**

```
Authorization: Bearer <access_token>
```

### Listing Approval System

**CRITICAL RULE:** Listing approval is **tied to provider verification status**.

- When a provider is **verified** → All their listings are **automatically approved** and activated
- Listings from **unverified providers** → Always remain **PENDING** (not visible to public)
- Admins **cannot manually approve** listings from unverified providers
- To approve listings → **Verify the provider first** (see Users API)

---

## Listing Types

| Type               | Role Required | Description                                                         |
| ------------------ | ------------- | ------------------------------------------------------------------- |
| **PROPERTY**       | HOST          | Private properties (houses, apartments, villas, cabins, studios)    |
| **HOTEL_ROOM**     | HOTEL         | Hotel room listings by category                                     |
| **HOSTEL_BED**     | HOSTEL        | Shared or private hostel accommodations                             |
| **TRAVEL_PACKAGE** | AGENCY        | Multi-day travel packages with itineraries and scheduled departures |

---

## Common Models

### Amenity

Static amenities available for listings (Wi-Fi, Pool, Parking, etc.)

```json
{
  "id": 1,
  "name": "Wi-Fi",
  "icon": "/media/icons/wifi.svg"
}
```

### Restriction

Static restrictions (No Smoking, No Pets, etc.)

```json
{
  "id": 3,
  "name": "No Smoking",
  "icon": "/media/icons/no-smoking.svg"
}
```

### Nearby

Points of interest near the listing (Beach, Metro, Mall, etc.)

```json
{
  "id": 5,
  "name": "Beach",
  "icon": "/media/icons/beach.svg"
}
```

### BedType

Available bed configurations (Single, Double, Queen, Bunk, etc.)

```json
{
  "id": 2,
  "name": "Queen Bed",
  "icon": "/media/icons/bed-queen.svg"
}
```

### UnavailableDate

Blocked date ranges for maintenance, personal use, or inventory control

```json
{
  "id": 12,
  "start_date": "2026-02-10",
  "end_date": "2026-02-15",
  "reason": "Maintenance",
  "created_at": "2026-01-05T10:00:00Z"
}
```

**Validation:** `start_date` must be ≤ `end_date`

### PackageSchedule

Specific departure instances for travel packages

```json
{
  "id": 8,
  "start_date": "2026-03-15",
  "end_date": "2026-03-22",
  "max_capacity": 40,
  "spots_booked": 12,
  "spots_available": 28,
  "is_fully_booked": false,
  "created_at": "2026-01-10T14:30:00Z"
}
```

**Business Logic:**

- `end_date` is **auto-calculated** from `start_date + package.duration_days`
- `spots_available` = `max_capacity - spots_booked` (computed property)
- `is_fully_booked` = `spots_booked >= max_capacity` (computed property)
- **Unique constraint:** `(package, start_date)` - one departure per date
- **Pricing:** Uses the package's `price` field (per person)

### ItineraryItem

Day-by-day itinerary for travel packages

```json
{
  "id": 15,
  "day": 1,
  "title": "Arrival",
  "description": "Airport pickup and hotel check-in. Welcome dinner at traditional restaurant."
}
```

**Validation Rules:**

- **Unique constraint:** `(package, day)` - one item per day
- Day 1 **must be titled "Arrival"**
- Last day **must be titled "Departure"**
- Days must start from 1 and be sequential

---

## Endpoints

### 1. List Listings

Get all listings (filtered by user role).

**Endpoint:** `GET /`  
**Authentication:** Optional

#### Query Parameters

| Parameter         | Type    | Description                                                        |
| ----------------- | ------- | ------------------------------------------------------------------ |
| `approval_status` | string  | Filter by `PENDING`, `APPROVED`, `REJECTED`                        |
| `is_active`       | boolean | Filter active/inactive listings                                    |
| `listing_type`    | string  | Filter by `PROPERTY`, `HOTEL_ROOM`, `HOSTEL_BED`, `TRAVEL_PACKAGE` |
| `property_type`   | string  | For properties: `HOUSE`, `APARTMENT`, `VILLA`, `CABIN`, `STUDIO`   |
| `package_type`    | string  | For packages: `LOCAL`, `HAJJ`, `UMRAH`, `INTERNATIONAL`            |
| `room_category`   | string  | For hotels: `SINGLE`, `DOUBLE`, `SUITE`, `DELUXE`, `FAMILY`        |
| `min_price`       | number  | Minimum price filter                                               |
| `max_price`       | number  | Maximum price filter                                               |
| `min_guests`      | number  | Minimum guest capacity                                             |
| `owner_name`      | string  | Search by provider name (supports partial match)                   |
| `search`          | string  | Full-text search on title, description, **location**               |
| `ordering`        | string  | Sort by `price`, `-price`, `created_at`, `-created_at`             |

**Examples:**

- Search by location: `?search=Oran` or `?search=Algiers`
- Filter properties: `?listing_type=PROPERTY&property_type=VILLA`
- Price range: `?min_price=5000&max_price=20000`
- Combine filters: `?search=beach&min_guests=4&ordering=-price`

#### Visibility Rules

- **Public/Users:** Only `is_active=true`, `approval_status=APPROVED`, owner's `verification_status=VERIFIED`
- **Providers:** Only their own listings (all statuses)
- **Admins:** All listings

#### Success Response (200 OK)

```json
{
  "count": 45,
  "next": "http://localhost:8000/api/v1/listings/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "owner": 5,
      "owner_name": "Luxury Hotels Algeria",
      "title": "Deluxe Ocean View Suite",
      "description": "Spacious suite with panoramic sea views...",
      "price": "12500.00",
      "quantity": 3,
      "cover_image": "/media/listing_covers/suite_1.jpg",
      "location_lat": 36.7538,
      "location_lng": 3.0588,
      "location_text": "Algiers, Hydra District",
      "is_active": true,
      "approval_status": "APPROVED",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-03T14:20:00Z",
      "listing_type": "HOTEL_ROOM",
      "images": [
        { "id": 1, "image": "/media/listing_images/suite_1_img1.jpg" },
        { "id": 2, "image": "/media/listing_images/suite_1_img2.jpg" }
      ],
      "amenity_details": [
        { "id": 1, "name": "Wi-Fi", "icon": "/media/icons/wifi.svg" },
        { "id": 5, "name": "Air Conditioning", "icon": "/media/icons/ac.svg" }
      ],
      "restriction_details": [
        { "id": 2, "name": "No Smoking", "icon": "/media/icons/no-smoking.svg" }
      ],
      "nearby_details": [
        { "id": 3, "name": "Beach", "icon": "/media/icons/beach.svg" }
      ],
      "beds": [
        {
          "id": 1,
          "bed_type_details": {
            "id": 2,
            "name": "King Bed",
            "icon": "/media/icons/bed-king.svg"
          },
          "quantity": 1
        }
      ],
      "unavailable_dates": [
        {
          "id": 5,
          "start_date": "2026-02-10",
          "end_date": "2026-02-12",
          "reason": "Maintenance"
        }
      ],
      "room_category": "DELUXE",
      "hotel_stars": 5,
      "max_guests": 4,
      "min_duration": 1
    }
  ]
}
```

---

### 2. Create Property Listing

Create a new property listing (HOST role required).

**Endpoint:** `POST /`  
**Authentication:** Required (HOST)  
**Content-Type:** `multipart/form-data`

#### Request Body (Multipart Form Data)

```
title: Luxury Beach Villa in Oran
description: Beautiful 4-bedroom villa with private pool and sea view...
price: 18500.00
negotiable: true
quantity: 1
max_guests: 8
min_duration: 2
property_type: VILLA
bedrooms: 4
bathrooms: 3
location_lat: 35.6969
location_lng: -0.6331
location_text: Oran, Ain El Turck
cover_image: <file>
uploaded_images: <file1>
uploaded_images: <file2>
uploaded_images: <file3>
uploaded_images: <file4>
uploaded_images: <file5>
amenities: 1
amenities: 3
amenities: 5
amenities: 7
restrictions: 2
restrictions: 4
nearby: 1
nearby: 6
nearby: 8
uploaded_beds: [{"bed_type_id": 2, "quantity": 2}, {"bed_type_id": 1, "quantity": 4}]
```

**Note:** For multipart/form-data, arrays are sent as **multiple fields with the same name** (not as JSON arrays).

#### Field Validations

| Field             | Type    | Required | Constraints                                                                                                                              |
| ----------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `title`           | string  | ✅        | Max 255 chars, cannot be empty/whitespace                                                                                                |
| `description`     | string  | ✅        | Cannot be empty/whitespace                                                                                                               |
| `price`           | decimal | ✅        | Min 0.01, max 10 digits                                                                                                                  |
| `negotiable`      | boolean | ❌        | Default: false                                                                                                                           |
| `quantity`        | integer | ❌        | Default: 1 (number of units available)                                                                                                   |
| `max_guests`      | integer | ✅        | Min 1                                                                                                                                    |
| `min_duration`    | integer | ❌        | Default: 1 (minimum nights)                                                                                                              |
| `property_type`   | string  | ✅        | Choices: `HOUSE`, `APARTMENT`, `VILLA`, `CABIN`, `STUDIO`                                                                                |
| `bedrooms`        | integer | ✅        | Min 1                                                                                                                                    |
| `bathrooms`       | integer | ✅        | Min 1                                                                                                                                    |
| `location_text`   | string  | ✅        | Max 255 chars, cannot be empty                                                                                                           |
| `location_lat`    | float   | ❌        | GPS latitude                                                                                                                             |
| `location_lng`    | float   | ❌        | GPS longitude                                                                                                                            |
| `cover_image`     | file    | ✅        | Max 10MB, formats: jpg, jpeg, png, webp                                                                                                  |
| `uploaded_images` | file[]  | ✅        | Min 5 images. Send as multiple fields with same name                                                                                     |
| `amenities`       | int[]   | ❌        | Send as multiple fields: `amenities=1&amenities=3`                                                                                       |
| `restrictions`    | int[]   | ❌        | Send as multiple fields: `restrictions=2&restrictions=4`                                                                                 |
| `nearby`          | int[]   | ❌        | Send as multiple fields: `nearby=1&nearby=6`                                                                                             |
| `uploaded_beds`   | varies  | ❌        | **Multipart:** JSON string `"[{\"bed_type_id\": 1, \"quantity\": 2}]"` <br> **JSON:** Actual array `[{"bed_type_id": 1, "quantity": 2}]` |

**Auto-set fields:**

- `owner` → Current authenticated user
- `host_profile` → User's host profile
- `approval_status` → `APPROVED` if user verified, else `PENDING`
- `is_active` → `true` if user verified, else `false`

#### Success Response (201 Created)

```json
{
  "id": 42,
  "owner": 12,
  "owner_name": "Ahmed Bennani",
  "title": "Luxury Beach Villa in Oran",
  "listing_type": "PROPERTY",
  "property_type": "VILLA",
  "bedrooms": 4,
  "bathrooms": 3,
  "price": "18500.00",
  "approval_status": "APPROVED",
  "is_active": true,
  "created_at": "2026-01-04T09:30:00Z"
}
```

#### Error Response (400 Bad Request)

```json
{
  "title": ["This field is required."],
  "uploaded_images": ["At least 5 images are required."],
  "bedrooms": ["Ensure this value is greater than or equal to 1."]
}
```

---

### 3. Create Hotel Room Listing

Create a hotel room listing (HOTEL role required).

**Endpoint:** `POST /`  
**Authentication:** Required (HOTEL)  
**Content-Type:** `multipart/form-data`

#### Request Body (Multipart Form Data)

```
title: Superior Double Room
description: Elegant room with city view, minibar, and work desk...
price: 8900.00
negotiable: false
quantity: 10
max_guests: 2
min_duration: 1
room_category: DOUBLE
location_text: Constantine, City Center
cover_image: <file>
uploaded_images: <file1>
uploaded_images: <file2>
uploaded_images: <file3>
uploaded_images: <file4>
uploaded_images: <file5>
amenities: 1
amenities: 2
amenities: 5
amenities: 9
uploaded_beds: [{"bed_type_id": 3, "quantity": 1}]
```

**Note:** Arrays (uploaded_images, amenities) are sent as multiple fields with the same name.

#### Field Validations

Similar to Property Listing, with these differences:

| Field           | Type    | Required | Constraints                                              |
| --------------- | ------- | -------- | -------------------------------------------------------- |
| `room_category` | string  | ✅        | Choices: `SINGLE`, `DOUBLE`, `SUITE`, `DELUXE`, `FAMILY` |
| `hotel_stars`   | integer | -        | Read-only, from `hotel_profile.stars`                    |

**Auto-set fields:**

- `hotel_profile` → User's hotel profile

#### Success Response (201 Created)

```json
{
  "id": 43,
  "listing_type": "HOTEL_ROOM",
  "room_category": "DOUBLE",
  "hotel_stars": 4,
  "title": "Superior Double Room",
  "price": "8900.00"
}
```

---

### 4. Create Hostel Bed Listing

Create a hostel bed listing (HOSTEL role required).

**Endpoint:** `POST /`  
**Authentication:** Required (HOSTEL)  
**Content-Type:** `multipart/form-data`

#### Request Body (Multipart Form Data)

```
title: Mixed Dorm - 8 Beds
description: Clean, secure dormitory with lockers and free breakfast...
price: 1500.00
quantity: 8
max_guests: 1
room_type: DORM
gender: MALE
location_text: Algiers, Bab El Oued
cover_image: <file>
uploaded_images: <file1>
uploaded_images: <file2>
uploaded_images: <file3>
uploaded_images: <file4>
uploaded_images: <file5>
amenities: 1
amenities: 10
amenities: 12
uploaded_beds: [{\"bed_type_id\": 5, \"quantity\": 8}]
```

**Note:** Arrays are sent as multiple fields with the same name.

#### Field Validations

| Field       | Type   | Required | Constraints                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| `room_type` | string | ✅        | Choices: `DORM` (dormitory), `PRIVATE` (private room) |
| `gender`    | string | ✅        | Choices: `MALE`, `FEMALE`                             |

**Auto-set fields:**

- `hostel_profile` → User's hostel profile

---

### 5. Create Travel Package Listing

Create a travel package with itinerary (AGENCY role required).

**Endpoint:** `POST /`  
**Authentication:** Required (AGENCY)  
**Content-Type:** `multipart/form-data`

#### Request Body (Multipart Form Data)

```
title: 7-Day Sahara Desert Safari
description: Experience the magic of the Sahara with camel trekking, dune camping...
price: 85000.00
package_type: LOCAL
duration_days: 7
location_text: Tamanrasset
cover_image: <file>
uploaded_images: <file1>
uploaded_images: <file2>
uploaded_images: <file3>
uploaded_images: <file4>
uploaded_images: <file5>
uploaded_itinerary: [
    {
      "day": 1,
      "title": "Arrival",
      "description": "Airport pickup and hotel check-in in Tamanrasset."
    },
    {
      "day": 2,
      "title": "Desert Journey Begins",
      "description": "Morning departure to Assekrem. Camel riding experience."
    },
    {
      "day": 3,
      "title": "Dune Exploration",
      "description": "Visit the Great Erg dunes. Sunset photography session."
    },
    {
      "day": 4,
      "title": "Oasis Visit",
      "description": "Explore Tassili N'Ajjer. Rock art viewing."
    },
    {
      "day": 5,
      "title": "Cultural Experience",
      "description": "Traditional Tuareg village visit. Local cuisine tasting."
    },
    {
      "day": 6,
      "title": "Stargazing Night",
      "description": "Astronomy session in the desert. Night camping."
    },
    {
      "day": 7,
      "title": "Departure",
      "description": "Return to Tamanrasset. Airport transfer."
    }
  ]
```

**Note:** For multipart/form-data:

- `uploaded_images` - send as multiple fields with same name
- `uploaded_itinerary` - send as JSON string (array of day objects)

#### Field Validations

| Field                | Type       | Required | Constraints                                                             |
| -------------------- | ---------- | -------- | ----------------------------------------------------------------------- |
| `price`              | decimal    | ✅        | Price per person for this package                                       |
| `package_type`       | string     | ✅        | Choices: `LOCAL`, `HAJJ`, `UMRAH`, `INTERNATIONAL`                      |
| `duration_days`      | integer    | ❌        | Auto-calculated from itinerary length if not provided                   |
| `uploaded_itinerary` | JSON array | ✅        | Array of `{day, title, description}` objects (at least 1 item required) |

**Itinerary Validation Rules:**

- Days must start from 1
- No duplicate days
- Day 1 **must** be titled "Arrival"
- Last day **must** be titled "Departure"
- `duration_days` auto-syncs with itinerary item count

**Auto-set fields:**

- `agency_profile` → User's agency profile
- `quantity` → Set to 0 (meaningless; capacity is in schedules)

**Note:** After creating a package, you must create **PackageSchedule** instances (departures) for it to be bookable. See [Manage Itinerary Items](#9-manage-itinerary-items-packages-only).

#### Success Response (201 Created)

```json
{
  "id": 44,
  "listing_type": "TRAVEL_PACKAGE",
  "package_type": "LOCAL",
  "duration_days": 7,
  "price": "85000.00",
  "itinerary_items": [
    {
      "id": 101,
      "day": 1,
      "title": "Arrival",
      "description": "Airport pickup..."
    },
    {
      "id": 102,
      "day": 2,
      "title": "Desert Journey Begins",
      "description": "Morning departure..."
    }
  ],
  "schedules": []
}
```

---

### 6. Get Listing Details

Retrieve details of a specific listing.

**Endpoint:** `GET /{id}/`  
**Authentication:** Optional

#### Success Response (200 OK)

**For Travel Package:**

```json
{
  "id": 44,
  "listing_type": "TRAVEL_PACKAGE",
  "title": "7-Day Sahara Desert Safari",
  "base_price": "85000.00",
  "duration_days": 7,
  "package_type": "LOCAL",
  "itinerary_items": [
    {"id": 101, "day": 1, "title": "Arrival", "description": "..."},
    {"id": 107, "day": 7, "title": "Departure", "description": "..."}
    ...
  ],
  "schedules": [
    {
      "id": 15,
      "start_date": "2026-03-10",
      "end_date": "2026-03-17",
      "total_price": "82000.00",
      "max_capacity": 30,
      "spots_booked": 8,
      "spots_available": 22,
      "is_fully_booked": false
    },
    {
      "id": 16,
      "start_date": "2026-04-05",
      "end_date": "2026-04-12",
      "total_price": "85000.00",
      "max_capacity": 25,
      "spots_booked": 25,
      "spots_available": 0,
      "is_fully_booked": true
    }
  ],
  "images": [...],
}
```

---

### 7. Update Listing

Update listing details.

**Endpoint:** `PATCH /{id}/`  
**Authentication:** Required (Owner or Admin)  
**Content-Type:** `application/json` or `multipart/form-data`

#### Request Body (Partial Update)

```json
{
  "price": "19500.00",
  "negotiable": true,
  "description": "Updated description"
}
```

**ADMIN RESTRICTION:** Admins cannot manually approve listings from unverified providers. If admin attempts to set `approval_status=APPROVED` for a listing owned by an unverified provider:

```json
{
  "error": "Cannot approve listing from non-verified provider. Provider verification status: PENDING. Please verify the provider first."
}
```

---

### 8. Delete Listing

Delete a listing (Owner or Admin only).

**Endpoint:** `DELETE /{id}/`  
**Authentication:** Required (Owner or Admin)

#### Success Response (204 No Content)

---

### 9. Manage Itinerary Items (Packages Only)

Nested endpoints for managing travel package itinerary items.

#### Base URL: `/listings/{listing_id}/itinerary/`

**List Itinerary Items**

```
GET /listings/{listing_id}/itinerary/
```

**Create Itinerary Item**

```
POST /listings/{listing_id}/itinerary/
Content-Type: application/json

{
  "day": 4,
  "title": "Mountain Hike",
  "description": "Trek through Atlas Mountains with local guide..."
}
```

**Update Itinerary Item**

```
PATCH /listings/{listing_id}/itinerary/{item_id}/

{
  "description": "Updated description..."
}
```

**Delete Itinerary Item**

```
DELETE /listings/{listing_id}/itinerary/{item_id}/
```

**Authorization:** Only package owner or admin can modify itinerary.

---

### 10. Manage Unavailable Dates

Nested endpoints for blocking dates (maintenance, personal use, etc.).

#### Base URL: `/listings/{listing_id}/availability/`

**List Unavailable Dates**

```
GET /listings/{listing_id}/availability/
```

**Block Dates**

```
POST /listings/{listing_id}/availability/
Content-Type: application/json

{
  "start_date": "2026-02-10",
  "end_date": "2026-02-15",
  "reason": "Annual maintenance"
}
```

**Update Blocked Dates**

```
PATCH /listings/{listing_id}/availability/{date_id}/

{
  "end_date": "2026-02-18"
}
```

**Remove Blocked Dates**

```
DELETE /listings/{listing_id}/availability/{date_id}/
```

**Authorization:** Only listing owner or admin can modify availability.

---

## Business Logic

### 1. Listing Approval Flow

```
Provider Registration → Verification Request → Admin Reviews Provider
                                                       ↓
                                            Verify Provider (Users API)
                                                       ↓
                                    ALL provider's listings auto-approved
```

**Key Points:**

- Listings from **unverified providers** are NEVER visible to public
- Admins verify **providers**, not individual listings
- When provider verified → All listings activated automatically

### 2. Image Optimization

All uploaded images are automatically optimized:

- Converted to JPEG format
- Resized to max width 1920px (maintaining aspect ratio)
- Compressed to 85% quality
- Max file size: 10MB

### 3. Performance Optimizations

**Queryset Optimizations:**

- `select_related()` for owner profiles (hotel_profile, agency_profile, etc.)
- `prefetch_related()` for images, amenities, restrictions, nearby, beds
- **Result:** 600+ queries → ~10 queries for list endpoints (80-90% faster)

---

## Common Errors

### 403 Forbidden - Wrong Role

```json
{
  "detail": "User does not have a Host Profile."
}
```

**Solution:** Ensure user has the correct role for listing type (HOST for properties, HOTEL for rooms, etc.)

### 400 Bad Request - Missing Images

```json
{
  "uploaded_images": ["At least 5 images are required."]
}
```

### 400 Bad Request - Invalid Itinerary

```json
{
  "uploaded_itinerary": ["First itinerary item must be titled 'Arrival'."]
}
```

### 400 Bad Request - Approval Restriction

```json
{
  "error": "Cannot approve listing from non-verified provider. Provider verification status: PENDING. Please verify the provider first."
}
```

**Solution:** Verify the provider first using Users API endpoint `/users/{id}/verify/`

---

**End of Listings API Documentation**