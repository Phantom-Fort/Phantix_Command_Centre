import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0D1B3D",
        "navy-mid": "#112350",
        "navy-light": "#1A3470",
        blue: "#1E3A8A",
        bright: "#2563EB",
        cyan: "#38BDF8",
        "cyan-dim": "#0EA5E9",
        silver: "#CBD5E1",
        muted: "#64748B",
        light: "#E2E8F0",
        white: "#F8FAFC",
        success: "#10B981",
        warn: "#F59E0B",
        danger: "#EF4444",
        purple: "#8B5CF6",
        surface: "#0F1F45",
        surface2: "#162850",
        surface3: "#1C3060",
        border: "rgba(56,189,248,0.15)",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
