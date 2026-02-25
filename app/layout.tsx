import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* Load Inter font from Google Fonts for clean medical typography */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* SEO Metadata */
export const metadata: Metadata = {
  title: "IHDS — Intelligent Healthcare Diagnosis System",
  description:
    "AI-powered kidney disease prediction platform providing trusted medical care with intelligent diagnostics, expert doctors, and personalized healthcare solutions.",
  keywords: [
    "healthcare",
    "kidney disease",
    "AI diagnosis",
    "medical platform",
    "CKD prediction",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
