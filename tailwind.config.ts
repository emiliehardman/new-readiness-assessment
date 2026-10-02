import type { Config } from "tailwindcss";

// Visual identity: "civic blueprint." Deliberately the opposite of the
// companion Leadership Capacity app on every axis people notice at a
// glance: cool mist and white instead of warm cream, a petrol-teal
// header with a grid pattern instead of muted dusk, a geometric sans for
// headings instead of italic serif, crisp near-square corners instead of
// soft rounding, and crisp saturated status colors instead of earthy ones.
//
// Token NAMES are unchanged from the original theme (ink, paper, brass,
// oxblood, status.*) so no page markup had to change; only their values
// did. "brass" is now a vermilion accent, kept under its old name for
// that reason.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E3B43",
          light: "#1C5560",
          faint: "#4A6670",
        },
        paper: {
          DEFAULT: "#EEF2F2",
          card: "#FFFFFF",
          rule: "#CFD8DA",
        },
        brass: {
          DEFAULT: "#E4572E",
          dark: "#B23A16",
          light: "#F6B8A3",
        },
        oxblood: {
          DEFAULT: "#8E231B",
          light: "#C8372D",
        },
        status: {
          green: "#1B7F5C",
          "green-bg": "#E3F3EC",
          "green-border": "#9FD3BC",
          "green-text": "#12583F",
          amber: "#D97706",
          "amber-bg": "#FDF0DC",
          "amber-border": "#F2C98B",
          "amber-text": "#8A4B04",
          red: "#C8372D",
          "red-bg": "#FBE6E3",
          "red-border": "#EFADA5",
          "red-text": "#8E231B",
        },
      },
      fontFamily: {
        serif: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "4px",
        sm2: "2px",
      },
      boxShadow: {
        paper: "0 1px 0 rgba(14,59,67,0.08), 0 2px 6px rgba(14,59,67,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
