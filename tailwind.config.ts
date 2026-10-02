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
          DEFAULT: "#173B40",
          light: "#24545A",
          faint: "#5C7073",
        },
        paper: {
          DEFAULT: "#F5F7F6",
          card: "#FFFFFF",
          rule: "#D9E0DE",
        },
        brass: {
          DEFAULT: "#B6634F",
          dark: "#95503F",
          light: "#E8C8BF",
        },
        oxblood: {
          DEFAULT: "#8E352D",
          light: "#B94D43",
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
        serif: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        sm2: "7px",
      },
      boxShadow: {
        paper: "0 1px 2px rgba(23,59,64,0.04), 0 8px 24px rgba(23,59,64,0.035)",
      },
    },
  },
  plugins: [],
};

export default config;