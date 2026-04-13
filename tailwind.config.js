/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  safelist: [
    // dynamic theme tokens consumed via template literals (lib/theme.ts -> tokens[mode])
    "bg-asy-canvas",
    "bg-asy-card",
    "bg-asy-cardAlt",
    "bg-asy-lightBg",
    "bg-asy-lightCard",
    "bg-slate-100",
    "border-asy-border",
    "border-asy-lightBorder",
    "text-asy-text",
    "text-asy-textMuted",
    "text-asy-lightText",
    "text-asy-lightMuted",
    "text-asy-accent",
    "text-slate-400",
    "bg-asy-accent",
    "text-white",
  ],
  theme: {
    extend: {
      colors: {
        asy: {
          navy: "#1B3A6B",
          navyDeep: "#152C52",
          canvas: "#12151F",
          card: "#1E1E2E",
          cardAlt: "#262636",
          accent: "#6EC4DE",
          accentDim: "#4FA8C2",
          text: "#E8EDF5",
          textMuted: "#8A9BB5",
          border: "#2A2D3A",
          // light mode
          lightBg: "#F4F7FB",
          lightCard: "#FFFFFF",
          lightBorder: "#E2E8F1",
          lightText: "#13243A",
          lightMuted: "#64748B",
        },
        brand: {
          navy: "#13345F",
          navyDeep: "#0E2747",
          cyan: "#5DBFD6",
          cyanSoft: "#B7E2EC",
          cyanTint: "#E6F4F8",
        },
        surface: {
          bg: "#0B1622",
          panel: "#111E2E",
          panelAlt: "#16263A",
          border: "#1F3147",
        },
        surfaceLight: {
          bg: "#F4F7FB",
          panel: "#FFFFFF",
          panelAlt: "#F9FAFD",
          border: "#E2E8F1",
        },
        ink: {
          primary: "#FFFFFF",
          secondary: "#B6C2D1",
          muted: "#7A8AA0",
          onLight: "#13243A",
        },
        inkLight: {
          primary: "#13243A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        status: {
          success: "#3FBF7F",
          warning: "#E0A23A",
          danger: "#E25C5C",
          info: "#5DBFD6",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
      borderRadius: {
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
