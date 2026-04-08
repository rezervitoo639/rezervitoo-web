import { API_BASE_URL } from "./config";
import { authService } from "./authService";

const SUPPORT_URL = `${API_BASE_URL}/api/v1/support/notifications`;
const FCM_URL = `${API_BASE_URL}/api/v1/notifications/fcm/register`;
const NOTIFICATIONS_WS_PATH = "/ws/user/notifications/";
export const NOTIFICATION_EVENT = "app:notification";

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

interface NotificationWsMessage {
  type: string;
  message?: string;
  data?: any;
  timestamp?: string;
}

const mapNotification = (item: any): AppNotification => ({
  id: String(item.id ?? `${item.type || "notification"}-${item.created_at || item.timestamp || Date.now()}`),
  title: item.title || item.message || "Notification",
  message: item.message || "",
  is_read: Boolean(item.is_read),
  notification_type: (item.notification_type || item.type || "notification").toString(),
  created_at: item.created_at || item.timestamp || new Date().toISOString(),
  data: item.data ?? item.payload,
});

const normalizeNotificationList = (payload: any): PaginatedNotifications => {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload.map(mapNotification),
    };
  }

  const results = Array.isArray(payload?.results) ? payload.results.map(mapNotification) : [];
  return {
    count: Number(payload?.count ?? results.length),
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
    results,
  };
};

const getWsBaseUrl = () => {
  if (API_BASE_URL.startsWith("https://")) return API_BASE_URL.replace("https://", "wss://");
  if (API_BASE_URL.startsWith("http://")) return API_BASE_URL.replace("http://", "ws://");
  return "wss://api.rezervitoo.com";
};

export const notificationService = {
  async fetchNotifications(params?: Record<string, string | number | boolean>): Promise<PaginatedNotifications> {
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

    const data = await response.json();
    return normalizeNotificationList(data);
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_read: true }),
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

  async registerFCMToken(registrationToken: string, deviceName = "Web Browser"): Promise<void> {
    const token = authService.getAccessToken();
    if (!token) return; // Silent return if not logged in

    const response = await fetch(`${FCM_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        registration_token: registrationToken,
        device_name: deviceName,
      }),
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refresh();
        return this.registerFCMToken(registrationToken, deviceName);
      } catch (e) {
        console.error("FCM Token registration failed after refresh");
      }
    }

    if (!response.ok) {
      console.error("FCM Token registration failed");
    }
  },

  async unregisterFCMToken(registrationToken: string): Promise<void> {
    const token = authService.getAccessToken();
    const response = await fetch(`${FCM_URL}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        registration_token: registrationToken,
      }),
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refresh();
        return this.unregisterFCMToken(registrationToken);
      } catch (e) {
        console.error("FCM Token unregistration failed after refresh");
      }
    }

    if (!response.ok) {
      console.error("FCM Token unregistration failed");
    }
  },

  connectToRealtimeNotifications(
    onNotification: (notification: AppNotification) => void,
    onConnected?: () => void,
  ): () => void {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let reconnectAttempts = 0;
    let closedManually = false;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const scheduleReconnect = async () => {
      clearReconnectTimer();
      if (closedManually) return;

      reconnectAttempts += 1;
      try {
        await authService.refresh();
      } catch {
        // Continue reconnecting even if refresh fails.
      }

      const delayMs = Math.min(30000, 1000 * 2 ** Math.min(reconnectAttempts, 5));
      reconnectTimer = window.setTimeout(connect, delayMs);
    };

    const connect = () => {
      const token = authService.getAccessToken();
      if (!token) return;

      const wsUrl = `${getWsBaseUrl()}${NOTIFICATIONS_WS_PATH}?token=${encodeURIComponent(token)}`;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        reconnectAttempts = 0;
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as NotificationWsMessage;
          if (msg.type === "connection_established") {
            onConnected?.();
            return;
          }

          if (msg.type === "notification") {
            const notification = mapNotification({
              type: msg.data?.type || "notification",
              message: msg.message || "New notification",
              data: msg.data,
              timestamp: msg.timestamp,
              created_at: msg.timestamp,
              is_read: false,
            });

            onNotification(notification);
            window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: notification }));
          }
        } catch (error) {
          console.error("Invalid notification socket message", error);
        }
      };

      socket.onclose = () => {
        socket = null;
        void scheduleReconnect();
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closedManually = true;
      clearReconnectTimer();
      if (socket && socket.readyState <= WebSocket.OPEN) {
        socket.close();
      }
      socket = null;
    };
  },
};
