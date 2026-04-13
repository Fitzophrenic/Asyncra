// auth store - handles login/signup/session
// uses mock data for now, swap to real api calls when backend is ready

import { create } from "zustand";
import type { User, OnboardingData } from "./types";
import { mockUser } from "./mockData";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // stores answers from onboarding steps before account creation
  onboardingData: OnboardingData | null;
  setOnboardingData: (data: Partial<OnboardingData>) => void;

  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  // start with mock user so the app works before backend is connected
  user: mockUser,
  token: "mock-token",
  isAuthenticated: true,
  isLoading: false,
  onboardingData: null,

  setOnboardingData: (data) =>
    set((s) => ({
      onboardingData: { ...s.onboardingData, ...data } as OnboardingData,
    })),

  signUp: async (email, password, name) => {
    set({ isLoading: true });
    try {
      // TODO: replace with real api call
      // const { user, token } = await authApi.register(email, password, name);

      // mock signup - uses onboarding data + provided name
      const onboarding = get().onboardingData;
      const parts = name.split(" ");
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
      const user: User = {
        ...mockUser,
        id: `u_${Date.now()}`,
        email,
        name,
        initials,
        major: onboarding?.major ?? "Undeclared",
        enrollment: onboarding?.enrollment ?? "full-time",
        goal: onboarding?.goal ?? "",
        weeklyHours: onboarding?.weeklyStudyHours ?? 20,
      };
      set({ user, token: "mock-token", isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      // TODO: replace with real api call
      // const { user, token } = await authApi.login(email, password);

      set({
        user: { ...mockUser, email },
        token: "mock-token",
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
