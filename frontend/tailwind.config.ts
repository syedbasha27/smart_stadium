import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10192B",
        paper: "#F6F7F9",
        surface: "#FFFFFF",
        line: "#E4E7EC",
        pitch: {
          DEFAULT: "#0E7C66",
          soft: "#E4F2EE",
          deep: "#0A5B4B",
        },
        gold: {
          DEFAULT: "#C99A3B",
          soft: "#F6ECD8",
        },
        alert: {
          low: "#0E7C66",
          moderate: "#3E7CB1",
          high: "#C9862F",
          critical: "#C4432B",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,25,43,0.04), 0 8px 24px -12px rgba(16,25,43,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
