import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Library Change Readiness Assessment",
  description:
    "A diagnostic instrument for academic library leaders to assess organizational readiness for a specific change initiative.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={body.variable}>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}