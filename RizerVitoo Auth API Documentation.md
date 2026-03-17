# RezerVitoo Auth API Documentation

**Base URL:** `https://api.rezervitoo.com/api/v1/users/`

**Version:** 1.4  
**Last Updated:** March 13, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Endpoints](#endpoints)
   - [User Registration](#1-user-registration)
   - [Provider Registration](#2-provider-registration)
   - [Admin Setup](#3-admin-setup)
   - [Login](#4-login)
   - [Token Refresh](#5-token-refresh)
   - [Logout](#6-logout)
   - [Google Login](#7-google-login)
   - [Send Verification Email](#8-send-verification-email)
   - [Verify Email](#9-verify-email)
   - [Password Reset Request](#10-password-reset-request)
   - [Password Reset Confirm](#11-password-reset-confirm)
   - [Get Current User](#12-get-current-user-me)
   - [Update Profile / Submit Documents](#13-update-profile--submit-documents)
   - [Get Provider Profiles](#14-get-provider-profiles-public)
   - [Get Single Provider](#15-get-single-provider-public)
4. [Common Errors](#common-errors)
5. [User Roles](#user-roles)

---

## Overview

RezerVitoo uses **JWT (JSON Web Tokens)** for authentication. After successful login, you receive:

- `access` token (short-lived, ~60 minutes) - Use for API requests
- `refresh` token (long-lived, ~30 days) - Use to get new access tokens

### Authentication Header Format

For protected endpoints, include the access token in headers:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. User Registration

Register a normal user (guest/customer).

**Endpoint:** `POST /register/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "123456789",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "account_type": "USER"
}
```

#### Field Validations

| Field          | Type   | Required | Constraints                   |
| -------------- | ------ | -------- | ----------------------------- |
| `email`        | string | ✅ Yes   | Valid email format, unique    |
| `password`     | string | ✅ Yes   | Min 8 characters              |
| `first_name`   | string | ✅ Yes   | Cannot be empty/whitespace    |
| `last_name`    | string | ✅ Yes   | Cannot be empty/whitespace    |
| `phone`        | string | ✅ Yes   | Must be 10 digits including 0 |
| `account_type` | string | ✅ Yes   | Must be "USER"                |

#### Success Response (201 Created)

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "role": null,
  "account_type": "USER",
  "verification_status": "VERIFIED",
  "email_verified": false,
  "pfp": null,
  "created_at": "2025-12-21T10:30:00Z"
}
```

#### Error Response (400 Bad Request)

```json
{
  "email": ["user with this email address already exists."],
  "password": ["This field may not be blank."]
}
```

---

### 2. Provider Registration

Register a service provider (Host, Hotel, Hostel, or Agency).

**Endpoint:** `POST /register-provider/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body - Host

```json
{
  "email": "host@example.com",
  "password": "123456789",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "1234567890",
  "account_type": "PROVIDER",
  "role": "HOST",
  "host_type": "OWNER"
}
```

#### Request Body - Hotel

```json
{
  "email": "hotel@example.com",
  "password": "123456789",
  "first_name": "Hotel",
  "last_name": "Manager",
  "phone": "1234567890",
  "account_type": "PROVIDER",
  "role": "HOTEL",
  "hotel_name": "Grand Plaza Hotel",
  "stars": 5
}
```

#### Request Body - Hostel

```json
{
  "email": "hostel@example.com",
  "password": "123456789",
  "first_name": "Hostel",
  "last_name": "Manager",
  "phone": "1234567890",
  "account_type": "PROVIDER",
  "role": "HOSTEL",
  "hostel_name": "Backpackers Paradise",
  "gender_restriction": "Male"
}
```

#### Request Body - Agency

```json
{
  "email": "agency@example.com",
  "password": "123456789",
  "first_name": "Agency",
  "last_name": "Manager",
  "phone": "1234567890",
  "account_type": "PROVIDER",
  "role": "AGENCY",
  "agency_name": "Travel World"
}
```

#### Role-Specific Fields

| Role     | Additional Required Fields                         |
| -------- | -------------------------------------------------- |
| `HOST`   | `host_type` (OWNER or AGENT)                       |
| `HOTEL`  | `hotel_name`, `stars` (1-5)                        |
| `HOSTEL` | `hostel_name`, `gender_restriction` (MALE, FEMALE) |
| `AGENCY` | `agency_name`                                      |

#### Success Response (201 Created)

```json
{
  "id": 2,
  "email": "host@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "1234567890",
  "role": "HOST",
  "account_type": "PROVIDER",
  "verification_status": "UNVERIFIED",
  "email_verified": false,
  "pfp": null,
  "created_at": "2025-12-21T10:35:00Z"
}
```

#### Error Response (400 Bad Request)

```json
{
  "role": ["\"INVALID\" is not a valid choice."],
  "hotel_name": ["This field is required for HOTEL role."]
}
```

---

### 3. Admin Setup

Create a staff admin account.

**Endpoint:** `POST /admin-setup/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "admin@riservitoo.com",
  "password": "123456789",
  "first_name": "Admin",
  "last_name": "User",
  "phone": "1234567890",
  "account_type": "ADMIN"
}
```

#### Success Response (201 Created)

```json
{
  "id": 3,
  "email": "admin@riservitoo.com",
  "first_name": "Admin",
  "last_name": "User",
  "phone": "1234567890",
  "role": null,
  "account_type": "ADMIN",
  "verification_status": "UNVERIFIED",
  "email_verified": false,
  "pfp": null,
  "created_at": "2025-12-21T10:40:00Z"
}
```

---

### 4. Login

Obtain JWT access and refresh tokens.

**Endpoint:** `POST /login/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "123456789"
}
```

#### Success Response (200 OK)

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Error Response (401 Unauthorized)

```json
{
  "detail": "No active account found with the given credentials"
}
```

#### Common Login Errors

- **Wrong email/password:** 401 with message above
- **Empty fields:** 400 Bad Request
- **Invalid JSON format:** 400 Bad Request

---

### 5. Token Refresh

Get a new access token using the refresh token.

**Endpoint:** `POST /refresh/`  
**Authentication:** None required (but you need a valid refresh token)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Success Response (200 OK)

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Error Response (401 Unauthorized)

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

### 6. Logout

Blacklist the refresh token to log out the user.

**Endpoint:** `POST /logout/`  
**Authentication:** Required (Bearer token)  
**Content-Type:** `application/json`  
**Headers:**

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Success Response (205 Reset Content)

```json
{
  "message": "Logout successful."
}
```

#### Error Responses

**Missing refresh token (400 Bad Request):**

```json
{
  "error": "Refresh token is required."
}
```

**Invalid/Expired token (400 Bad Request):**

```json
{
  "error": "Invalid or expired token."
}
```

**Not authenticated (401 Unauthorized):**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### Important Notes

- After successful logout, the refresh token is **blacklisted** and cannot be used again
- The user must login again to get new tokens
- Both the access token (in header) and refresh token (in body) are required
- Client should delete both tokens from storage after successful logout

---

### 7. Google Login

Authenticate or register a user using Google OAuth 2.0. Returns JWT tokens and user data.

**Endpoint:** `POST /login/google/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

**User App (Guests / Customers):**

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "account_type": "USER"
}
```

**Provider App:**

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "account_type": "PROVIDER",
  "role": "HOST"
}
```

#### Fields

| Field          | Type   | Required       | Description                                    |
| -------------- | ------ | -------------- | ---------------------------------------------- |
| `id_token`     | string | ✅ Yes         | Google OAuth ID token from Google Sign-In SDK  |
| `account_type` | string | ✅ Yes         | `"USER"`, `"PROVIDER"`, or `"ADMIN"`           |
| `role`         | string | ⚠️ If PROVIDER | `"HOST"`, `"HOTEL"`, `"HOSTEL"`, or `"AGENCY"` |

#### **Security Notes:**

- **All apps must send `account_type` explicitly**
- **User App:** `account_type: "USER"`
- **Provider App:** `account_type: "PROVIDER"` + `role`
- Cannot change account_type for existing users (prevents privilege escalation)

#### Success Response (200 OK)

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": true,
    "account_type": "USER",
    "role": null,
    "pfp": "https://lh3.googleusercontent.com/...",
    "verification_status": "UNVERIFIED"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "created": true,
  "message": "Login successful"
}
```

| `created` value | Meaning                                      |
| --------------- | -------------------------------------------- |
| `true`          | New account was created for this Google user |
| `false`         | Existing account found and logged in         |

#### Error Responses (400 Bad Request)

```json
{ "error": "Invalid Google token" }
{ "error": "This Google account is not registered as an admin user. Please use a registered admin email." }
{ "error": "account_type is required. Must be \"USER\", \"PROVIDER\", or \"ADMIN\"." }
{ "error": "Provider accounts require a valid role. Must be one of: HOST, HOTEL, HOSTEL, AGENCY" }
```

---

### 8. Send Verification Email

Send or resend an email verification link to the user's email address.

**Endpoint:** `POST /verify-email/send/`  
**Content-Type:** `application/json`

#### Request Body (Unauthenticated)

```json
{
  "email": "user@example.com"
}
```

#### Request Body (Authenticated)

```json
{}
```

> If the user is authenticated, their email is used automatically — no body needed.

#### Success Responses (200 OK)

```json
{ "message": "Verification email sent successfully" }
```

If the email is not registered (still 200, avoids enumeration):

```json
{ "message": "If this email is registered, a verification link has been sent." }
```

If already verified:

```json
{ "message": "Email is already verified" }
```

#### Notes

- Verification link expires after **24 hours**
- Link format: `https://rezervitoo.com/verify-email?token=<signed_token>`

---

### 9. Verify Email

Verify the user's email address using the signed token from the verification link.

**Endpoint:** `POST /verify-email/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "token": "InVzZXJAZXhhbXBsZS5jb20i:1sABCD:xyz123abc456..."
}
```

#### Fields

| Field   | Type   | Required | Description                               |
| ------- | ------ | -------- | ----------------------------------------- |
| `token` | string | ✅ Yes   | Signed verification token from email link |

#### Success Response (200 OK)

```json
{
  "message": "Email verified successfully. You can now log in.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "email_verified": true
  }
}
```

Sets `email_verified = true` and `is_active = true` on the user account.

#### Error Response (400 Bad Request)

```json
{
  "error": "Verification link has expired. Please request a new one."
}
```

#### Browser vs App Flow

- **Browser (GET):** When the user clicks the email link, the browser opens `/verify-email/?token=...`. The backend returns an **HTML confirmation page** — no JSON handling needed.
- **App (POST):** The app extracts the token and sends it here to receive a JSON response.

---

### 10. Password Reset Request

Send a password reset email. Always returns a generic message to prevent email enumeration.

**Endpoint:** `POST /password-reset/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK — always)

```json
{
  "message": "If this email is registered, a password reset link has been sent."
}
```

The reset link is valid for **1 hour**.

---

### 11. Password Reset Confirm

Set a new password using the token received by email.

**Endpoint:** `POST /password-reset/confirm/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "token": "InVzZXJAZXhhbXBsZS5jb20i:1sABCD:xyz123...",
  "new_password": "NewSecurePass123"
}
```

#### Field Validations

| Field          | Type   | Required | Constraints      |
| -------------- | ------ | -------- | ---------------- |
| `token`        | string | ✅       | From reset email |
| `new_password` | string | ✅       | Min 8 characters |

#### Success Response (200 OK)

```json
{
  "message": "Password reset successfully."
}
```

#### Error Responses

```json
{ "error": "Password reset link has expired. Please request a new one." }
{ "error": "Invalid password reset token." }
{ "new_password": ["Ensure this field has at least 8 characters."] }
```

---

### 12. Get Current User (Me)

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /me/`  
**Authentication:** Required (Bearer token)  
**Headers:**

```
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "role": null,
  "account_type": "USER",
  "verification_status": "VERIFIED",
  "email_verified": false,
  "pfp": null,
  "created_at": "2025-12-21T10:30:00Z",
  "updated_at": "2025-12-21T10:30:00Z"
}
```

#### Error Response (401 Unauthorized)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 13. Update Profile / Submit Documents

Update user profile fields or submit verification documents (for providers). Allows **Progressive Profiling**: Providers verify their accounts by submitting sensitive documents in this step.

**Endpoint:** `PATCH /me/`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data` (if uploading files) or `application/json`

#### Request Body - Host Document Submission

**Constraints:**

- `national_id`: 18 digits exactly. Cannot be blank.
- `national_id_recto/verso`: Mandatory images.

```json
{
  "national_id": "123456789012345678",
  "national_id_recto": (file),
  "national_id_verso": (file),
  "host_type": "OWNER"
}
```

#### Request Body - Business Document Submission (Hotel/Hostel/Agency)

**Constraints:**

- `nif`: 15 digits exactly. Cannot be blank.
- `nrc`: 12-15 alphanumeric characters. Cannot be blank.
- `nrc_image/nif_image`: Mandatory images.

```json
{
  "nrc": "123456789012AAA",
  "nif": "123456789012345",
  "nrc_image": (file),
  "nif_image": (file)
}
```

#### Success Response (200 OK)

Returns the updated user object including profile fields. **Note:** If all required documents are submitted, `verification_status` automatically changes from `UNVERIFIED` to `PENDING`.

```json
{
  "id": 2,
  "email": "host@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "1234567890",
  "role": "HOST",
  "account_type": "PROVIDER",
  "verification_status": "PENDING",
  "national_id": "123456789012345678",
  "national_id_recto": "http://.../img.jpg",
  "national_id_verso": "http://.../img.jpg",
  "host_type": "OWNER"
}
```

---

### 14. Get Provider Profiles (Public)

Get a list of verified provider profiles. This endpoint is **publicly accessible** (no authentication required) and allows guests and users to browse available service providers.

**Endpoint:** `GET /`  
**Authentication:** None required (public access)  
**Content-Type:** `application/json`

#### Access Control

- **Guests/Unauthenticated users**: Can view only verified, active providers
- **Regular users (USER account type)**: Can view only verified, active providers
- **Admin users**: Can view all users (providers and regular users) with full details

#### Query Parameters

| Parameter   | Type   | Description                | Example Values                      |
| ----------- | ------ | -------------------------- | ----------------------------------- |
| `role`      | string | Filter by provider role    | `HOST`, `HOTEL`, `HOSTEL`, `AGENCY` |
| `search`    | string | Search by name or email    | `john`, `hotel`                     |
| `ordering`  | string | Order results              | `created_at`, `-created_at`         |
| `page`      | number | Page number for pagination | `1`, `2`, `3`                       |
| `page_size` | number | Number of results per page | `10`, `20`, `50`                    |

#### Example Request

```bash
GET /api/v1/users/?role=HOST&page=1&page_size=10
```

#### Success Response (200 OK)

```json
{
  "count": 25,
  "next": "http://localhost:8000/api/v1/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 5,
      "first_name": "Ahmed",
      "last_name": "Benali",
      "email": "ahmed@example.com",
      "pfp": "http://localhost:8000/media/profile_pics/ahmed.jpg",
      "phone": "0555123456",
      "account_type": "PROVIDER",
      "role": "HOST",
      "verification_status": "VERIFIED",
      "hotel_name": null,
      "hotel_stars": null,
      "hostel_name": null,
      "agency_name": null,
      "host_type": "OWNER",
      "total_listings": 3,
      "average_rating": "4.50",
      "review_count": 12,
      "created_at": "2025-11-15T10:30:00Z"
    },
    {
      "id": 8,
      "first_name": "Grand",
      "last_name": "Hotel",
      "email": "contact@grandhotel.dz",
      "pfp": "http://localhost:8000/media/profile_pics/grand.jpg",
      "phone": "0555987654",
      "account_type": "PROVIDER",
      "role": "HOTEL",
      "verification_status": "VERIFIED",
      "hotel_name": "Grand Hotel Algiers",
      "hotel_stars": 5,
      "hostel_name": null,
      "agency_name": null,
      "host_type": null,
      "total_listings": 15,
      "average_rating": "4.80",
      "review_count": 45,
      "created_at": "2025-10-20T14:22:00Z"
    }
  ]
}
```

#### Notes

- Non-admin users will **only** see providers with `verification_status: "VERIFIED"` and `is_active: true`
- Admin users see all users and get additional fields (`email_verified`, `is_active`, `updated_at`, `last_login`, `total_bookings`, `provider_total_bookings`, `rating`)
- Results are paginated (default: 10 per page)
- Personal documents (national_id, nrc_image, etc.) are **never** exposed in public responses
- `average_rating`: Average rating across all provider's listings (null if no ratings)
- `review_count`: Total number of reviews across all provider's listings
- `total_listings`: Number of listings created by this provider

---

### 15. Get Single Provider (Public)

Get detailed information about a specific provider. This endpoint is **publicly accessible**.

**Endpoint:** `GET /{id}/`  
**Authentication:** None required (public access)  
**Content-Type:** `application/json`

#### Access Control

- **Guests/Regular users**: Can view only verified, active providers
- **Admin users**: Can view any user with full details

#### Example Request

```bash
GET /api/v1/users/5/
```

#### Success Response (200 OK)

```json
{
  "id": 5,
  "first_name": "Ahmed",
  "last_name": "Benali",
  "email": "ahmed@example.com",
  "pfp": "http://localhost:8000/media/profile_pics/ahmed.jpg",
  "phone": "0555123456",
  "account_type": "PROVIDER",
  "role": "HOST",
  "verification_status": "VERIFIED",
  "hotel_name": null,
  "hotel_stars": null,
  "hostel_name": null,
  "agency_name": null,
  "host_type": "OWNER",
  "total_listings": 3,
  "average_rating": "4.50",
  "review_count": 12,
  "created_at": "2025-11-15T10:30:00Z"
}
```

#### Error Response (404 Not Found)

If the provider doesn't exist or is not accessible (not verified/active for non-admin users):

```json
{
  "detail": "Not found."
}
```

---

## Common Errors

### 400 Bad Request

Invalid input data (validation errors).

```json
{
  "email": ["This field may not be blank."],
  "password": ["Ensure this field has at least 8 characters."]
}
```

### 401 Unauthorized

Missing, invalid, or expired authentication token.

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

### 403 Forbidden

Insufficient permissions.

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found

Resource not found or not accessible.

```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error

Server error - Contact backend team.

```json
{
  "detail": "Internal server error"
}
```

---

## Account Types & Roles

The system distinguishes between **Account Types** (permissions level) and **Provider Roles** (business type).

### Account Types

| Type         | Code       | Description                            |
| ------------ | ---------- | -------------------------------------- |
| **User**     | `USER`     | Normal customer (can book listings)    |
| **Provider** | `PROVIDER` | Service provider (can create listings) |
| **Admin**    | `ADMIN`    | System administrator                   |

### Provider Roles

Only applicable when `account_type` is `PROVIDER`.

| Role       | Code     | Description                     |
| ---------- | -------- | ------------------------------- |
| **Host**   | `HOST`   | Individual property owner/agent |
| **Hotel**  | `HOTEL`  | Hotel business account          |
| **Hostel** | `HOSTEL` | Hostel business account         |
| **Agency** | `AGENCY` | Travel agency account           |

---

## Testing Credentials

For development/testing, you can use these test accounts:

| Email                | Password      | Account Type | Role   |
| -------------------- | ------------- | ------------ | ------ |
| `user@example.com`   | `password123` | USER         | -      |
| `host@example.com`   | `password123` | PROVIDER     | HOST   |
| `hotel@example.com`  | `password123` | PROVIDER     | HOTEL  |
| `hostel@example.com` | `password123` | PROVIDER     | HOSTEL |
| `agency@example.com` | `password123` | PROVIDER     | AGENCY |
| `admin@example.com`  | `password123` | ADMIN        | -      |

---

## Future (FL MVP if possible)

- Edit profile

---

## Change Log

### Version 1.4 (March 13, 2026)

- **Added Google Login endpoint** (`POST /login/google/`)
  - Supports USER, PROVIDER, and ADMIN account types
  - Google-authenticated users are automatically email-verified
- **Added email verification endpoints** (`POST /verify-email/send/`, `POST /verify-email/`)
  - Send/resend verification link (24-hour expiry)
  - Browser click returns HTML page; app POST returns JSON
- **Added password reset endpoints** (`POST /password-reset/`, `POST /password-reset/confirm/`)
  - Secure HMAC-signed token, 1-hour expiry
- **Removed admin account creation limit** — multiple admins can be created via `/admin-setup/`
- **Renumbered** sections 7–15 to accommodate new endpoints

### Version 1.3 (January 17, 2026)

- **Added public provider profiles endpoint** (`GET /users/`)
  - Guests and regular users can now browse verified providers
  - Non-admin users see only verified, active providers
  - Admin users retain full access to all users
- **Added single provider detail endpoint** (`GET /users/{id}/`)
  - Public access to individual provider profiles
  - Sensitive documents never exposed in public responses

### Version 1.2 (December 28, 2025)

- Added `account_type` field
- `role` will now be null for user and admin

---

**End of Authentication API Documentation**