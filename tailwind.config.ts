import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette from spec
        terracotta: {
          DEFAULT: "#C1440E",
          50: "#FDF5F0",
          100: "#FBEADE",
          200: "#F5C9B0",
          300: "#EFA882",
          400: "#E87754",
          500: "#C1440E",
          600: "#9A360B",
          700: "#732908",
          800: "#4D1B05",
          900: "#260E03",
        },
        indigo: {
          DEFAULT: "#1E2A4A",
          50: "#E8EBF2",
          100: "#D1D7E5",
          200: "#A3AFCB",
          300: "#7587B1",
          400: "#475F97",
          500: "#1E2A4A",
          600: "#18223B",
          700: "#12192C",
          800: "#0C111E",
          900: "#06080F",
        },
        parchment: {
          DEFAULT: "#F5EDD8",
          light: "#FDF6E8",
          dark: "#E8DFC8",
        },
        amber: {
          DEFAULT: "#D4872A",
          50: "#FDF8F0",
          100: "#FBEFD8",
          200: "#F5D9A8",
          300: "#EFC378",
          400: "#E9AD48",
          500: "#D4872A",
          600: "#AA6C22",
          700: "#7F5119",
          800: "#553611",
          900: "#2A1B08",
        },
        sage: {
          DEFAULT: "#6B7C5E",
          50: "#F4F6F2",
          100: "#E9EDE5",
          200: "#D3DBCB",
          300: "#BDC9B1",
          400: "#94A882",
          500: "#6B7C5E",
          600: "#56634B",
          700: "#404A38",
          800: "#2B3226",
          900: "#151913",
        },
        alert: {
          red: "#B83232",
          green: "#4A7A4A",
        },
        // Semantic colors
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-source-serif)", "serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
