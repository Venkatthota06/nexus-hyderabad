import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://nexus-testlabs-hyderabad.vercel.app"
  ),

  title: {
    default:
      "Nexus Test Labs | Testing Laboratory Services",
    template:
      "%s | Nexus Test Labs",
  },

  description:
    "Nexus Test Labs provides professional water testing, food testing, indoor and ambient air quality testing, workplace monitoring, and environmental monitoring services.",

  keywords: [
    "Nexus Test Labs",
    "testing laboratory",
    "water testing",
    "food testing",
    "indoor air quality testing",
    "ambient air quality testing",
    "workplace monitoring",
    "environmental monitoring",
    "laboratory testing Hyderabad",
    "water testing Hyderabad",
    "food testing Hyderabad",
    "testing laboratory Telangana",
    "testing laboratory Andhra Pradesh",
  ],

  authors: [
    {
      name: "Nexus Test Labs Pvt. Ltd.",
    },
  ],

  creator: "Nexus Test Labs Pvt. Ltd.",
  publisher: "Nexus Test Labs Pvt. Ltd.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Nexus Test Labs",
    title:
      "Nexus Test Labs | Testing Laboratory Services",
    description:
      "Professional water, food, air quality, workplace, and environmental testing services.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Nexus Test Labs | Testing Laboratory Services",
    description:
      "Professional water, food, air quality, workplace, and environmental testing services.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}