import { create } from "zustand";

type ThemeMode = "dark" | "light";

type ThemeStore = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

export const useTheme = create<ThemeStore>((set) => ({
  mode: "dark",
  toggle: () => set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
  setMode: (mode) => set({ mode }),
}));

type SidebarStore = {
  pinned: boolean;
  setPinned: (v: boolean) => void;
};

export const useSidebar = create<SidebarStore>((set) => ({
  pinned: false,
  setPinned: (pinned) => set({ pinned }),
}));

export const tokens = {
  dark: {
    bg: "bg-asy-canvas",
    bgElevated: "bg-asy-card",
    bgCard: "bg-asy-card",
    panel: "bg-asy-card",
    panelAlt: "bg-asy-cardAlt",
    border: "border-asy-border",
    text: "text-asy-text",
    textPrimary: "text-asy-text",
    textSecondary: "text-asy-text",
    textMuted: "text-asy-textMuted",
    accent: "text-asy-accent",
    accentBg: "bg-asy-accent",
    brand: "bg-asy-accent",
    brandText: "text-white",
  },
  light: {
    bg: "bg-asy-lightBg",
    bgElevated: "bg-asy-lightCard",
    bgCard: "bg-asy-lightCard",
    panel: "bg-asy-lightCard",
    panelAlt: "bg-slate-100",
    border: "border-asy-lightBorder",
    text: "text-asy-lightText",
    textPrimary: "text-asy-lightText",
    textSecondary: "text-asy-lightMuted",
    textMuted: "text-asy-lightMuted",
    accent: "text-asy-accent",
    accentBg: "bg-asy-accent",
    brand: "bg-asy-accent",
    brandText: "text-white",
  },
} as const;

export const themeHex = {
  dark: { bg: "#12151F", bgElevated: "#1E1E2E", border: "#2A2D3A", text: "#E8EDF5", muted: "#8A9BB5", navy: "#1B3A6B", accent: "#6EC4DE" },
  light: { bg: "#F4F7FB", bgElevated: "#FFFFFF", border: "#E2E8F1", text: "#13243A", muted: "#64748B", navy: "#1B3A6B", accent: "#6EC4DE" },
} as const;
