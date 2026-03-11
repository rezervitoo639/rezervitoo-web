# RizerVitoo Auth API Documentation

**Base URL:** `http://api.rezervitoo.com/api/v1/users/`

**Version:** 1.2  
**Last Updated:** December 28, 2025

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
   - [Get Current User](#7-get-current-user-me)
   - [Update Profile / Submit Documents](#8-update-profile--submit-documents)
4. [Common Errors](#common-errors)
5. [User Roles](#user-roles)

---

## Overview

RizerVitoo uses **JWT (JSON Web Tokens)** for authentication. After successful login, you receive:

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
| `email`        | string | ✅ Yes    | Valid email format, unique    |
| `password`     | string | ✅ Yes    | Min 8 characters              |
| `first_name`   | string | ✅ Yes    | Cannot be empty/whitespace    |
| `last_name`    | string | ✅ Yes    | Cannot be empty/whitespace    |
| `phone`        | string | ✅ Yes    | Must be 10 digits including 0 |
| `account_type` | string | ✅ Yes    | Must be "USER"                |

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

**One-time setup** to create the staff admin account. Returns 403 if admin already exists.

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

#### Error Response (403 Forbidden)

```json
{
  "error": "Staff admin account already exists. Registration disabled."
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

### 7. Get Current User (Me)

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

### 8. Update Profile / Submit Documents

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
  "error": "Staff admin account already exists. Registration disabled."
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

- Email Verification

- Reset password

- Edit profile

## Change log

- added account_type field.

- role will now be null for user and admin

---

**End of Authentication API Documentation**
