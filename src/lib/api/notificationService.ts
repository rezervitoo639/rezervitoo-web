import { API_BASE_URL } from "./config";
import { authService } from "./authService";

const SUPPORT_URL = `${API_BASE_URL}/api/v1/support/notifications`;
const FCM_URL = `${API_BASE_URL}/api/v1/notifications/fcm/register`;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  created_at: string;
  data?: any;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: AppNotification[];
}

export const notificationService = {
  async fetchNotifications(params?: Record<string, string | number>): Promise<PaginatedNotifications> {
    const token = authService.getAccessToken();
    if (!token) throw new Error("Authentication required");

    const query = params
      ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : "";

    const response = await fetch(`${SUPPORT_URL}/${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await authService.refresh();
      return this.fetchNotifications(params);
    }

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    return response.json();
  },

  async getNotificationDetails(id: string): Promise<AppNotification> {
    const token = authService.getAccessToken();
    const response = await fetch(`${SUPPORT_URL}/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await authService.refresh();
      return this.getNotificationDetails(id);
    }

    if (!response.ok) {
      throw new Error("Failed to fetch notification details");
    }

    return response.json();
  },

  async markAsRead(id: string): Promise<void> {
    const token = authService.getAccessToken();
    const response = await fetch(`${SUPPORT_URL}/${id}/mark_as_read/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await authService.refresh();
      return this.markAsRead(id);
    }

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }
  },

  async markAllAsRead(): Promise<void> {
    const token = authService.getAccessToken();
    const response = await fetch(`${SUPPORT_URL}/mark_all_read/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await authService.refresh();
      return this.markAllAsRead();
    }

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const token = authService.getAccessToken();
    const response = await fetch(`${SUPPORT_URL}/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await authService.refresh();
      return this.deleteNotification(id);
    }

    if (!response.ok) {
      throw new Error("Failed to delete notification");
    }
  },

  /** --- FCM registration --- */

  async registerFCMToken(registrationId: string, deviceType: "ANDROID" | "IOS" | "WEB" = "WEB"): Promise<void> {
    const token = authService.getAccessToken();
    if (!token) return; // Silent return if not logged in

    const response = await fetch(`${FCM_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        registration_id: registrationId,
        type: deviceType,
      }),
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refresh();
        return this.registerFCMToken(registrationId, deviceType);
      } catch (e) {
        console.error("FCM Token registration failed after refresh");
      }
    }

    if (!response.ok) {
      console.error("FCM Token registration failed");
    }
  },

  async unregisterFCMToken(registrationId: string): Promise<void> {
    const token = authService.getAccessToken();
    const response = await fetch(`${FCM_URL}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        registration_id: registrationId,
      }),
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refresh();
        return this.unregisterFCMToken(registrationId);
      } catch (e) {
        console.error("FCM Token unregistration failed after refresh");
      }
    }

    if (!response.ok) {
      console.error("FCM Token unregistration failed");
    }
  },
};
