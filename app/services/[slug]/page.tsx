import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Utensils,
  Wind,
  Factory,
  Microscope,
  ShieldCheck,
  Phone,
} from "lucide-react";

const services = {
  "water-testing": {
    title: "Water Testing Lab in Hyderabad",
    shortTitle: "Water Testing",
    subtitle:
      "Professional water testing services for drinking water, RO water, domestic water, process water and wastewater requirements in Hyderabad.",
    description:
      "Nexus Test Labs provides water testing services in Hyderabad for businesses, hospitals, institutions, residential facilities and industries. Our Hyderabad laboratory supports drinking water, RO water, domestic water, process water and wastewater testing requirements.",
    image: "/images/nexus-water-testing.jpg",
    icon: Droplets,

    applications: [
      "Drinking Water",
      "RO Water",
      "Domestic Water",
      "Process Water",
      "Wastewater",
      "Facility Water Quality Monitoring",
    ],

    benefits: [
      "Understand water quality",
      "Support facility compliance requirements",
      "Identify potential quality concerns",
      "Maintain regular monitoring programs",
      "Professional sample coordination",
      "Technical testing support",
    ],

    seoTitle: "Water Testing Lab in Hyderabad",
    seoDescription:
      "Nexus Test Labs provides water testing services in Hyderabad for drinking water, RO water, domestic water, process water and wastewater requirements.",
    keywords: [
      "water testing lab in Hyderabad",
      "water testing Hyderabad",
      "water testing services Hyderabad",
      "water quality testing Hyderabad",
      "drinking water testing Hyderabad",
      "RO water testing Hyderabad",
      "domestic water testing Hyderabad",
      "wastewater testing Hyderabad",
      "water testing laboratory Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
  },

  "food-testing": {
    title: "Food Testing Lab in Hyderabad",
    shortTitle: "Food Testing",
    subtitle:
      "Professional food testing services for food businesses, catering operations, hotels, restaurants and institutions in Hyderabad.",
    description:
      "Nexus Test Labs provides food testing services in Hyderabad for food businesses, catering companies, hotels, restaurants, institutional kitchens and other organisations. Our laboratory supports food quality, chemical and microbiological testing based on product and testing requirements.",
    image: "/images/nexus-food-testing.jpg",
    icon: Utensils,

    applications: [
      "Catering Services",
      "Hotels & Restaurants",
      "Food Manufacturers",
      "Institutional Kitchens",
      "Corporate Catering",
      "Food Quality Monitoring",
    ],

    benefits: [
      "Support food quality programs",
      "Microbiological testing support",
      "Chemical testing support",
      "Routine monitoring coordination",
      "Sample collection support",
      "Professional reporting process",
    ],

    seoTitle: "Food Testing Lab in Hyderabad",
    seoDescription:
      "Nexus Test Labs provides food testing services in Hyderabad for food businesses, catering companies, hotels, restaurants and institutions, including food quality, chemical and microbiological testing support.",
    keywords: [
      "food testing lab in Hyderabad",
      "food testing Hyderabad",
      "food testing services Hyderabad",
      "food quality testing Hyderabad",
      "food microbiological testing Hyderabad",
      "food chemical testing Hyderabad",
      "catering food testing Hyderabad",
      "food testing laboratory Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
  },

  "indoor-air-quality": {
    title: "Indoor Air Quality Testing in Hyderabad",
    shortTitle: "Indoor Air Quality",
    subtitle:
      "Professional indoor air quality testing and monitoring services for offices, hospitals, hotels and commercial facilities in Hyderabad.",
    description:
      "Nexus Test Labs provides Indoor Air Quality testing and monitoring services in Hyderabad for corporate offices, hospitals, IT parks, hotels, commercial buildings and educational institutions. Our team supports organisations with indoor environmental monitoring based on facility requirements.",
    image: "/images/nexus-environmental-testing.jpg",
    icon: Wind,

    applications: [
      "Corporate Offices",
      "Hospitals",
      "IT Parks",
      "Hotels",
      "Commercial Buildings",
      "Educational Institutions",
    ],

    benefits: [
      "Understand indoor environmental conditions",
      "Support workplace monitoring",
      "Identify potential air quality concerns",
      "Improve facility monitoring programs",
      "Professional field coordination",
      "Technical reporting support",
    ],

    seoTitle: "Indoor Air Quality Testing in Hyderabad",
    seoDescription:
      "Indoor Air Quality testing and monitoring services in Hyderabad for offices, hospitals, IT parks, hotels and commercial facilities from Nexus Test Labs.",
    keywords: [
      "indoor air quality testing Hyderabad",
      "IAQ testing Hyderabad",
      "indoor air quality monitoring Hyderabad",
      "air quality testing Hyderabad",
      "office air quality testing Hyderabad",
      "workplace air quality testing Hyderabad",
      "indoor environmental monitoring Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
  },

  "ambient-air-quality": {
    title: "Ambient Air Quality Monitoring in Hyderabad",
    shortTitle: "Ambient Air Quality",
    subtitle:
      "Professional ambient air quality monitoring services for industries, infrastructure projects and commercial facilities in Hyderabad.",
    description:
      "Nexus Test Labs provides ambient air quality monitoring services in Hyderabad for manufacturing units, industrial facilities, infrastructure projects and commercial organisations requiring environmental air monitoring.",
    image: "/images/nexus-environmental-testing.jpg",
    icon: Factory,

    applications: [
      "Manufacturing Units",
      "Industrial Facilities",
      "Infrastructure Projects",
      "Commercial Facilities",
      "Environmental Monitoring Programs",
      "Workplace Locations",
    ],

    benefits: [
      "Environmental monitoring support",
      "Professional field sampling",
      "Routine monitoring coordination",
      "Technical testing support",
      "Structured reporting",
      "Regional coordination",
    ],

    seoTitle: "Ambient Air Quality Monitoring in Hyderabad",
    seoDescription:
      "Ambient air quality monitoring services in Hyderabad for industries, manufacturing units, infrastructure projects and commercial facilities from Nexus Test Labs.",
    keywords: [
      "ambient air quality monitoring Hyderabad",
      "ambient air testing Hyderabad",
      "AAQ monitoring Hyderabad",
      "air quality monitoring Hyderabad",
      "environmental air monitoring Hyderabad",
      "industrial air quality monitoring Hyderabad",
      "ambient air quality testing Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
  },

  "workplace-monitoring": {
    title: "Workplace Monitoring Services in Hyderabad",
    shortTitle: "Workplace Monitoring",
    subtitle:
      "Professional workplace environmental monitoring services for corporate facilities, factories, hospitals and industrial workplaces in Hyderabad.",
    description:
      "Nexus Test Labs provides workplace monitoring services in Hyderabad for corporate facilities, factories, pharmaceutical units, hospitals, commercial buildings and industrial workplaces based on facility and operational requirements.",
    image: "/images/nexus-lab-main.jpg",
    icon: Microscope,

    applications: [
      "Corporate Facilities",
      "Factories",
      "Pharmaceutical Units",
      "Hospitals",
      "Commercial Buildings",
      "Industrial Workplaces",
    ],

    benefits: [
      "Workplace environmental assessment",
      "Monitoring program support",
      "Field sampling coordination",
      "Laboratory testing support",
      "Professional documentation",
      "Regional client support",
    ],

    seoTitle: "Workplace Monitoring Services in Hyderabad",
    seoDescription:
      "Professional workplace environmental monitoring services in Hyderabad for corporate facilities, factories, hospitals, pharmaceutical units and industrial workplaces.",
    keywords: [
      "workplace monitoring Hyderabad",
      "workplace monitoring services Hyderabad",
      "workplace environmental monitoring Hyderabad",
      "industrial workplace monitoring Hyderabad",
      "workplace environmental testing Hyderabad",
      "occupational environment monitoring Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
  },

  "environmental-monitoring": {
    title: "Environmental Monitoring Services in Hyderabad",
    shortTitle: "Environmental Monitoring",
    subtitle:
      "Professional environmental monitoring services for industries, hospitals, commercial facilities and infrastructure projects in Hyderabad.",
    description:
      "Nexus Test Labs provides environmental monitoring services in Hyderabad through field monitoring, laboratory testing, sample coordination and technical reporting for industries, hospitals, pharmaceutical companies, infrastructure projects and other facilities.",
    image: "/images/nexus-environmental-testing.jpg",
    icon: ShieldCheck,

    applications: [
      "Industries",
      "Hospitals",
      "Commercial Facilities",
      "Pharmaceutical Companies",
      "Infrastructure Projects",
      "Institutional Facilities",
    ],

    benefits: [
      "Integrated monitoring support",
      "Field and laboratory coordination",
      "Professional sample handling",
      "Structured testing process",
      "Technical reporting support",
      "Regional client coordination",
    ],

    seoTitle: "Environmental Monitoring Services in Hyderabad",
    seoDescription:
      "Environmental monitoring services in Hyderabad for industries, hospitals, pharmaceutical companies, commercial facilities and infrastructure projects from Nexus Test Labs.",
    keywords: [
      "environmental monitoring Hyderabad",
      "environmental monitoring services Hyderabad",
      "environmental testing Hyderabad",
      "environmental testing lab Hyderabad",
      "industrial environmental monitoring Hyderabad",
      "environmental laboratory Hyderabad",
      "environmental monitoring Telangana",
      "Nexus Test Labs Hyderabad",
    ],
  },
};

type ServiceSlug = keyof typeof services;

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({
    slug,
  }));
}

/* =========================================================
   SERVICE PAGE SEO
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const service = services[slug as ServiceSlug];

  if (!service) {
    return {
      title: "Testing Services",
      description:
        "Professional laboratory testing and environmental monitoring services from Nexus Test Labs.",
    };
  }

  return {
    title: service.seoTitle,

    description: service.seoDescription,

    keywords: service.keywords,

    alternates: {
      canonical: `/services/${slug}`,
    },

    openGraph: {
      title: `${service.seoTitle} | Nexus Test Labs`,
      description: service.seoDescription,
      url: `/services/${slug}`,
      type: "website",

      images: [
        {
          url: service.image,
          alt: `${service.shortTitle} at Nexus Test Labs Hyderabad`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${service.seoTitle} | Nexus Test Labs`,
      description: service.seoDescription,
      images: [service.image],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const service = services[slug as ServiceSlug];

  if (!service) {
    return (
      <main className="service-not-found">
        <h1>Service not found</h1>

        <Link href="/">
          <ArrowLeft size={17} />
          Return Home
        </Link>
      </main>
    );
  }

  const Icon = service.icon;

  return (
    <main className="service-detail-page">
      {/* NAVBAR */}

      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="brand">
            <img src="/nexus-logo.png" alt="Nexus Test Labs Pvt. Ltd." />
          </Link>

          <nav className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#industries">Industries</Link>
            <Link href="/#about">About</Link>
            <Link href="/#contact">Contact</Link>
          </nav>

          <Link href="/#contact" className="quote-btn">
            Get Quote
            <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      {/* HERO */}

      <section className="service-detail-hero">
        <div className="service-detail-orb" />

        <div className="container service-detail-hero-grid">
          <div className="service-detail-content">
            <Link href="/#services" className="service-back-link">
              <ArrowLeft size={16} />
              All Services
            </Link>

            <div className="service-detail-icon">
              <Icon size={27} />
            </div>

            <span className="eyebrow">Nexus Test Labs Pvt. Ltd.</span>

            <h1>{service.title}</h1>

            <p>{service.subtitle}</p>

            <div className="service-detail-actions">
              <Link href="/#contact" className="primary-btn">
                Request a Quote
                <ArrowRight size={18} />
              </Link>

              <a href="tel:+916305820206" className="secondary-btn">
                <Phone size={17} />
                Call Us
              </a>
            </div>
          </div>

          <div className="service-detail-image-wrap">
            <img
              src={service.image}
              alt={`${service.shortTitle} at Nexus Test Labs Hyderabad`}
            />

            <div className="service-image-label">
              <CheckCircle2 size={18} />
              Nexus Test Labs
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}

      <section className="service-overview-section">
        <div className="container service-overview-grid">
          <div>
            <span className="eyebrow">Service Overview</span>

            <h2>
              Professional testing.
              <br />
              <span className="heading-highlight">
                Dedicated Hyderabad support.
              </span>
            </h2>
          </div>

          <div>
            <p>{service.description}</p>

            <p>
              Our Hyderabad team coordinates client enquiries, quotations,
              sample requirements, laboratory testing and communication for
              organisations across Hyderabad, Telangana and Andhra Pradesh.
            </p>
          </div>
        </div>
      </section>

      {/* APPLICATIONS */}

      <section className="service-applications-section">
        <div className="container">
          <div className="service-section-heading">
            <span className="eyebrow">Applications</span>

            <h2>Where this service can be used</h2>
          </div>

          <div className="service-application-grid">
            {service.applications.map((item, index) => (
              <div className="service-application-card" key={item}>
                <span>0{index + 1}</span>

                <div>
                  <CheckCircle2 size={18} />
                  <strong>{item}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="service-benefits-section">
        <div className="container service-benefits-grid">
          <div className="service-benefits-image">
            <img
              src="/images/nexus-lab-main.jpg"
              alt="Nexus Test Labs laboratory testing facility"
            />

            <div className="service-benefit-floating">
              <ShieldCheck size={23} />

              <div>
                <strong>Professional Testing</strong>
                <span>Laboratory & field coordination</span>
              </div>
            </div>
          </div>

          <div className="service-benefits-content">
            <span className="eyebrow">Why Testing Matters</span>

            <h2>
              Build a stronger
              <br />
              <span className="heading-highlight">
                monitoring process.
              </span>
            </h2>

            <div className="service-benefit-list">
              {service.benefits.map((benefit) => (
                <div key={benefit}>
                  <CheckCircle2 size={19} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}

      <section className="service-process-section">
        <div className="container">
          <div className="service-section-heading center">
            <span className="eyebrow">How It Works</span>

            <h2>A simple testing coordination process</h2>
          </div>

          <div className="service-process-grid">
            {[
              [
                "01",
                "Share Requirement",
                "Tell us the testing service you require.",
              ],
              [
                "02",
                "Quotation",
                "Our team coordinates the testing scope and quotation.",
              ],
              [
                "03",
                "Sample Coordination",
                "Sample collection or submission is coordinated as required.",
              ],
              [
                "04",
                "Testing & Report",
                "Testing is processed and reports are coordinated with the client.",
              ],
            ].map(([number, title, text]) => (
              <div className="service-process-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="service-final-cta">
        <div className="container service-final-cta-inner">
          <div>
            <span>Need {service.shortTitle}?</span>

            <h2>Discuss your requirement with Nexus Test Labs.</h2>

            <p>
              Laboratory testing and client support for Hyderabad, Telangana
              and Andhra Pradesh.
            </p>
          </div>

          <Link href="/#contact" className="service-final-button">
            Request a Quote
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="service-footer">
        <div className="container service-footer-inner">
          <div>
            <strong>Nexus Test Labs Pvt. Ltd.</strong>
            <span>Testing & Environmental Monitoring Services</span>
          </div>

          <Link href="/">Back to Homepage</Link>
        </div>
      </footer>
    </main>
  );
}