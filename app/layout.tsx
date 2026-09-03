import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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
    default: "Nexus Test Labs | Testing Laboratory Services",
    template: "%s | Nexus Test Labs",
  },

  description:
    "Nexus Test Labs provides professional water testing, food testing, indoor and ambient air quality testing, workplace monitoring, and environmental monitoring services in Hyderabad, Telangana and Andhra Pradesh.",

  keywords: [
    "Nexus Test Labs",
    "Nexus Test Labs Hyderabad",
    "testing laboratory Hyderabad",
    "testing lab Hyderabad",
    "laboratory testing Hyderabad",
    "water testing lab Hyderabad",
    "food testing lab Hyderabad",
    "water testing Hyderabad",
    "food testing Hyderabad",
    "indoor air quality testing Hyderabad",
    "ambient air quality monitoring Hyderabad",
    "workplace monitoring Hyderabad",
    "environmental monitoring Hyderabad",
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
    title: "Nexus Test Labs | Testing Laboratory Services",
    description:
      "Professional laboratory testing services including water, food, air quality, workplace and environmental monitoring in Hyderabad.",
    images: [
      {
        url: "/images/nexus-lab-main.jpg",
        alt: "Nexus Test Labs laboratory testing services",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Nexus Test Labs | Testing Laboratory Services",
    description:
      "Professional laboratory testing services including water, food, air quality, workplace and environmental monitoring in Hyderabad.",
    images: ["/images/nexus-lab-main.jpg"],
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

/* =========================================================
   LOCAL BUSINESS STRUCTURED DATA
========================================================= */

const localBusinessSchema = {
  "@context": "https://schema.org",

  "@type": ["LocalBusiness", "ProfessionalService"],

  "@id":
    "https://nexus-testlabs-hyderabad.vercel.app/#nexus-test-labs-hyderabad",

  name: "Nexus Test Labs Pvt. Ltd.",

  alternateName: "Nexus Test Labs Hyderabad",

  url: "https://nexus-testlabs-hyderabad.vercel.app/",

  logo: "https://nexus-testlabs-hyderabad.vercel.app/nexus-logo.png",

  image:
    "https://nexus-testlabs-hyderabad.vercel.app/images/nexus-lab-main.jpg",

  telephone: "+91-6305820206",

  description:
    "Nexus Test Labs provides professional laboratory testing and environmental monitoring services in Hyderabad, including water testing, food testing, indoor air quality testing, ambient air quality monitoring, workplace monitoring and environmental monitoring.",

  areaServed: [
    {
      "@type": "City",
      name: "Hyderabad",
    },
    {
      "@type": "State",
      name: "Telangana",
    },
    {
      "@type": "State",
      name: "Andhra Pradesh",
    },
  ],

  parentOrganization: {
    "@type": "Organization",
    name: "Nexus Test Labs Pvt. Ltd.",
    url: "https://nexustestlabs.com/",
  },

  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Laboratory Testing Services",

    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Water Testing",
          url:
            "https://nexus-testlabs-hyderabad.vercel.app/services/water-testing",
          areaServed: {
            "@type": "City",
            name: "Hyderabad",
          },
        },
      },

      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Food Testing",
          url:
            "https://nexus-testlabs-hyderabad.vercel.app/services/food-testing",
          areaServed: {
            "@type": "City",
            name: "Hyderabad",
          },
        },
      },

      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Indoor Air Quality Testing",
          url:
            "https://nexus-testlabs-hyderabad.vercel.app/services/indoor-air-quality",
          areaServed: {
            "@type": "City",
            name: "Hyderabad",
          },
        },
      },

      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Ambient Air Quality Monitoring",
          url:
            "https://nexus-testlabs-hyderabad.vercel.app/services/ambient-air-quality",
          areaServed: {
            "@type": "City",
            name: "Hyderabad",
          },
        },
      },

      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Workplace Monitoring",
          url:
            "https://nexus-testlabs-hyderabad.vercel.app/services/workplace-monitoring",
          areaServed: {
            "@type": "City",
            name: "Hyderabad",
          },
        },
      },

      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Environmental Monitoring",
          url:
            "https://nexus-testlabs-hyderabad.vercel.app/services/environmental-monitoring",
          areaServed: {
            "@type": "City",
            name: "Hyderabad",
          },
        },
      },
    ],
  },
};

/* =========================================================
   WEBSITE STRUCTURED DATA
========================================================= */

const websiteSchema = {
  "@context": "https://schema.org",

  "@type": "WebSite",

  "@id":
    "https://nexus-testlabs-hyderabad.vercel.app/#website",

  name: "Nexus Test Labs",

  url: "https://nexus-testlabs-hyderabad.vercel.app/",

  publisher: {
    "@id":
      "https://nexus-testlabs-hyderabad.vercel.app/#nexus-test-labs-hyderabad",
  },

  inLanguage: "en-IN",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        {children}

        <GoogleAnalytics gaId="G-YCBVKE59B9" />
      </body>
    </html>
  );
}