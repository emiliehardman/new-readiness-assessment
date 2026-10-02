import type { StatusKey } from "./scoring";

// Crisp, saturated status colors, matching the tailwind.config.ts tokens.
// Every text/background pair here was checked against WCAG AA (4.5:1).
export const STATUS_COLORS: Record<
  StatusKey,
  { bg: string; border: string; text: string; fill: string }
> = {
  green: { bg: "#E3F3EC", border: "#9FD3BC", text: "#12583F", fill: "#1B7F5C" },
  amber: { bg: "#FDF0DC", border: "#F2C98B", text: "#8A4B04", fill: "#D97706" },
  red: { bg: "#FBE6E3", border: "#EFADA5", text: "#8E231B", fill: "#C8372D" },
  neutral: { bg: "#EEF2F2", border: "#CFD8DA", text: "#4A6670", fill: "#8FA3A9" },
};
