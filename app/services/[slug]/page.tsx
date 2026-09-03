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
  },

  "food-testing": {
    title: "Food Testing",
    shortTitle: "Food Testing",
    subtitle:
      "Laboratory testing support for food businesses, catering operations and institutions.",
    description:
      "Nexus Test Labs provides food testing support for organisations that require chemical, quality and microbiological analysis based on their product and testing requirements.",
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
  },

  "indoor-air-quality": {
    title: "Indoor Air Quality Testing",
    shortTitle: "Indoor Air Quality",
    subtitle:
      "Indoor environmental monitoring support for workplaces and commercial facilities.",
    description:
      "Nexus Test Labs supports organisations with Indoor Air Quality monitoring for offices, hospitals, hotels, commercial buildings and other occupied facilities.",
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
  },

  "ambient-air-quality": {
    title: "Ambient Air Quality Monitoring",
    shortTitle: "Ambient Air Quality",
    subtitle:
      "Environmental air monitoring support for industries and commercial facilities.",
    description:
      "Nexus Test Labs supports ambient air quality monitoring requirements for industries, infrastructure projects and other facilities requiring environmental monitoring.",
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
  },

  "workplace-monitoring": {
    title: "Workplace Monitoring",
    shortTitle: "Workplace Monitoring",
    subtitle:
      "Testing and monitoring solutions designed around workplace environmental requirements.",
    description:
      "Nexus Test Labs supports organisations with workplace monitoring and related environmental testing based on facility and operational requirements.",
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
  },

  "environmental-monitoring": {
    title: "Environmental Monitoring",
    shortTitle: "Environmental Monitoring",
    subtitle:
      "Integrated testing and environmental monitoring support for organisations across multiple sectors.",
    description:
      "Nexus Test Labs supports environmental monitoring requirements through laboratory testing, field monitoring, sample coordination and technical reporting services.",
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

  if (slug === "water-testing") {
    return {
      title: "Water Testing Lab in Hyderabad",
      description:
        "Nexus Test Labs provides water testing services in Hyderabad for drinking water, RO water, domestic water, process water and wastewater requirements. Contact our Hyderabad team for sample coordination, quotations and testing support.",

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
        "water testing Telangana",
        "water testing Andhra Pradesh",
        "Nexus Test Labs Hyderabad",
      ],

      alternates: {
        canonical: "/services/water-testing",
      },

      openGraph: {
        title: "Water Testing Lab in Hyderabad | Nexus Test Labs",
        description:
          "Professional water testing services for drinking water, RO water, domestic water, process water and wastewater requirements in Hyderabad.",
        url: "/services/water-testing",
        type: "website",
        images: [
          {
            url: "/images/nexus-water-testing.jpg",
            alt: "Water Testing at Nexus Test Labs Hyderabad",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: "Water Testing Lab in Hyderabad | Nexus Test Labs",
        description:
          "Professional water testing services for drinking water, RO water, domestic water, process water and wastewater requirements in Hyderabad.",
        images: ["/images/nexus-water-testing.jpg"],
      },
    };
  }

  const service = services[slug as ServiceSlug];

  if (!service) {
    return {
      title: "Testing Services",
      description:
        "Professional laboratory testing and environmental monitoring services from Nexus Test Labs.",
    };
  }

  return {
    title: service.title,
    description: service.description,

    alternates: {
      canonical: `/services/${slug}`,
    },

    openGraph: {
      title: `${service.title} | Nexus Test Labs`,
      description: service.description,
      url: `/services/${slug}`,
      type: "website",
      images: [
        {
          url: service.image,
          alt: `${service.title} at Nexus Test Labs`,
        },
      ],
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
              alt={`${service.title} at Nexus Test Labs`}
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
                Dedicated regional support.
              </span>
            </h2>
          </div>

          <div>
            <p>{service.description}</p>

            <p>
              Our Hyderabad team coordinates client enquiries, quotations,
              sample requirements and testing communication for organisations
              across Hyderabad, Telangana and Andhra Pradesh.
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
              alt="Inside Nexus Test Labs"
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