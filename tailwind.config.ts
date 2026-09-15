import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16212F",
          light: "#29394B",
          faint: "#4A5A6C",
        },
        paper: {
          DEFAULT: "#F1EFE6",
          card: "#FBFAF5",
          rule: "#D8D3C4",
        },
        brass: {
          DEFAULT: "#B68A3B",
          dark: "#8F6B2B",
          light: "#E4CE9C",
        },
        oxblood: {
          DEFAULT: "#7A2E2A",
          light: "#A64438",
        },
        status: {
          green: "#5B7F3A",
          "green-bg": "#EEF3E7",
          "green-border": "#C9D9B4",
          "green-text": "#3F5E27",
          amber: "#C08A2E",
          "amber-bg": "#FBF3E1",
          "amber-border": "#E8CE95",
          "amber-text": "#8A5A12",
          red: "#A64438",
          "red-bg": "#F7E9E6",
          "red-border": "#E3B8AE",
          "red-text": "#7A2E2A",
        },
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "10px",
        sm2: "6px",
      },
      boxShadow: {
        paper: "0 1px 2px rgba(22,33,47,0.06), 0 1px 0 rgba(22,33,47,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
