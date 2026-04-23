/**
 * RizerVitoo Authentication Service
 * Communicates with backend API
 */

import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/api/v1/users`;

type ApiErrorShape = {
  status: number;
  data?: any;
  message?: string;
};

async function readJsonSafe(response: Response): Promise<any | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildApiError(response: Response, data: any | null, fallbackMessage: string): ApiErrorShape {
  const msg =
    (data && (data.detail || data.error || data.message)) ||
    fallbackMessage;
  return { status: response.status, data: data ?? undefined, message: typeof msg === "string" ? msg : fallbackMessage };
}

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "HOST" | "HOTEL" | "HOSTEL" | "AGENCY" | null;
  account_type: "USER" | "PROVIDER" | "ADMIN";
  verification_status: "VERIFIED" | "UNVERIFIED" | "PENDING";
  email_verified: boolean;
  pfp: string | null;
  created_at: string;
};

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_DATA_KEY = "auth_user_data";

export const authService = {
  /** Save tokens and optional user data to storage */
  setAuth(tokens: AuthTokens, user?: UserProfile) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    if (user) {
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }
  },

  getAccessToken() {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUserData(): UserProfile | null {
    const raw = sessionStorage.getItem(USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  clearAuth() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  },

  /** Resolve media URLs (handle relative vs absolute) */
  resolveMediaUrl(path: string | null | undefined, cacheBust: boolean = false): string | null {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${API_BASE_URL}/${cleanPath}`;
    // Add cache buster for profile pictures to ensure fresh load
    return cacheBust ? `${url}?t=${Date.now()}` : url;
  },

  async login(credentials: any): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await readJsonSafe(response);
      throw buildApiError(response, data, "Login failed");
    }

    const tokens = (await response.json()) as AuthTokens;
    this.setAuth(tokens);
    return tokens;
  },

  async loginGoogle(data: { id_token: string; account_type: string; role?: string }): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}/login/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Google login failed");
    }

    const result = await response.json();
    const tokens = result.tokens || result;
    this.setAuth(tokens);
    return tokens;
  },

  /**
   * Send/resend verification email.
   * Per API docs: can be unauthenticated with { email } or authenticated with empty body.
   */
  async resendVerification(email?: string): Promise<{ message?: string } | void> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token && !email) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/verify-email/send/`, {
      method: "POST",
      headers,
      body: email ? JSON.stringify({ email }) : JSON.stringify({}),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Failed to resend verification email");
    }

    // Endpoint usually returns { message }, but callers might not need it.
    const data = await readJsonSafe(response);
    return data ?? undefined;
  },

  async registerUser(data: any): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, account_type: "USER" }),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Registration failed");
    }

    return (await response.json()) as UserProfile;
  },

  async registerProvider(data: any): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/register-provider/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, account_type: "PROVIDER" }),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Registration failed");
    }

    return (await response.json()) as UserProfile;
  },

  async fetchMe(): Promise<UserProfile> {
    const token = this.getAccessToken();
    if (!token) throw { status: 401, message: "No access token found" } satisfies ApiErrorShape;

    const response = await fetch(`${BASE_URL}/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      await this.refresh();
      return this.fetchMe();
    }

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Failed to fetch user data");
    }

    const user = (await response.json()) as UserProfile;
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    return user;
  },

  async refresh(): Promise<string> {
    const refresh = this.getRefreshToken();
    if (!refresh) throw { status: 401, message: "No refresh token found" } satisfies ApiErrorShape;

    const response = await fetch(`${BASE_URL}/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      this.clearAuth();
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Session expired, please login again");
    }

    const data = await response.json();
    sessionStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    return data.access;
  },

  async fetchUserById(id: number | string): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/${id}/`);

    if (!response.ok) {
      throw new Error("Failed to fetch provider data");
    }

    return (await response.json()) as UserProfile;
  },

  async fetchProviders(params?: any): Promise<{ count: number; results: UserProfile[] }> {
    const query = params ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : "";
    const response = await fetch(`${BASE_URL}/${query}`);

    if (!response.ok) {
      throw new Error("Failed to fetch providers");
    }

    return response.json();
  },

  /**
   * Verify email.
   * Supports both backend styles:
   * - token-based: POST /verify-email/ { token }
   * - code-based:  POST /verify-email/ { email, code }
   */
  async verifyEmail(payload: { token: string } | { email: string; code: string }): Promise<any> {
    const response = await fetch(`${BASE_URL}/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Email verification failed");
    }

    return response.json();
  },

  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Failed to request password reset");
    }
  },

  async confirmPasswordReset(data: any): Promise<void> {
    const response = await fetch(`${BASE_URL}/password-reset/confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Failed to reset password");
    }
  },

  async updateProfile(data: Partial<UserProfile> | FormData, onProgress?: (progress: number) => void): Promise<UserProfile> {
    const token = this.getAccessToken();
    if (!token) throw new Error("No access token found");

    const isFormData = data instanceof FormData;

    // If not FormData, use normal fetch as it doesn't need progress tracking typically
    if (!isFormData) {
      const response = await fetch(`${BASE_URL}/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await readJsonSafe(response);
        throw buildApiError(response, err, "Failed to update profile");
      }

      const user = (await response.json()) as UserProfile;
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      return user;
    }

    // Use XMLHttpRequest for FormData to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PATCH", `${BASE_URL}/me/`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const user = JSON.parse(xhr.responseText) as UserProfile;
            sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
            resolve(user);
          } catch (e) {
            resolve(JSON.parse(xhr.responseText)); // Fallback if type is slightly different
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject({ status: xhr.status, data: err, message: err?.detail || err?.error || "Failed to update profile" });
          } catch (e) {
            reject({ status: xhr.status, message: "Failed to update profile" });
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network error during profile update"));
      xhr.send(data);
    });
  },

  async fetchDocumentStatus(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) throw { status: 401, message: "No access token found" } satisfies ApiErrorShape;

    const response = await fetch(`${BASE_URL}/documents/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await readJsonSafe(response);
      throw buildApiError(response, err, "Failed to fetch document status");
    }

    return response.json();
  },

  async submitDocuments(formData: FormData, onProgress?: (progress: number) => void): Promise<UserProfile> {
    const token = this.getAccessToken();
    if (!token) throw { status: 401, message: "No access token found" } satisfies ApiErrorShape;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/documents/`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const user = JSON.parse(xhr.responseText) as UserProfile;
            sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
            resolve(user);
          } catch (e) {
            resolve(JSON.parse(xhr.responseText));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject({ status: xhr.status, data: err, message: err?.detail || err?.error || "Failed to submit documents" });
          } catch (e) {
            reject({ status: xhr.status, message: "Failed to submit documents" });
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network error during document submission"));
      xhr.send(formData);
    });
  },

  async logout(): Promise<void> {
    const access = this.getAccessToken();
    const refresh = this.getRefreshToken();

    if (access && refresh) {
      try {
        await fetch(`${BASE_URL}/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ refresh }),
        });
      } catch (e) {
        console.error("Logout error", e);
      }
    }

    this.clearAuth();
  },
};
