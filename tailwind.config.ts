import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
      colors: {
        verter: {
          forest: "#1F3D2B",
          blue: "#2F5D80",
          snow: "#F6F7F4",
          graphite: "#1C1C1C",
          muted: "#5B5F63",
          border: "#E3E6E2",
          good: "#1F7A4D",
          risky: "#C08A1A",
          bad: "#B3423A",
          ice: "#CFE7F5",
        },
      },
      borderRadius: {
        card: "12px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
