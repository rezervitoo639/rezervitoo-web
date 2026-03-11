# RizerVitoo Support API Documentation

**Base URL:** `http://api.rezervitoo.com/api/v1/support/`

**Version:** 1.0  
**Last Updated:** January 19, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Endpoints](#endpoints)
   - [Reviews](#reviews)
     - [Create Review](#1-create-review)
     - [List Reviews](#2-list-reviews)
     - [Get Review Details](#3-get-review-details)
     - [Update Review](#4-update-review)
     - [Delete Review](#5-delete-review)
     - [Get User Rating](#6-get-user-rating)
   - [Reports](#reports)
     - [Create Report](#7-create-report)
     - [List Reports](#8-list-reports-admin-only)
     - [Update Report Status](#9-update-report-status-admin-only)
   - [Wishlist](#wishlist)
     - [List Wishlist](#10-list-wishlist)
     - [Toggle Wishlist](#11-toggle-wishlist)
3. [Business Logic](#business-logic)
4. [Common Errors](#common-errors)

---

## Overview

The Support API manages user interactions including reviews, reports, and wishlists. It implements role-based access control and comprehensive validation.

### Authentication

Most endpoints require JWT authentication.

**Authentication Header:**

```
Authorization: Bearer <access_token>
```

### User Roles & Permissions

| Feature      | User                        | Provider                 | Admin       |
| ------------ | --------------------------- | ------------------------ | ----------- |
| **Reviews**  | Create/edit listing reviews | Create/edit user reviews | Full access |
| **Reports**  | Report providers            | Report users             | Manage all  |
| **Wishlist** | Manage own wishlist         | View                     | View        |

---

## Endpoints

## Reviews

### 1. Create Review

Create a review for a completed booking (listing review by user or user review by provider).

**Endpoint:** `POST /reviews/`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data` or `application/json`

#### Request Body - User to Listing Review

```json
{
  "booking": 45,
  "review_type": "USER_TO_LISTING",
  "rating": 5,
  "comment": "Amazing place, highly recommended! Very clean and comfortable.",
  "image": "<file upload>"
}
```

#### Request Body - Provider to User Review

```json
{
  "booking": 45,
  "review_type": "PROVIDER_TO_USER",
  "rating": 5,
  "comment": "Excellent guest, very respectful and clean."
}
```

#### Field Validations

| Field         | Type    | Required | Constraints                                |
| ------------- | ------- | -------- | ------------------------------------------ |
| `booking`     | integer | ✅ Yes    | Must exist, status ACCEPTED/COMPLETED      |
| `review_type` | string  | ✅ Yes    | "USER_TO_LISTING" or "PROVIDER_TO_USER"    |
| `rating`      | integer | ✅ Yes    | Between 1 and 5                            |
| `comment`     | string  | ❌ No     | Min 10 chars, max 1000 chars (if provided) |
| `image`       | file    | ❌ No     | Image file (optional)                      |

#### Business Rules

**USER_TO_LISTING:**

- Only users with `account_type='USER'` can create
- User must be the booking guest (`booking.user`)
- Booking must have started (`booking.start_date <= today`)
- One review per booking per user

**PROVIDER_TO_USER:**

- Only providers can create
- Provider must own the listing (`booking.listing.owner`)
- Booking must have started
- One review per booking per provider

#### Success Response (201 Created)

```json
{
  "id": 15,
  "reviewer": 8,
  "reviewer_id": 8,
  "reviewer_name": "Jane Smith",
  "reviewer_picture": "/media/profile_pics/jane.jpg",
  "booking": 45,
  "review_type": "USER_TO_LISTING",
  "listing": 12,
  "listing_title": "Cozy Beach Bungalow",
  "listing_cover": "/media/listing_covers/bungalow.jpg",
  "listing_type": "HOTEL_ROOM",
  "reviewed_user": null,
  "rating": 5,
  "comment": "Amazing place, highly recommended! Very clean and comfortable.",
  "image": "/media/review_images/beach_view.jpg",
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

#### Error Responses

**Invalid Booking Status (400)**

```json
{
  "booking": [
    "Cannot review a booking with status 'PENDING'. Booking must be accepted or completed."
  ]
}
```

**Unauthorized (400)**

```json
{
  "booking": [
    "You can only review bookings you made. This booking belongs to another user."
  ]
}
```

**Duplicate Review (400)**

```json
{
  "non_field_errors": ["You have already submitted a review for this booking."]
}
```

**Too Early (400)**

```json
{
  "booking": [
    "You can only review after your stay has started. Check-in date: 2026-02-15."
  ]
}
```

---

### 2. List Reviews

Get a list of reviews with filtering.

**Endpoint:** `GET /reviews/`  
**Authentication:** Optional (some filters require auth)  
**Query Parameters:**

| Parameter       | Type    | Description                                       |
| --------------- | ------- | ------------------------------------------------- |
| `review_type`   | string  | Filter by "USER_TO_LISTING" or "PROVIDER_TO_USER" |
| `listing`       | integer | Filter by listing ID                              |
| `reviewed_user` | integer | Filter by reviewed user ID (admin/provider)       |
| `reviewer`      | integer | Filter by reviewer ID                             |
| `min_rating`    | integer | Minimum rating (1-5)                              |
| `max_rating`    | integer | Maximum rating (1-5)                              |
| `search`        | string  | Search in comments and user names                 |
| `page`          | integer | Page number (default: 1)                          |
| `page_size`     | integer | Items per page (default: 25)                      |

#### Visibility Rules

- **Public/Users/Providers:** Can see `USER_TO_LISTING` reviews only
- **Admins:** Can see ALL reviews including `PROVIDER_TO_USER`

**Example Request:**

```
GET /reviews/?listing=12&min_rating=4&page=1
```

#### Success Response (200 OK)

```json
{
  "count": 25,
  "next": "http://api.rezervitoo.com/api/v1/support/reviews/?page=2",
  "previous": null,
  "results": [
    {
      "id": 15,
      "reviewer_id": 8,
      "reviewer_name": "Jane Smith",
      "reviewer_picture": "/media/profile_pics/jane.jpg",
      "review_type": "USER_TO_LISTING",
      "listing_title": "Cozy Beach Bungalow",
      "rating": 5,
      "comment": "Amazing place!",
      "image": "/media/review_images/beach.jpg",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Review Details

Retrieve detailed information about a specific review.

**Endpoint:** `GET /reviews/{id}/`  
**Authentication:** Optional for listing reviews, Required for user reviews

#### Success Response (200 OK)

Same structure as Create Review response.

#### Error Response (404)

```json
{
  "detail": "No Review matches the given query."
}
```

---

### 4. Update Review

Update an existing review (editable fields only).

**Endpoint:** `PUT /reviews/{id}/` or `PATCH /reviews/{id}/`  
**Authentication:** Required (review creator or admin)  
**Content-Type:** `multipart/form-data` or `application/json`

#### Editable Fields

- `rating` (1-5)
- `comment` (10-1000 chars)
- `image` (file upload)

#### Non-Editable Fields (Immutable)

- `booking` - Cannot change booking reference
- `review_type` - Cannot change review type
- `listing` - Auto-set from booking
- `reviewed_user` - Auto-set from booking
- `reviewer` - Original author

#### Request Body (PATCH - Recommended)

```json
{
  "rating": 4,
  "comment": "Updated my review after second thought. Still great but not perfect."
}
```

#### Request Body (PUT - Full Update)

```json
{
  "booking": 45,
  "review_type": "USER_TO_LISTING",
  "rating": 4,
  "comment": "Updated my review after second thought."
}
```

**Note:** For PUT, you must include all required fields even though `booking` and `review_type` cannot actually be changed.

#### Success Response (200 OK)

```json
{
  "id": 15,
  "reviewer": 8,
  "rating": 4,
  "comment": "Updated my review after second thought. Still great but not perfect.",
  "updated_at": "2026-01-15T14:45:00Z",
  "created_at": "2026-01-10T10:30:00Z"
}
```

#### Error Responses

**Unauthorized (403)**

```json
{
  "detail": "You can only update your own reviews"
}
```

**Immutable Field (400)**

```json
{
  "booking": ["You cannot change the booking for an existing review."]
}
```

---

### 5. Delete Review

Delete a review (creator or admin only).

**Endpoint:** `DELETE /reviews/{id}/`  
**Authentication:** Required

#### Success Response (204 No Content)

No response body.

#### Error Response (403)

```json
{
  "detail": "You can only delete your own reviews"
}
```

---

### 6. Get User Rating

Get a user's average rating from provider reviews.

**Endpoint:** `GET /reviews/user_rating/`  
**Authentication:** Required  
**Query Parameters:**

| Parameter | Type    | Required | Description                               |
| --------- | ------- | -------- | ----------------------------------------- |
| `user_id` | integer | ❌ No     | Target user ID (defaults to current user) |

#### Access Control

- **Regular Users:** Can only view their own rating (no `user_id` or `user_id=self`)
- **Providers:** Can view any user's rating (to check guest ratings)
- **Admins:** Can view any user's rating

#### Example Requests

**Get your own rating:**

```
GET /reviews/user_rating/
```

**Get another user's rating (providers/admins):**

```
GET /reviews/user_rating/?user_id=38
```

#### Success Response (200 OK)

```json
{
  "user_id": 38,
  "average_rating": 4.7,
  "review_count": 12
}
```

#### Error Responses

**Unauthorized Access (403)**

```json
{
  "error": "Permission Denied: You can only view your own rating."
}
```

**User Not Found (404)**

```json
{
  "error": "User not found"
}
```

---

## Reports

### 7. Create Report

Report a user or provider for misconduct.

**Endpoint:** `POST /reports/`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "reported": 15,
  "reason": "User was disrespectful and caused property damage during their stay."
}
```

#### Field Validations

| Field      | Type    | Required | Constraints                |
| ---------- | ------- | -------- | -------------------------- |
| `reported` | integer | ✅ Yes    | Must be valid user ID      |
| `reason`   | string  | ✅ Yes    | Cannot be empty/whitespace |

#### Business Rules

- **Users** can only report **Providers**
- **Providers** can only report **Users**
- Cannot report yourself
- Maximum 5 pending reports per user (spam protection)
- Cannot duplicate pending reports against the same user

#### Success Response (201 Created)

```json
{
  "id": 42,
  "reporter": 8,
  "reporter_details": {
    "id": 8,
    "email": "provider@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "account_type": "PROVIDER"
  },
  "reported": 15,
  "reported_details": {
    "id": 15,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "account_type": "USER"
  },
  "reason": "User was disrespectful and caused property damage.",
  "status": "PENDING",
  "admin_notes": null,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

#### Error Responses

**Wrong Account Type (400)**

```json
{
  "reported": [
    "Users can only report providers. The user you are trying to report has account type 'USER'."
  ]
}
```

**Duplicate Report (400)**

```json
{
  "non_field_errors": [
    "You already have a pending report against this user (Report ID: 42). Please wait for it to be processed."
  ]
}
```

**Spam Protection (400)**

```json
{
  "non_field_errors": [
    "You have reached the maximum limit of pending reports (5). Please wait for your existing reports to be processed."
  ]
}
```

**Self-Report (400)**

```json
{
  "reported": ["You cannot report yourself."]
}
```

---

### 8. List Reports (Admin Only)

Get a list of all reports.

**Endpoint:** `GET /reports/`  
**Authentication:** Required (Admin only)  
**Query Parameters:**

| Parameter                | Type    | Description                        |
| ------------------------ | ------- | ---------------------------------- |
| `status`                 | string  | "PENDING", "RESOLVED", "DISMISSED" |
| `reporter`               | integer | Filter by reporter user ID         |
| `reported`               | integer | Filter by reported user ID         |
| `reported__account_type` | string  | "USER" or "PROVIDER"               |
| `search`                 | string  | Search in reason and names         |

#### Success Response (200 OK)

```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 42,
      "reporter": 8,
      "reported": 15,
      "reason": "User was disrespectful.",
      "status": "PENDING",
      "admin_notes": null,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### 9. Update Report Status (Admin Only)

Update a report's status and add admin notes.

**Endpoint:** `PATCH /reports/{id}/`  
**Authentication:** Required (Admin only)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "status": "RESOLVED",
  "admin_notes": "User has been warned and issue has been addressed."
}
```

#### Field Options

| Field         | Type   | Options                            |
| ------------- | ------ | ---------------------------------- |
| `status`      | string | "PENDING", "RESOLVED", "DISMISSED" |
| `admin_notes` | string | Any text                           |

#### Success Response (200 OK)

```json
{
  "id": 42,
  "status": "RESOLVED",
  "admin_notes": "User has been warned and issue has been addressed.",
  "updated_at": "2026-01-15T15:00:00Z"
}
```

---

## Wishlist

### 10. List Wishlist

Get the current user's wishlisted listings.

**Endpoint:** `GET /wishlist/`  
**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 8,
      "listing": 12,
      "listing_details": {
        "id": 12,
        "title": "Cozy Beach Bungalow",
        "listing_type": "HOTEL_ROOM",
        "price": "150.00",
        "cover_image": "/media/listing_covers/bungalow.jpg",
        "location_text": "Maldives, Beach Resort",
        "average_rating": 4.8,
        "is_active": true
      },
      "created_at": "2026-01-10T10:30:00Z"
    }
  ]
}
```

---

### 11. Toggle Wishlist

Add or remove a listing from wishlist (smart toggle).

**Endpoint:** `POST /wishlist/toggle/`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "listing": 12
}
```

#### Behavior

- If listing is **not** in wishlist → **Adds** it
- If listing is **already** in wishlist → **Removes** it

#### Success Response - Added (201 Created)

```json
{
  "message": "Added to wishlist",
  "wishlisted": true,
  "data": {
    "id": 1,
    "user": 8,
    "listing": 12,
    "listing_details": { ... },
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

#### Success Response - Removed (200 OK)

```json
{
  "message": "Removed from wishlist",
  "wishlisted": false
}
```

#### Error Responses

**Missing Listing (400)**

```json
{
  "error": "listing field is required"
}
```

**Listing Not Found (404)**

```json
{
  "error": "Listing with ID 999 does not exist"
}
```

---

## Business Logic

### Review System

#### Review Types

1. **USER_TO_LISTING**
   
   - Written by users about listings/properties
   - Public visibility
   - Affects listing's average rating
   - Displayed on listing pages

2. **PROVIDER_TO_USER**
   
   - Written by providers about guests
   - Admin-only visibility (privacy protection)
   - Affects user's guest rating
   - Helps providers assess potential guests

#### Review Workflow

```
User Completes Booking
        ↓
User/Provider Can Create Review
        ↓
    Validation
        ↓
Review Created & Rating Updated
        ↓
Can Edit/Delete Own Review
```

#### Rating Calculation

- Reviews automatically update `average_rating` on User/Listing models
- Calculated via Django signals on review create/update/delete
- Displayed on listing cards and user profiles (for providers)

### Report System

#### Report Flow

```
User/Provider Creates Report
        ↓
  Spam Check (max 5 pending)
        ↓
  Duplicate Check
        ↓
    Status: PENDING
        ↓
Admin Reviews Report
        ↓
Status: RESOLVED or DISMISSED
```

#### Account Type Restrictions

| Reporter | Can Report |
| -------- | ---------- |
| USER     | PROVIDER   |
| PROVIDER | USER       |
| ADMIN    | N/A        |

### Wishlist System

- Each user has a personal wishlist
- Unlimited listings can be wishlisted
- Duplicate prevention (unique constraint)
- Toggle endpoint for easy add/remove
- Wishlist status included in listing API responses when user is authenticated

---

## Common Errors

### Authentication Errors

**401 Unauthorized**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden**

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Validation Errors

**400 Bad Request - Field Errors**

```json
{
  "rating": ["Rating must be between 1 and 5."],
  "comment": ["Comment must be at least 10 characters long."]
}
```

**400 Bad Request - Non-Field Errors**

```json
{
  "non_field_errors": ["You have already submitted a review for this booking."]
}
```

### Not Found Errors

**404 Not Found**

```json
{
  "detail": "Not found."
}
```

### Server Errors

**500 Internal Server Error**

If you encounter a 500 error, it indicates a server-side issue. All validation errors should return 400 status codes. If you see 500, contact the development team.

---

**End of Documentation**

For issues or questions, contact the development team.
