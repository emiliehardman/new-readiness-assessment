import type { StatusKey } from "./scoring";

export const STATUS_COLORS: Record<
  StatusKey,
  { bg: string; border: string; text: string; fill: string }
> = {
  green: { bg: "#EEF3E7", border: "#C9D9B4", text: "#3F5E27", fill: "#5B7F3A" },
  amber: { bg: "#FBF3E1", border: "#E8CE95", text: "#8A5A12", fill: "#C08A2E" },
  red: { bg: "#F7E9E6", border: "#E3B8AE", text: "#7A2E2A", fill: "#A64438" },
  neutral: { bg: "#F1EFE6", border: "#D8D3C4", text: "#4A5A6C", fill: "#9AA5B1" },
};
