// api client - handles all fetch requests to backend
// swap API_BASE_URL to your server once its deployed

import type {
  User,
  Course,
  Notification,
  ProgramComparison,
  DashboardData,
  SyllabusAnalysis,
  OnboardingData,
} from "./types";
import { useAuth } from "./auth";

// set this to your backend URL
const API_BASE_URL = "";

// helper that attaches auth token to every request
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuth.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

// auth
export const authApi = {
  // POST /auth/register -> { user, token }
  register: (email: string, password: string, name: string) =>
    request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  // POST /auth/login -> { user, token }
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // POST /auth/logout
  logout: () => request<void>("/auth/logout", { method: "POST" }),
};

// user profile
export const userApi = {
  // GET /user/profile -> User
  getProfile: () => request<User>("/user/profile"),

  // PUT /user/profile -> User (update name, major, etc)
  updateProfile: (data: Partial<User>) =>
    request<User>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // PUT /user/onboarding -> User (save onboarding answers)
  saveOnboarding: (data: OnboardingData) =>
    request<User>("/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// courses
export const courseApi = {
  list: () => request<Course[]>("/courses"),
  get: (id: string) => request<Course>(`/courses/${id}`),
  remove: (id: string) => request<void>(`/courses/${id}`, { method: "DELETE" }),
};

// file upload + AI analysis
export const uploadApi = {
  // uploads a PDF and returns the parsed course data
  analyzeSyllabus: async (fileUri: string, fileName: string, mimeType: string) => {
    const token = useAuth.getState().token;
    const formData = new FormData();

    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    const res = await fetch(`${API_BASE_URL}/upload/syllabus`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Upload failed ${res.status}: ${body}`);
    }

    return res.json() as Promise<SyllabusAnalysis>;
  },

  // analyze from a URL instead of file upload
  analyzeSyllabusUrl: (url: string) =>
    request<SyllabusAnalysis>("/upload/syllabus-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
};

// dashboard
export const dashboardApi = {
  get: () => request<DashboardData>("/dashboard"),
};

// notifications
export const notificationApi = {
  list: () => request<Notification[]>("/notifications"),
  dismiss: (id: string) => request<void>(`/notifications/${id}`, { method: "DELETE" }),
};

// program comparisons
export const comparisonApi = {
  list: (query?: string) =>
    request<ProgramComparison[]>(`/comparisons${query ? `?q=${encodeURIComponent(query)}` : ""}`),
};
