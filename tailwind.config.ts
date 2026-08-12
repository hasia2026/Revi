import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0F0F10",
          900: "#1A1A1C",
          800: "#242426",
          700: "#2E2E31",
          600: "#3C3C40",
          500: "#4A4A50",
          400: "#6B6B72",
          300: "#8E8E96",
          200: "#B8B8C0",
          100: "#E0E0E4",
          50:  "#F4F4F6",
        },
        gold: {
          900: "#5C3F00",
          800: "#7A5500",
          700: "#9A6C00",
          600: "#B8840A",
          500: "#C9931A",
          400: "#D4A832",
          300: "#E2C060",
          200: "#EDD48E",
          100: "#F5E8C0",
          50:  "#FBF5E4",
        },
        // CU³ evolution accents — blue + orange "energy" gradient, per
        // the approved CU³ visual language. Applied module-by-module
        // (Login, Navigation, Dashboard first), not a global theme swap.
        // See docs/Roadmap.md.
        cue: {
          blue: {
            600: "#2563EB",
            500: "#3B82F6",
            400: "#60A5FA",
          },
          purple: {
            500: "#8B5CF6",
            400: "#A78BFA",
          },
          orange: {
            600: "#EA580C",
            500: "#F97316",
            400: "#FB923C",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(201,147,26,0.15)",
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        "cue-glow": "0 0 40px rgba(59,130,246,0.2), 0 0 80px rgba(249,115,22,0.12)",
        "cue-glow-sm": "0 0 16px rgba(59,130,246,0.25), 0 0 32px rgba(249,115,22,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
