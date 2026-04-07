/**
 * RizerVitoo Authentication Service
 * Communicates with backend API
 */

import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/api/v1/users`;

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
      let errorMessage = "Login failed";
      try {
        const error = await response.json();
        errorMessage = error.detail || error.error || error.message || errorMessage;
      } catch (e) {
        // Fallback for non-JSON errors
      }
      throw new Error(errorMessage);
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
      const error = await response.json();
      throw new Error(error.detail || error.error || "Google login failed");
    }

    const result = await response.json();
    const tokens = result.tokens || result;
    this.setAuth(tokens);
    return tokens;
  },

  async resendVerification(email: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/verify-email/send/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || "Failed to resend verification email");
    }
  },

  async registerUser(data: any): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, account_type: "USER" }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error; 
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
      const error = await response.json();
      throw error;
    }

    return (await response.json()) as UserProfile;
  },

  async fetchMe(): Promise<UserProfile> {
    const token = this.getAccessToken();
    if (!token) throw new Error("No access token found");

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
      throw new Error("Failed to fetch user data");
    }

    const user = (await response.json()) as UserProfile;
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    return user;
  },

  async refresh(): Promise<string> {
    const refresh = this.getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");

    const response = await fetch(`${BASE_URL}/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error("Session expired, please login again");
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

  async verifyEmail(email: string, code: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || "Email verification failed");
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
      const error = await response.json();
      throw new Error(error.error || error.detail || "Failed to request password reset");
    }
  },

  async confirmPasswordReset(data: any): Promise<void> {
    const response = await fetch(`${BASE_URL}/password-reset/confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || "Failed to reset password");
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
        const error = await response.json().catch(() => ({ detail: "Failed to update profile" }));
        throw error;
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
            const error = JSON.parse(xhr.responseText);
            reject(error);
          } catch (e) {
            reject({ detail: "Failed to update profile" });
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network error during profile update"));
      xhr.send(data);
    });
  },

  async fetchDocumentStatus(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) throw new Error("No access token found");

    const response = await fetch(`${BASE_URL}/documents/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch document status");
    }

    return response.json();
  },

  async submitDocuments(formData: FormData, onProgress?: (progress: number) => void): Promise<UserProfile> {
    const token = this.getAccessToken();
    if (!token) throw new Error("No access token found");

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
            const error = JSON.parse(xhr.responseText);
            reject(error);
          } catch (e) {
            reject({ detail: "Failed to submit documents" });
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
