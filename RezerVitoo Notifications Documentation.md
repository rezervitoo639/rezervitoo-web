# RezerVitoo Notifications

**Base WS URL:** `wss://api.rezervitoo.com`  
**Base REST URL:** `https://api.rezervitoo.com/api/v1`

**Version:** 1.1
**Last Updated:** April 8, 2026

---

## Connection

All WebSocket endpoints use JWT authentication via query string.

```
wss://api.rezervitoo.com/ws/user/notifications/?token=<access_token>
```

- The token is the same JWT `access` token from login.
- On connect, the server sends a confirmation message.
- One endpoint serves **all users** (customers and providers).

---

## Endpoints

| Endpoint                  | Who connects                                  |
| ------------------------- | --------------------------------------------- |
| `ws/user/notifications/`  | Any authenticated user (customer or provider) |
| `ws/admin/notifications/` | Admins only                                   |

---

## Message Format

Every message pushed from the server follows this shape:

```json
{
  "type": "notification",
  "message": "Human-readable string",
  "data": { ... },
  "timestamp": "2026-03-25T14:30:00.000000"
}
```

On successful connection:

```json
{
  "type": "connection_established",
  "message": "Connected to personal notifications",
  "timestamp": "2026-03-25T14:30:00.000000"
}
```

---

## Notification Events

### 1. New Booking (Provider receives)

Triggered when a customer creates a booking on one of the provider's listings.

```json
{
  "type": "notification",
  "message": "New booking request for 'Sunset Villa'",
  "data": {
    "booking_id": 42,
    "listing_id": 15,
    "listing_title": "Sunset Villa",
    "guest_email": "customer@example.com",
    "guests_count": 2,
    "total_price": "240.00",
    "start_date": "2026-04-10",
    "end_date": "2026-04-13",
    "status": "PENDING"
  },
  "timestamp": "2026-03-25T14:30:00.000000"
}
```

---

### 2. Booking Status Changed (Customer receives)

Triggered when a provider accepts, rejects, cancels, or completes a booking.

```json
{
  "type": "notification",
  "message": "Booking #42: Your booking has been accepted!",
  "data": {
    "booking_id": 42,
    "status": "ACCEPTED",
    "listing_title": "Sunset Villa"
  },
  "timestamp": "2026-03-25T15:00:00.000000"
}
```

Possible `status` values: `PENDING` · `ACCEPTED` · `REJECTED` · `CANCELLED` · `COMPLETED`

---

### 3. New Review (Provider receives)

Triggered when a customer posts a `USER_TO_LISTING` review on one of the provider's listings.

```json
{
  "type": "notification",
  "message": "New 5⭐ review on 'Sunset Villa'",
  "data": {
    "review_id": 88,
    "listing_id": 15,
    "rating": 5,
    "reviewer": "customer@example.com",
    "comment": "Amazing place, highly recommend!"
  },
  "timestamp": "2026-03-25T16:00:00.000000"
}
```

---

## Client Implementation Example

```javascript
const token = localStorage.getItem("access_token");
const ws = new WebSocket(
  `wss://api.rezervitoo.com/ws/user/notifications/?token=${token}`,
);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "connection_established") {
    console.log("Connected to notifications");
    return;
  }

  if (msg.type === "notification") {
    const { message, data } = msg;

    // Route by presence of data fields
    if (data.booking_id && data.guest_email) {
      // Provider: new booking received
    } else if (data.booking_id && data.status) {
      // Customer: booking status changed
    } else if (data.review_id) {
      // Provider: new review received
    }
  }
};

ws.onclose = () => {
  // Reconnect with exponential backoff
};
```

---

## Notes

- **Token expiry:** Refresh the connection when the access token is rotated.
- **Reconnection:** Implement reconnect logic with exponential backoff (connection can drop).
- **Both channels:** FCM push notifications and notification history records are also created for the same events.

---

## FCM Push Notifications (Mobile)

Push notifications are delivered via Firebase Cloud Messaging alongside WebSocket events. All events above that reach users or providers also fire an FCM push to every active device the user has registered.

### Step 1 — Register the Device Token

Call once on every login and whenever Firebase refreshes the token.

**`POST /api/v1/notifications/fcm/register/`**  
**Auth:** Bearer `<access_token>`

```json
{
  "registration_token": "fKz0xY1C2D3...firebase_token",
  "device_name": "Samsung Galaxy S24"
}
```

Response `200 OK`:
```json
{
  "message": "Device registered successfully",
  "device_id": 7
}
```

> Call this on **every login**, not just the first one — tokens can be refreshed by Firebase at any time.

### Step 2 — Unregister on Logout

**`DELETE /api/v1/notifications/fcm/register/`**  
**Auth:** Bearer `<access_token>`

```json
{ "registration_token": "fKz0xY1C2D3...firebase_token" }
```

Response `200 OK`:
```json
{ "message": "Device unregistered successfully" }
```

### What Triggers FCM

| Event | Who receives the push |
|---|---|
| New booking created | Guest (booking submitter) + Provider (listing owner) |
| Booking status changed | Guest |
| New `USER_TO_LISTING` review | Provider (listing owner) |
| Account approved (VERIFIED) | Provider |

### FCM Payload Structure

The FCM `data` payload mirrors the WebSocket `data` object for the same event. All values are strings (FCM requirement).

```json
{
  "notification": {
    "title": "Rizervitoo",
    "body": "Your booking #42 has been accepted!"
  },
  "data": {
    "booking_id": "42",
    "status": "ACCEPTED",
    "listing_title": "Sunset Villa"
  }
}
```

Handle deep-linking using the keys in `data` (same fields documented per event above).

---

## Notification History (REST)

All notification events are persisted to the database and available via REST — no need to be connected via WebSocket to receive them.

### List Notifications

**`GET /api/v1/support/notifications/`**  
**Auth:** Bearer `<access_token>`  
Returns the authenticated user's own notifications (works for users, providers, and admins).

Query parameters:

| Param | Type | Description |
|---|---|---|
| `is_read` | boolean | Filter by read status (`true` / `false`) |
| `type` | string | Filter by type (see table below) |

Response `200 OK`:
```json
[
  {
    "id": 101,
    "type": "booking_created",
    "message": "Your booking #42 for 'Sunset Villa' has been submitted",
    "payload": {
      "booking_id": 42,
      "listing_id": 15,
      "listing_title": "Sunset Villa",
      "total_price": "240.00",
      "status": "PENDING",
      "start_date": "2026-04-10",
      "end_date": "2026-04-13"
    },
    "is_read": false,
    "created_at": "2026-04-08T10:00:00Z",
    "updated_at": "2026-04-08T10:00:00Z"
  }
]
```

### Notification Types by Account

| `type` | Recipient |
|---|---|
| `booking_created` | User (guest) — booking submitted |
| `booking_update` | User (guest) — booking status changed |
| `new_booking` | Provider — new booking on their listing |
| `new_review` | Provider — new review on their listing |
| `new_user` | Admin — new account registered |
| `new_listing` | Admin — new listing submitted |
| `new_booking` | Admin — any new booking |
| `new_report` | Admin — new report submitted |
| `new_review` | Admin — any new review |

### Mark a Notification as Read

**`PATCH /api/v1/support/notifications/{id}/mark_as_read/`**  
**Auth:** Bearer `<access_token>`

```json
{ "is_read": true }
```

### Mark All as Read

**`POST /api/v1/support/notifications/mark_all_read/`**  
**Auth:** Bearer `<access_token>`

Response:
```json
{ "message": "5 notifications marked as read", "count": 5 }
```

### Delete a Notification

**`DELETE /api/v1/support/notifications/{id}/`**  
**Auth:** Bearer `<access_token>`

---

## Notes

- **Token expiry:** Refresh the WebSocket connection when the access token is rotated.
- **Reconnection:** Implement reconnect logic with exponential backoff (connection can drop).
- **Dual delivery:** Every event is delivered via WebSocket (real-time), FCM (push), and persisted to the notification history REST API simultaneously.