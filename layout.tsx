import type { Metadata } from "next";
import { Space_Grotesk, Public_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

// Geometric sans for headings (Space Grotesk) in place of the original
// serif, which is the single biggest visual separation from the companion
// Leadership Capacity app's italic serif headings. Public Sans for body,
// a typeface designed for civic and public-sector use; Space Mono for the
// small labels, matched to the heading family.
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Library Change Readiness Assessment",
  description:
    "A diagnostic instrument for academic library leaders to assess organizational readiness for a specific change initiative.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
