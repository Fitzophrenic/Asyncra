import { create } from "zustand";
import type { User, OnboardingData } from "./types";
import { authApi } from "./api";

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
  user: null,
  token: null,
  isAuthenticated: false,
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