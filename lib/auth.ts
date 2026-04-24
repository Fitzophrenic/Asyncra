import { create } from "zustand";
import type { User, OnboardingData } from "./types";
import { authApi } from "./api";

// persist session to localStorage so refresh keeps you logged in
const STORAGE_KEY = "asyncra-auth";

type PersistedAuth = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

function readPersisted(): PersistedAuth | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
}

function writePersisted(data: PersistedAuth): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // swallow quota / private-mode errors
  }
}

function clearPersisted(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

const initial = readPersisted();

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  onboardingData: OnboardingData | null;
  setOnboardingData: (data: Partial<OnboardingData>) => void;

  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: initial?.user ?? null,
  token: initial?.token ?? null,
  isAuthenticated: initial?.isAuthenticated ?? false,
  isLoading: false,
  onboardingData: null,

  setOnboardingData: (data) =>
    set((s) => ({
      onboardingData: { ...s.onboardingData, ...data } as OnboardingData,
    })),

  signUp: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.register(email, password, name);
      set({
        user,
        token,
        isAuthenticated: true,
      });

      // lazy import to avoid circular dep
      const [{ uploadApi, userApi }, { useAppStore }] = await Promise.all([
        import("./api"),
        import("./store"),
      ]);

      // save the onboarding answers now that the user exists
      const onboarding = useAuth.getState().onboardingData;
      if (onboarding) {
        try {
          const updatedUser = await userApi.saveOnboarding({
            major: onboarding.major,
            enrollment: onboarding.enrollment,
            goal: onboarding.goal,
            weeklyStudyHours: onboarding.weeklyStudyHours,
          });
          set({ user: updatedUser });
        } catch (err) {
          console.warn("Failed to save onboarding after signup:", err);
        }
      }

      // save the syllabus they previewed before signup
      try {
        const pending = useAppStore.getState().pendingAnalysis;
        if (pending) {
          await uploadApi.save(pending);
          useAppStore.getState().setPendingAnalysis(null);
        }
      } catch (err) {
        console.warn("Failed to persist pending analysis after signup:", err);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.login(email, password);
      set({
        user,
        token,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: () => {
    set({ user: null, token: null, isAuthenticated: false, onboardingData: null });
  },

  updateUser: (data) =>
    set((s) => ({
      user: s.user ? { ...s.user, ...data } : null,
    })),
}));

// sync auth state to localStorage on change
useAuth.subscribe((state) => {
  if (state.isAuthenticated && state.token) {
    writePersisted({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    });
  } else {
    clearPersisted();
  }
});