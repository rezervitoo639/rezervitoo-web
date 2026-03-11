# RizerVitoo Bookings API Documentation

**Base URL:** `http://api.rezervitoo.com/api/v1/bookings/`

**Version:** 1.0  
**Last Updated:** January 4, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Booking System Architecture](#booking-system-architecture)
3. [Endpoints](#endpoints)
   - [List Bookings](#1-list-bookings)
   - [Create Accommodation Booking](#2-create-accommodation-booking)
   - [Create Travel Package Booking](#3-create-travel-package-booking)
   - [Get Booking Details](#4-get-booking-details)
   - [Accept Booking (Provider)](#5-accept-booking-provider)
   - [Reject Booking (Provider)](#6-reject-booking-provider)
   - [Get Bookings by Listing](#7-get-bookings-by-listing)
4. [Business Logic](#business-logic)
5. [Common Errors](#common-errors)

---

## Overview

RizerVitoo uses a **dual booking system** that handles two fundamentally different booking types:

1. **Date-Based Bookings** - For accommodations (Properties, Hotels, Hostels)
2. **Schedule-Based Bookings** - For travel packages (Agencies)

### Authentication

All booking operations require JWT authentication.

**Authentication Header:**

```
Authorization: Bearer <access_token>
```

### User Roles & Permissions

| Role         | List Bookings               | Create | Accept/Reject | View by Listing      |
| ------------ | --------------------------- | ------ | ------------- | -------------------- |
| **User**     | Own bookings only           | ✅ Yes  | ❌ No          | ❌ No                 |
| **Provider** | Bookings for their listings | ❌ No   | ✅ Yes         | ✅ Yes (own listings) |
| **Admin**    | All bookings                | ✅ Yes  | ✅ Yes         | ✅ Yes (all listings) |

---

## Booking System Architecture

### Dual Booking Logic

The booking system automatically determines the correct flow based on **listing type**:

```
┌─────────────────────────────────────────────────────────┐
│                    BOOKING REQUEST                       │
└────────────────────┬────────────────────────────────────┘
                     │
           ┌─────────▼─────────┐
           │ Listing Type?     │
           └─────────┬─────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│ ACCOMMODATION │         │   PACKAGE    │
│ (Property,    │         │ (TravelPkg)  │
│ Hotel,Hostel) │         │              │
└───────┬───────┘         └──────┬───────┘
        │                        │
        ▼                        ▼
┌───────────────┐         ┌──────────────┐
│ REQUIRES:     │         │ REQUIRES:    │
│ - start_date  │         │ - schedule   │
│ - end_date    │         │              │
│ - guests      │         │ - guests     │
│               │         │              │
│ MUST NOT:     │         │ MUST NOT:    │
│ - schedule    │         │ - dates      │
└───────┬───────┘         └──────┬───────┘
        │                        │
        ▼                        ▼
┌───────────────┐         ┌───────────────┐
│ CALCULATION:  │         │ CALCULATION:  │
│ price × nights│         │ schedule.     │
│               │         │ price × guests│
└───────┬───────┘         └──────┬────────┘
        │                        │
        ▼                        ▼
┌───────────────┐         ┌──────────────┐
│ VALIDATION:   │         │ VALIDATION:  │
│ - Date range  │         │ - Capacity   │
│ - Max guests  │         │ - Schedule   │
│               │         │   ownership  │
└───────────────┘         └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │ ATOMIC:      │
                          │ Increment    │
                          │ spots_booked │
                          └──────────────┘
```

### Booking Model

```python
{
  "id": 42,
  "user": 15,                         # Authenticated user (customer)
  "listing": 8,                       # Listing ID
  "listing_type_at_booking": "HOTEL_ROOM",  # Snapshot of type

  # DATES (Conditional)
  "start_date": "2026-02-10",         # Required for accommodations
  "end_date": "2026-02-13",           # Required for accommodations

  # PACKAGE-SPECIFIC (Conditional)
  "schedule": 12,                     # Required for packages

  # COMMON FIELDS
  "guests_count": 2,                  # Number of guests/spots
  "total_price": "26700.00",          # Auto-calculated
  "status": "PENDING",                # PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED
  "created_at": "2026-01-05T14:30:00Z",
  "updated_at": "2026-01-05T14:30:00Z",

  # NESTED DATA
  "listing_details": { ... }          # Full listing object
}
```

---

## Endpoints

### 1. List Bookings

Get bookings based on user role.

**Endpoint:** `GET /`  
**Authentication:** Required

#### Visibility Rules

- **Users:** Only their own bookings
- **Providers:** Bookings for their listings
- **Admins:** All bookings

#### Success Response (200 OK)

```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 42,
      "user": 15,
      "listing": 8,
      "listing_type_at_booking": "HOTEL_ROOM",
      "start_date": "2026-02-10",
      "end_date": "2026-02-13",
      "schedule": null,
      "guests_count": 2,
      "total_price": "26700.00",
      "status": "PENDING",
      "created_at": "2026-01-05T14:30:00Z",
      "updated_at": "2026-01-05T14:30:00Z",
      "listing_details": {
        "id": 8,
        "title": "Deluxe Suite - Grand Hotel",
        "price": "8900.00",
        "listing_type": "HOTEL_ROOM",
        "room_category": "SUITE",
        "images": [{ "id": 45, "image": "/media/listing_images/suite_1.jpg" }]
        ..... etc
      }
    },
    {
      "id": 43,
      "user": 15,
      "listing": 22,
      "listing_type_at_booking": "TRAVEL_PACKAGE",
      "start_date": "2026-03-15",
      "end_date": "2026-03-22",
      "schedule": 18,
      "guests_count": 4,
      "total_price": "340000.00",
      "status": "ACCEPTED",
      "created_at": "2026-01-06T10:15:00Z",
      "listing_details": {
        "id": 22,
        "title": "7-Day Sahara Desert Safari",
        "price": "85000.00",
        "listing_type": "TRAVEL_PACKAGE",
        "schedules": [
          {
            "id": 18,
            "start_date": "2026-03-15",
            "end_date": "2026-03-22",
            "spots_available": 16
          }
        ]
        ..... etc
      }
    }
  ]
}
```

---

### 2. Create Accommodation Booking

Book a property, hotel room, or hostel bed.

**Endpoint:** `POST /`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "listing": 8,
  "start_date": "2026-02-10",
  "end_date": "2026-02-13",
  "guests_count": 2
}
```

#### Field Validations

| Field          | Type    | Required | Constraints                                   |
| -------------- | ------- | -------- | --------------------------------------------- |
| `listing`      | integer | ✅        | Must be a valid Property/Hotel/Hostel listing |
| `start_date`   | date    | ✅        | Cannot be in the past, format: YYYY-MM-DD     |
| `end_date`     | date    | ✅        | Must be after `start_date`                    |
| `guests_count` | integer | ✅        | Min 1, cannot exceed `listing.max_guests`     |
| `schedule`     | integer | ❌        | **MUST NOT be provided** for accommodations   |

**Auto-calculated fields:**

- `listing_type_at_booking` → Determined from listing type (PROPERTY, HOTEL_ROOM, HOSTEL_BED)
- `total_price` → `listing.price × number_of_nights`
- `status` → Default: `PENDING`

#### Price Calculation Example

```
Listing price: 8900 DA/night (for entire listing)
Dates: 2026-02-10 to 2026-02-13 (3 nights)

Calculation: 8900 × 3 = 26,700 DA
```

#### Success Response (201 Created)

```json
{
  "id": 42,
  "user": 15,
  "listing": 8,
  "listing_type_at_booking": "HOTEL_ROOM",
  "start_date": "2026-02-10",
  "end_date": "2026-02-13",
  "schedule": null,
  "guests_count": 2,
  "total_price": "26700.00",
  "status": "PENDING",
  "created_at": "2026-01-05T14:30:00Z",
  "listing_details": { ... }
}
```

#### Error Response (400 Bad Request)

```json
{
  "start_date": ["Start date cannot be in the past."],
  "end_date": ["End date must be after start date."],
  "guests_count": ["Number of guests cannot exceed 4 for this listing."]
}
```

---

### 3. Create Travel Package Booking

Book a specific departure schedule for a travel package.

**Endpoint:** `POST /`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "listing": 22,
  "schedule": 18,
  "guests_count": 4
}
```

#### Field Validations

| Field          | Type    | Required | Constraints                                              |
| -------------- | ------- | -------- | -------------------------------------------------------- |
| `listing`      | integer | ✅        | Must be a valid TravelPackageListing                     |
| `schedule`     | integer | ✅        | Must be a valid PackageSchedule belonging to the listing |
| `guests_count` | integer | ✅        | Min 1, cannot exceed `schedule.spots_available`          |
| `start_date`   | date    | ❌        | **MUST NOT be provided** (auto-populated from schedule)  |
| `end_date`     | date    | ❌        | **MUST NOT be provided** (auto-populated from schedule)  |

**Business Logic:**

1. **Validation:**
   
   - Verify schedule belongs to the listing
   - Check capacity: `schedule.spots_available >= guests_count`

2. **Auto-populated fields:**
   
   - `listing_type_at_booking` → `TRAVEL_PACKAGE`
   - `start_date` → Copied from `schedule.start_date`
   - `end_date` → Copied from `schedule.end_date`
   - `total_price` → `listing.price × guests_count`

3. **Atomic Capacity Update:**
   
   - `schedule.spots_booked` incremented by `guests_count` using **F() expression**
   - Prevents race conditions (double-booking)
   - Updates happen in a single database query

#### Capacity Check Example

```
Schedule Details:
- Departure: 2026-03-15
- max_capacity: 30
- spots_booked: 12
- spots_available: 18

Booking Request: 4 guests
✅ ALLOWED (18 >= 4)

After Booking:
- spots_booked: 16
- spots_available: 14
```

#### Success Response (201 Created)

```json
{
  "id": 43,
  "user": 15,
  "listing": 22,
  "listing_type_at_booking": "TRAVEL_PACKAGE",
  "start_date": "2026-03-15",
  "end_date": "2026-03-22",
  "schedule": 18,
  "guests_count": 4,
  "total_price": "340000.00",
  "status": "PENDING",
  "created_at": "2026-01-06T10:15:00Z",
  "listing_details": {
    "id": 22,
    "title": "7-Day Sahara Desert Safari",
    "price": "85000.00",
    "listing_type": "TRAVEL_PACKAGE"
  }
}
```

#### Error Responses

**Insufficient Capacity (400 Bad Request)**

```json
{
  "guests_count": ["Not enough spots available. Only 2 spots remaining."]
}
```

**Wrong Schedule (400 Bad Request)**

```json
{
  "schedule": ["Selected schedule does not belong to this package."]
}
```

**Dates Provided (400 Bad Request)**

```json
{
  "start_date": [
    "Package bookings should not include start_date/end_date. Use schedule instead."
  ]
}
```

**Missing Schedule (400 Bad Request)**

```json
{
  "schedule": ["Package bookings must reference a specific departure schedule."]
}
```

---

### 4. Get Booking Details

Retrieve details of a specific booking.

**Endpoint:** `GET /{id}/`  
**Authentication:** Required

**Authorization:** Users can view their own bookings, providers can view bookings for their listings.

#### Success Response (200 OK)

```json
{
  "id": 43,
  "user": 15,
  "listing": 22,
  "listing_type_at_booking": "TRAVEL_PACKAGE",
  "start_date": "2026-03-15",
  "end_date": "2026-03-22",
  "schedule": 18,
  "guests_count": 4,
  "total_price": "340000.00",
  "status": "ACCEPTED",
  "created_at": "2026-01-06T10:15:00Z",
  "updated_at": "2026-01-07T09:20:00Z",
  "listing_details": {
    "id": 22,
    "title": "7-Day Sahara Desert Safari",
    "listing_type": "TRAVEL_PACKAGE",
    "price": "85000.00",
    "package_type": "LOCAL",
    "duration_days": 7,
    "itinerary_items": [
      {"day": 1, "title": "Arrival", "description": "..."},
      {"day": 7, "title": "Departure", "description": "..."}
    ],
    "schedules": [
      {
        "id": 18,
        "start_date": "2026-03-15",
        "end_date": "2026-03-22",
        "spots_available": 14
      }
    ],
    "images": [...]
  }
    ..... etc
}
```

---

### 5. Accept Booking (Provider)

Provider action to accept a pending booking.

**Endpoint:** `POST /{id}/accept/`  
**Authentication:** Required (Provider/Admin)

**Authorization:** Only the listing owner can accept bookings for their listings.

#### Success Response (200 OK)

```json
{
  "status": "accepted"
}
```

**Side Effects:**

- Booking status changed to `ACCEPTED`
- TODO: Notification sent to user

#### Error Response (403 Forbidden)

```json
{
  "error": "Not authorized"
}
```

---

### 6. Reject Booking (Provider)

Provider action to reject a pending booking.

**Endpoint:** `POST /{id}/reject/`  
**Authentication:** Required (Provider/Admin)

**Authorization:** Only the listing owner can reject bookings.

#### Success Response (200 OK)

```json
{
  "status": "rejected"
}
```

**Side Effects:**

- Booking status changed to `REJECTED`
- For package bookings: `schedule.spots_booked` should be decremented (TODO)
- TODO: Notification sent to user

---

### 7. Get Bookings by Listing

Retrieve all bookings for a specific listing (excludes cancelled/rejected).

**Endpoint:** `GET /by-listing/{listing_id}/`  
**Authentication:** Required (Provider/Admin)

**Authorization:** Only listing owner or admin can access.

**Use Cases:**

- Display calendar availability
- Provider booking management
- Admin monitoring

#### Success Response (200 OK)

```json
[
  {
    "id": 98,
    "user": 12,
    "listing": 8,
    "start_date": "2026-02-10",
    "end_date": "2026-02-13",
    "guests_count": 2,
    "total_price": "26700.00",
    "status": "PENDING"
  },
  {
    "id": 102,
    "user": 19,
    "listing": 8,
    "start_date": "2026-02-15",
    "end_date": "2026-02-18",
    "guests_count": 3,
    "total_price": "80100.00",
    "status": "ACCEPTED"
  }
]
```

**Filtering:** Automatically excludes bookings with status `CANCELLED` or `REJECTED`.

#### Error Response (403 Forbidden)

```json
{
  "error": "Not authorized"
}
```

---

## Business Logic

### 1. Dual Booking System Decision Tree

```python
if listing_type == 'TRAVEL_PACKAGE':
    # SCHEDULE-BASED BOOKING
    required_fields = ['listing', 'schedule', 'guests_count']
    forbidden_fields = ['start_date', 'end_date']

    validation:
        - schedule.package_id == listing.id
        - schedule.spots_available >= guests_count

    calculation:
        total_price = listing.price × guests_count

    atomic_update:
        schedule.spots_booked = F('spots_booked') + guests_count

    auto_populate:
        start_date = schedule.start_date
        end_date = schedule.end_date

else:  # PROPERTY, HOTEL_ROOM, HOSTEL_BED
    # DATE-BASED BOOKING
    required_fields = ['listing', 'start_date', 'end_date', 'guests_count']
    forbidden_fields = ['schedule']

    validation:
        - start_date >= today
        - end_date > start_date
        - guests_count <= listing.max_guests

    calculation:
        nights = (end_date - start_date).days
        total_price = listing.price × nights
```

### 2. Atomic Capacity Management

**Problem:** Race conditions when multiple users book simultaneously.

**Solution:** Use Django's F() expression for atomic database updates.

```python
# BAD (Race Condition):
schedule.spots_booked += guests_count
schedule.save()

# GOOD (Atomic):
PackageSchedule.objects.filter(id=schedule.id).update(
    spots_booked=F('spots_booked') + guests_count
)
```

**How it works:**

1. Database increments `spots_booked` directly in SQL
2. No race condition between read and write
3. Even with 100 concurrent bookings, capacity is accurate

### 3. Booking Status Lifecycle

```
┌──────────┐
│ PENDING  │ ◄─── Initial state (user creates booking)
└────┬─────┘
     │
     ├─────► ┌──────────┐
     │       │ ACCEPTED │ ◄─── Provider accepts
     │       └──────────┘
     │
     ├─────► ┌──────────┐
     │       │ REJECTED │ ◄─── Provider rejects
     │       └──────────┘
     │
     ├─────► ┌───────────┐
     │       │ CANCELLED │ ◄─── User cancels
     │       └───────────┘
     │
     └─────► ┌───────────┐
             │ COMPLETED │ ◄─── After checkout/departure
             └───────────┘
```

### 4. Price Calculation Examples

**Accommodation Example:**

```
Listing: Beach Villa, 18500 DA/night (entire listing)
Booking: 2026-03-10 to 2026-03-15 (5 nights)

Calculation:
  18500 DA × 5 nights = 92,500 DA
```

**Travel Package Example:**

```
Package: Sahara Safari, price = 85000 DA/person
Schedule: Departure 2026-03-15
Booking: 3 guests

Calculation:
  85000 DA × 3 guests = 255,000 DA

Note: All schedules for the same package use the same price.**
```

### 5. Validation Summary

| Scenario                  | Must Have                                   | Must NOT Have        | Additional Checks                           |
| ------------------------- | ------------------------------------------- | -------------------- | ------------------------------------------- |
| **Property/Hotel/Hostel** | listing, start_date, end_date, guests_count | schedule             | guests ≤ max_guests, dates valid            |
| **Travel Package**        | listing, schedule, guests_count             | start_date, end_date | schedule belongs to listing, capacity check |

---

## Common Errors

### 400 Bad Request - Date in Past

```json
{
  "start_date": ["Start date cannot be in the past."]
}
```

### 400 Bad Request - Invalid Date Range

```json
{
  "end_date": ["End date must be after start date."]
}
```

### 400 Bad Request - Guest Limit Exceeded

```json
{
  "guests_count": ["Number of guests cannot exceed 4 for this listing."]
}
```

### 400 Bad Request - Insufficient Capacity

```json
{
  "guests_count": ["Not enough spots available. Only 8 spots remaining."]
}
```

### 400 Bad Request - Wrong Fields for Package

```json
{
  "start_date": [
    "Package bookings should not include start_date/end_date. Use schedule instead."
  ]
}
```

### 400 Bad Request - Wrong Fields for Accommodation

```json
{
  "schedule": ["Schedule should only be provided for package bookings."],
  "start_date": ["This field is required."],
  "end_date": ["This field is required."]
}
```

### 400 Bad Request - Schedule Mismatch

```json
{
  "schedule": ["Selected schedule does not belong to this package."]
}
```

### 403 Forbidden - Unauthorized Action

```json
{
  "error": "Not authorized"
}
```

**Context:** User trying to accept/reject a booking they don't own.

### 404 Not Found - Invalid Listing

```json
{
  "error": "Listing not found"
}
```

---

**End of Bookings API Documentation**
