# RizerVitoo Mobile API Documentation

**Base URL:** `https://api.rezervitoo.com/api/v1/`

**Version:** 1.0  
**Last Updated:** March 12, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Methods](#authentication-methods)
3. [Endpoints](#endpoints)
   - [Google OAuth Login](#1-google-oauth-login)
   - [Email/Password Registration](#2-emailpassword-registration)
   - [Email/Password Login](#3-emailpassword-login)
   - [Send Email Verification](#4-send-email-verification)
   - [Verify Email](#5-verify-email)
   - [FCM Device Registration](#6-fcm-device-registration)
4. [Push Notifications (FCM)](#push-notifications-fcm)
5. [Integration Guide](#integration-guide)
   - [Google OAuth Setup](#1-google-oauth-setup)
   - [Email Verification Condition](#2-email-verification-condition)
6. [Common Errors](#common-errors)

---

## Overview

RizerVitoo mobile apps support **three authentication methods**:

1. **Google OAuth** - One-tap sign-in (auto email-verified)
2. **Email/Password** - Traditional registration (requires email verification)
3. **JWT Tokens** - Secure API access after authentication

### Authentication Flow Comparison

| Feature              | Google OAuth                  | Email/Password            |
| -------------------- | ----------------------------- | ------------------------- |
| **Registration**     | Automatic on first login      | Manual via `/register/`   |
| **Email Verified**   | ✅ Automatic                  | ❌ Manual (requires link) |
| **Account Creation** | Instant                       | Requires verification     |
| **Best For**         | Quick onboarding, social auth | Custom email control      |

---

## Authentication Methods

### JWT Token Usage

After successful authentication (Google or email/password), you receive:

```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Access Token:** Use for all API requests (expires in ~60 minutes)  
**Refresh Token:** Use to get new access tokens (expires in ~30 days)

### Authentication Header

Include in all protected API requests:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Google OAuth Login

Authenticate or register user using Google Sign-In.

**Endpoint:** `POST /users/login/google/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

**For User App (Guests/Customers):**

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "account_type": "USER"
}
```

**For Provider App (Hosts/Hotels/Hostels/Agencies):**

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
| `account_type` | string | ✅ Yes         | `"USER"`, `"PROVIDER"`                         |
| `role`         | string | ⚠️ If PROVIDER | `"HOST"`, `"HOTEL"`, `"HOSTEL"`, or `"AGENCY"` |

**⚠️ Security Notes:**

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
    "pfp": "https://lh3.googleusercontent.com/..."
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "created": true,
  "message": "Account created successfully"
}
```

#### Error Response (400 Bad Request)

```json
{
  "error": "Invalid Google token"
}
```

---

### 2. Email/Password Registration

Register a new user with email and password (requires email verification).

**Endpoint:** `POST /users/register/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "account_type": "USER"
}
```

#### Field Validations

| Field          | Type   | Required | Constraints                      |
| -------------- | ------ | -------- | -------------------------------- |
| `email`        | string | ✅ Yes   | Valid email, unique              |
| `password`     | string | ✅ Yes   | Min 8 characters                 |
| `first_name`   | string | ✅ Yes   | Cannot be empty/whitespace       |
| `last_name`    | string | ✅ Yes   | Cannot be empty/whitespace       |
| `phone`        | string | ✅ Yes   | 10 digits (including leading 0)  |
| `account_type` | string | ✅ Yes   | Must be `"USER"` for mobile apps |

#### Success Response (201 Created)

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "email_verified": false,
  "account_type": "USER",
  "verification_status": "UNVERIFIED",
  "message": "Registration successful. Please verify your email."
}
```

**⚠️ Important:** User must verify email before they can log in.

#### Error Response (400 Bad Request)

```json
{
  "email": ["User with this email already exists."],
  "password": ["This field must be at least 8 characters."]
}
```

---

### 3. Email/Password Login

Log in with email and password to receive JWT tokens.

**Endpoint:** `POST /users/login/`  
**Authentication:** None required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Success Response (200 OK)

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Error Response — Unverified Email (400 Bad Request)

> Returned when the user has not yet clicked the verification link in their email.

```json
{
  "error": "Please verify your email before logging in."
}
```

**⚠️ Important:** Email/password login is **blocked** until the user verifies their email. Direct the user to check their inbox and click the verification link, or use [Send Email Verification](#4-send-email-verification) to resend it.

#### Error Response — Invalid Credentials (401 Unauthorized)

```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### 4. Send Email Verification

Send or resend email verification link to user.

**Endpoint:** `POST /users/verify-email/send/`  
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

> If authenticated, backend uses `request.user.email` automatically.

#### Success Response (200 OK)

```json
{
  "message": "Verification email sent successfully"
}
```

#### Email Format

User receives a branded HTML email with a verification button. When the user taps the button, their browser opens:

```
https://api.rezervitoo.com/api/v1/users/verify-email?token=InVzZXJAZXhhbXBsZS5jb20i:1sABCD:xyz123...
```

This URL is a **GET request handled by the backend** — it verifies the token and returns a styled HTML result page (success or error). The user is then prompted to open the app and log in. The token expires in **24 hours**.

---

### 5. Verify Email

Verifies a user's email address. There are **two ways** this endpoint is used:

#### Method A — Browser (from email link tap)

When the user taps the verification button in the email, their browser makes a `GET` request. The backend verifies the token and returns a **styled HTML page** (success or error). No action needed from the app — the user sees a result page and is told to open the app.

**Endpoint:** `GET /users/verify-email/?token=<token>`  
**Authentication:** None required

| Outcome          | What the user sees                                          |
| ---------------- | ----------------------------------------------------------- |
| ✅ Valid token   | Green success page: "Email Verified! Open the app."         |
| ❌ Expired token | Red error page: "This link has expired. Request a new one." |
| ❌ Invalid token | Red error page: "Invalid verification link."                |

#### Method B — App code (programmatic verification)

If your app handles the deep link and extracts the token itself, use `POST` to verify programmatically.

**Endpoint:** `POST /users/verify-email/`  
**Authentication:** None required  
**Content-Type:** `application/json`

##### Request Body

```json
{
  "token": "InVzZXJAZXhhbXBsZS5jb20i:1sABCD:xyz123abc456..."
}
```

##### Fields

| Field   | Type   | Required | Description                               |
| ------- | ------ | -------- | ----------------------------------------- |
| `token` | string | ✅ Yes   | Signed verification token from email link |

##### Success Response (200 OK)

```json
{
  "message": "Email verified successfully",
  "email": "user@example.com"
}
```

##### Error Response (400 Bad Request)

```json
{
  "error": "Invalid or expired token"
}
```

---

### 6. FCM Device Registration

Register mobile device for push notifications.

**Endpoint:** `POST /notifications/fcm/register/`  
**Authentication:** Required (Bearer token)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "registration_token": "fKz0xY1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5",
  "device_name": "iPhone 14 Pro"
}
```

#### Fields

| Field                | Type   | Required | Description                           |
| -------------------- | ------ | -------- | ------------------------------------- |
| `registration_token` | string | ✅ Yes   | FCM token from Firebase SDK           |
| `device_name`        | string | ⚪ No    | Device identifier (e.g., phone model) |

#### Success Response (200 OK)

```json
{
  "message": "FCM device registered successfully",
  "device_id": 1
}
```

#### Error Response (400 Bad Request)

```json
{
  "registration_token": ["This field is required."]
}
```

---

## Push Notifications (FCM)

### Notification Events

Your app will receive push notifications for:

| Event                 | Trigger                      | Data Payload                                     |
| --------------------- | ---------------------------- | ------------------------------------------------ |
| **Booking Created**   | User creates booking         | `booking_id`, `status`, `listing_title`          |
| **Booking Accepted**  | Provider accepts booking     | `booking_id`, `status`, `message`                |
| **Booking Rejected**  | Provider rejects booking     | `booking_id`, `status`, `rejection_reason`       |
| **Booking Completed** | Booking period ends          | `booking_id`, `status`                           |
| **Provider Approved** | Admin approves provider docs | `user_id`, `verification_status`, `account_type` |
| **Provider Rejected** | Admin rejects provider docs  | `user_id`, `verification_status`, `reason`       |

### Notification Format

```json
{
  "notification": {
    "title": "Rizervitoo",
    "body": "Your booking has been accepted!"
  },
  "data": {
    "booking_id": "123",
    "status": "ACCEPTED",
    "listing_title": "Beach House"
  }
}
```

---

## Integration Guide

### 1. Google OAuth Setup

To implement Google OAuth in your mobile app:
1. **Configure Google Sign-In**: Use your platform's Google Sign-In SDK (e.g., `@react-native-google-signin/google-signin`).
2. **Web Client ID**: You must use the **Web Client ID** from the Google Cloud Console in your configuration (not the Android/iOS specific client ID).
3. **Retrieving the Token**: Prompt the user to sign in and extract the `id_token`.
4. **Backend Authentication**: Send this `id_token` to the `POST /users/login/google/` endpoint to authenticate with the backend and receive your API JWT `access` and `refresh` tokens.

### 2. Email Verification Condition

The API strictly enforces email verification for users registered via standard Email/Password method:

1. **Registration**: After calling `POST /users/register/`, explicitly prompt the user to check their email. The API will NOT log them in automatically upon registration.
2. **Login Block**: If a user attempts to log in via `POST /users/login/` without verifying their email, the API returns a `400 Bad Request` with: `{"error": "Please verify your email before logging in."}`.
3. **Handling Unverified Logins**: Your mobile app must intercept this specific 400 error, notify the user, and optionally provide a button to invoke `POST /users/verify-email/send/` to resend the verification link.
4. **Verification Flow**: The email link opens a backend web page that verifies the token. Once verified, the user should be able to successfully log in on the app.

---

## Common Errors

### Google OAuth Errors

| Error                    | Cause                                | Solution                                  |
| ------------------------ | ------------------------------------ | ----------------------------------------- |
| `Invalid Google token`   | Expired or tampered ID token         | Request new token from Google Sign-In SDK |
| `Google API unreachable` | Backend can't verify with Google API | Check backend internet connection         |

### Email Verification Errors

| Error                       | Cause                     | Solution                       |
| --------------------------- | ------------------------- | ------------------------------ |
| `Invalid or expired token`  | Token older than 24 hours | Request new verification email |
| `Email is already verified` | User already verified     | Proceed to login               |
| `User does not exist`       | Email not registered      | Register account first         |

### FCM Errors

| Error                               | Cause                     | Solution                             |
| ----------------------------------- | ------------------------- | ------------------------------------ |
| `registration_token is required`    | Missing FCM token         | Get token from Firebase SDK first    |
| `Unauthorized`                      | Invalid/missing JWT token | Login and include Bearer token       |
| `FCM token invalid and deactivated` | Firebase rejected token   | Token will auto-refresh, re-register |

### Authentication Errors

| Status | Error                                         | Cause                           | Solution                                              |
| ------ | --------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| 400    | `Please verify your email before logging in.` | Email not verified              | Resend verification email and ask user to check inbox |
| 401    | `Given token not valid for any...`            | Expired or invalid access token | Refresh token or re-login                             |
| 400    | `Email already exists`                        | Duplicate registration          | Use login instead                                     |
| 400    | `Password must be at least 8...`              | Weak password                   | Use stronger password                                 |

---

## Firebase Configuration Files

Your project includes:

- `google-services.json` - Android Firebase config
- `GoogleService-Info.plist` - iOS Firebase config

**Add to mobile app:**

**Android:** Place in `android/app/google-services.json`
**iOS:** Place in `ios/GoogleService-Info.plist`

---

## Security Best Practices

1. **Never hardcode API URLs** - Use environment variables
2. **Store tokens securely** - Use `@react-native-async-storage/async-storage` or encrypted storage
3. **Validate ID tokens** - Never trust tokens without backend verification
4. **Specify correct account_type** - User app must send `USER`, Provider app must send `PROVIDER` + role
5. **Never try to create ADMIN accounts** - Mobile apps cannot create admin accounts (security restriction)
6. **Don't allow account_type changes** - Backend prevents privilege escalation by rejecting account type changes for existing users
7. **Handle token refresh** - Implement automatic refresh before expiry
8. **Clear tokens on logout** - Remove all stored auth data
9. **Use HTTPS in production** - Never send tokens over HTTP
