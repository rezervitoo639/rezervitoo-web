# RizerVitoo Web - Project Setup & Documentation

**Last Updated:** April 2026
**Status:** Active Development
**Tech Stack:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Key Features](#key-features)
4. [API Integration](#api-integration)
5. [Authentication](#authentication)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server (with hot reload)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

**Development URL:** `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── pages/                    # Page components
│   ├── ProviderProfile.tsx   # Provider profile with avatar editing
│   ├── UserProfile.tsx       # User profile page
│   ├── Notifications.tsx     # Full notifications page
│   ├── MyBookings.tsx        # Provider booking management
│   └── ...
├── components/               # Reusable UI components
│   ├── DashboardLayout.tsx   # Main dashboard wrapper
│   ├── NotificationDropdown.tsx  # Bell icon notifications
│   ├── ImageCropper.tsx      # Image crop dialog
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api/                  # API service layer
│   │   ├── authService.ts    # Authentication & profile
│   │   ├── notificationService.ts
│   │   ├── listingService.ts
│   │   ├── bookingService.ts
│   │   └── config.ts         # API base URL
│   ├── utils/
│   │   ├── imageUtils.ts     # Image compression
│   │   └── ...
├── i18n/                     # Internationalization
│   └── LanguageContext.tsx   # Multi-language support (EN/FR/AR)
└── types/                    # TypeScript type definitions
```

---

## ✨ Key Features

### Authentication
- Email/password login
- Google OAuth integration
- JWT token management with refresh logic
- Role-based access (USER, PROVIDER, ADMIN)

### Provider System
- **Registration:** Providers register and wait for admin approval
- **Profile:** Edit name, phone, avatar (no documents required)
- **Verification Status:** PENDING → VERIFIED (after admin approval)
- **Listings:** Create and manage bookings after approval

### Notifications
- Real-time notification delivery
- Token refresh on expiration (automatic)
- Polling: Updates every 2 minutes
- Mark as read / Delete functionality

### Image Handling
- Avatar cropping with preview
- Automatic image compression (max 800px width)
- Cache-busting on updates to show fresh images

---

## 🔗 API Integration

### Authentication Service (`authService.ts`)

```typescript
// Login
const tokens = await authService.login({ email, password });

// Get current user
const user = await authService.fetchMe();

// Update profile (with avatar)
const formData = new FormData();
formData.append("first_name", "John");
formData.append("pfp", imageBlob, "avatar.jpg");
const updated = await authService.updateProfile(formData);

// Token refresh
const newAccessToken = await authService.refresh();

// Logout
await authService.logout();
```

### Notification Service (`notificationService.ts`)

```typescript
// Fetch notifications with auto-refresh on token expiry
const { count, results } = await notificationService.fetchNotifications({
  page_size: 5
});

// Mark single notification as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Delete notification
await notificationService.deleteNotification(notificationId);
```

**Note:** All notification methods automatically handle token refresh if access token expires.

### API Base URL

Set via environment variable:
```
VITE_API_BASE_URL=https://api.rezervitoo.com
```

Default: `https://api.rezervitoo.com`

---

## 🔐 Authentication

### Session Management
- **Storage:** SessionStorage (cleared on browser close)
- **Tokens:** Access token (short-lived) + Refresh token (long-lived)
- **Headers:** `Authorization: Bearer <access_token>`

### Auto-Refresh Logic
When a request returns 401 (token expired):
1. Service calls `authService.refresh()`
2. Gets new access token using refresh token
3. Retries original request
4. User never sees 401 error (transparent refresh)

**Applied to:**
- `authService.fetchMe()`
- All methods in `notificationService`

---

## 🎨 Common Patterns

### Image Upload with Compression

```typescript
// Step 1: Get file from input
const file = e.target.files[0];

// Step 2: Compress
const compressed = await compressImage(file, 800, 0.8);

// Step 3: Send via FormData
const formData = new FormData();
formData.append("pfp", compressed, "avatar.jpg");
await authService.updateProfile(formData);

// Step 4: Show fresh image with cache-buster
const url = authService.resolveMediaUrl(data.pfp, true); // true = add timestamp
```

### Error Handling

```typescript
try {
  await notificationService.fetchNotifications();
} catch (error) {
  // Token auto-refresh happens transparently
  // If that fails, the error bubbles up
  toast.error("Failed to load notifications");
}
```

### Multi-Language Support

```typescript
import { useLanguage } from "@/i18n/LanguageContext";

const MyComponent = () => {
  const { t, language } = useLanguage(); // "en", "fr", "ar"

  return <div dir={language === "ar" ? "rtl" : "ltr"}>
    {t("common.save")}
  </div>;
};
```

---

## 🐛 Troubleshooting

### Profile Picture Not Updating After Save

**Problem:** Image upload says "successful" but old image shows after refresh

**Solution:**
- The fix: Cache-busting query parameter is now added (`?t=timestamp`)
- This forces browser to fetch fresh image instead of using cached version
- Applied in `ProviderProfile.tsx` when saving

**How it works:**
```typescript
// Before: /media/profile_pics/user_123.jpg
// After: /media/profile_pics/user_123.jpg?t=1712595600000
```

### Notifications Not Loading

**Problem:** "Token is expired" error in notifications

**Solution:**
- Token refresh now happens automatically in `notificationService`
- All methods (fetchNotifications, markAsRead, etc.) handle 401 responses
- Retries with fresh token

### Image Crops Not Saving

**Problem:** Image cropper shows the cropped image, but original appears to save

**Check:**
1. Open browser DevTools → Network tab
2. Upload image and check PATCH `/api/v1/users/me/` response
3. Verify `pfp` field is in response
4. Check file is actually sent in FormData

---

## 📱 Responsive Design

- Mobile-first approach
- TailwindCSS for styling
- shadcn/ui components (tested on mobile)
- Fixed header/navigation
- Touch-friendly buttons and inputs

---

## 🌍 Internationalization (i18n)

Supported languages:
- **en** - English
- **fr** - Français
- **ar** - العربية (RTL)

Language switching changes:
- UI text
- Date formatting
- Text direction (RTL for Arabic)
- Number formatting

---

## 📞 Support

For issues or questions about the API integration, refer to:
- `RizerVitoo Support API Documentation.md` - Reviews, Reports, Wishlist
- `RizerVitoo Listings API Documentation.md` - Listings management
- `RizerVitoo Bookings API Documentation.md` - Bookings workflow
- `RezerVitoo Mobile API Documentation.md` - Users, Authentication

---

**Happy Coding! 🚀**
