import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  FlaskConical,
  HeartPulse,
  Hotel,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const industries = {
  hospitals: {
    title: "Testing Services for Hospitals in Hyderabad",
    shortTitle: "Hospitals",
    subtitle:
      "Laboratory testing and environmental monitoring support for hospitals, healthcare facilities and diagnostic centres in Hyderabad.",
    description:
      "Nexus Test Labs supports hospitals and healthcare facilities in Hyderabad with water testing, Indoor Air Quality monitoring, food testing and environmental monitoring requirements based on facility needs.",
    icon: HeartPulse,
    image: "/images/nexus-lab-main.jpg",
    needs: [
      "Drinking and utility water monitoring",
      "RO and treated water testing",
      "Indoor Air Quality monitoring",
      "Food and kitchen sample testing",
      "Environmental monitoring support",
      "Routine facility testing coordination",
    ],
    relevantServices: [
      "water-testing",
      "indoor-air-quality",
      "food-testing",
      "environmental-monitoring",
    ],
    seoTitle: "Testing Services for Hospitals in Hyderabad",
    seoDescription:
      "Testing services for hospitals in Hyderabad including water testing, Indoor Air Quality monitoring, food testing and environmental monitoring from Nexus Test Labs.",
    keywords: [
      "hospital testing services Hyderabad",
      "water testing for hospitals Hyderabad",
      "hospital water testing Hyderabad",
      "IAQ testing hospitals Hyderabad",
      "hospital environmental monitoring Hyderabad",
      "food testing hospitals Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    faqs: [
      {
        question: "What testing services can Nexus Test Labs support for hospitals?",
        answer:
          "We can support hospital requirements such as water testing, Indoor Air Quality monitoring, food testing and environmental monitoring depending on the facility scope.",
      },
      {
        question: "Can hospital drinking water and RO water be tested?",
        answer:
          "Yes. Drinking water, RO water and other facility water samples can be coordinated for testing based on the required parameters.",
      },
      {
        question: "Do you support Indoor Air Quality testing for hospitals?",
        answer:
          "Yes. Indoor Air Quality monitoring can be coordinated for healthcare facilities based on the required scope and areas to be assessed.",
      },
      {
        question: "Can hospital kitchen food samples be tested?",
        answer:
          "Yes. Food and prepared-food samples can be coordinated for testing depending on the required parameters and client requirement.",
      },
      {
        question: "How can a hospital request a quotation?",
        answer:
          "Share the facility location, required services, number of samples and testing scope with our team. We can review the requirement and coordinate a quotation.",
      },
    ],
  },

  "hotels-restaurants": {
    title: "Testing Services for Hotels & Restaurants in Hyderabad",
    shortTitle: "Hotels & Restaurants",
    subtitle:
      "Professional testing support for hotels, restaurants, catering operations and hospitality facilities in Hyderabad.",
    description:
      "Nexus Test Labs supports hotels, restaurants and hospitality businesses in Hyderabad with water testing, food testing, Indoor Air Quality monitoring and environmental monitoring requirements.",
    icon: Hotel,
    image: "/images/nexus-food-testing.jpg",
    needs: [
      "Drinking and kitchen water testing",
      "RO water quality monitoring",
      "Food quality testing",
      "Prepared-food sample testing",
      "Indoor Air Quality monitoring",
      "Routine facility testing programs",
    ],
    relevantServices: [
      "food-testing",
      "water-testing",
      "indoor-air-quality",
      "environmental-monitoring",
    ],
    seoTitle: "Testing Services for Hotels & Restaurants in Hyderabad",
    seoDescription:
      "Testing services for hotels and restaurants in Hyderabad including food testing, water testing, Indoor Air Quality monitoring and environmental monitoring.",
    keywords: [
      "hotel testing services Hyderabad",
      "restaurant testing services Hyderabad",
      "food testing hotels Hyderabad",
      "water testing hotels Hyderabad",
      "food testing restaurants Hyderabad",
      "IAQ testing hotels Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    faqs: [
      {
        question: "What testing services are useful for hotels and restaurants?",
        answer:
          "Common requirements can include food testing, drinking water testing, RO water testing, Indoor Air Quality monitoring and other facility monitoring services.",
      },
      {
        question: "Can prepared food samples from restaurants be tested?",
        answer:
          "Yes. Prepared food and catering samples can be coordinated for testing depending on the required parameters and purpose.",
      },
      {
        question: "Do you provide water testing for hotels in Hyderabad?",
        answer:
          "Yes. Nexus Test Labs supports drinking water, RO water and other facility water testing requirements for hotels and hospitality businesses in Hyderabad.",
      },
      {
        question: "Can hotels arrange regular testing programs?",
        answer:
          "Yes. Routine testing and monitoring schedules can be coordinated based on the facility's internal requirements.",
      },
      {
        question: "How do we request a quotation?",
        answer:
          "Share the facility type, required service, sample details and testing requirement. Our team can review the scope and coordinate a quotation.",
      },
    ],
  },

  "corporate-offices": {
    title: "Testing Services for Corporate Offices in Hyderabad",
    shortTitle: "Corporate Offices",
    subtitle:
      "Indoor environmental monitoring and water testing support for offices, IT parks, business centres and corporate facilities in Hyderabad.",
    description:
      "Nexus Test Labs supports corporate offices and commercial workplaces in Hyderabad with Indoor Air Quality testing, workplace monitoring, water testing and environmental monitoring requirements.",
    icon: Building2,
    image: "/images/nexus-environmental-testing.jpg",
    needs: [
      "Indoor Air Quality monitoring",
      "Workplace environmental monitoring",
      "Drinking water testing",
      "RO water testing",
      "Facility environmental monitoring",
      "Routine monitoring coordination",
    ],
    relevantServices: [
      "indoor-air-quality",
      "workplace-monitoring",
      "water-testing",
      "environmental-monitoring",
    ],
    seoTitle: "Testing Services for Corporate Offices in Hyderabad",
    seoDescription:
      "Testing services for corporate offices in Hyderabad including Indoor Air Quality testing, workplace monitoring, water testing and environmental monitoring.",
    keywords: [
      "corporate office testing Hyderabad",
      "IAQ testing offices Hyderabad",
      "office air quality testing Hyderabad",
      "workplace monitoring Hyderabad",
      "office water testing Hyderabad",
      "IT park environmental monitoring Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    faqs: [
      {
        question: "What testing services can corporate offices use?",
        answer:
          "Corporate facilities can use services such as Indoor Air Quality monitoring, workplace monitoring, drinking water testing, RO water testing and environmental monitoring.",
      },
      {
        question: "Do you provide Indoor Air Quality testing for offices?",
        answer:
          "Yes. Nexus Test Labs supports Indoor Air Quality monitoring requirements for offices, IT parks and commercial facilities in Hyderabad.",
      },
      {
        question: "Can office drinking water be tested?",
        answer:
          "Yes. Drinking water and RO water samples can be coordinated for laboratory testing based on the required testing scope.",
      },
      {
        question: "Can workplace monitoring be done at our office?",
        answer:
          "Yes. Field monitoring can be coordinated depending on the facility, required parameters and agreed monitoring scope.",
      },
      {
        question: "How can a facility team request a quotation?",
        answer:
          "Share your office location, required service, monitoring scope and sample requirement. Our team can coordinate the quotation and next steps.",
      },
    ],
  },

  manufacturing: {
    title: "Testing Services for Manufacturing Industries in Hyderabad",
    shortTitle: "Manufacturing",
    subtitle:
      "Environmental monitoring, workplace monitoring and water testing support for manufacturing and industrial facilities in Hyderabad.",
    description:
      "Nexus Test Labs supports manufacturing units and industrial facilities in Hyderabad with ambient air monitoring, workplace monitoring, water testing and environmental monitoring requirements.",
    icon: Factory,
    image: "/images/nexus-environmental-testing.jpg",
    needs: [
      "Ambient Air Quality monitoring",
      "Workplace environmental monitoring",
      "Process water testing",
      "Wastewater testing",
      "Environmental monitoring",
      "Field and laboratory coordination",
    ],
    relevantServices: [
      "ambient-air-quality",
      "workplace-monitoring",
      "environmental-monitoring",
      "water-testing",
    ],
    seoTitle: "Testing Services for Manufacturing Industries in Hyderabad",
    seoDescription:
      "Testing and environmental monitoring services for manufacturing industries in Hyderabad including ambient air, workplace monitoring, water testing and environmental monitoring.",
    keywords: [
      "industrial testing services Hyderabad",
      "manufacturing environmental monitoring Hyderabad",
      "ambient air monitoring industries Hyderabad",
      "workplace monitoring factories Hyderabad",
      "industrial water testing Hyderabad",
      "wastewater testing industries Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    faqs: [
      {
        question: "What services can Nexus Test Labs support for manufacturing units?",
        answer:
          "We can support ambient air monitoring, workplace environmental monitoring, water testing, wastewater testing and broader environmental monitoring requirements.",
      },
      {
        question: "Can ambient air monitoring be arranged at a factory?",
        answer:
          "Yes. Ambient Air Quality monitoring can be coordinated at industrial and manufacturing sites depending on the required scope.",
      },
      {
        question: "Can process water and wastewater be tested?",
        answer:
          "Yes. Process water and wastewater samples can be coordinated for testing based on client requirements and selected parameters.",
      },
      {
        question: "Do you support workplace environmental monitoring?",
        answer:
          "Yes. Workplace monitoring can be coordinated for industrial locations based on the agreed parameters and monitoring plan.",
      },
      {
        question: "How can an industrial facility request a quotation?",
        answer:
          "Share the facility location, service requirement, number of monitoring points or samples and required scope. Our team can review the details and coordinate a quotation.",
      },
    ],
  },

  pharmaceutical: {
    title: "Testing Services for Pharmaceutical Facilities in Hyderabad",
    shortTitle: "Pharmaceutical",
    subtitle:
      "Water testing, workplace monitoring and environmental monitoring support for pharmaceutical facilities in Hyderabad.",
    description:
      "Nexus Test Labs supports pharmaceutical and life-sciences facilities in Hyderabad with water testing, workplace monitoring, Indoor Air Quality monitoring and environmental monitoring requirements based on facility scope.",
    icon: FlaskConical,
    image: "/images/nexus-lab-main.jpg",
    needs: [
      "Water quality testing",
      "RO and treated water monitoring",
      "Workplace environmental monitoring",
      "Indoor Air Quality monitoring",
      "Environmental monitoring",
      "Testing and reporting coordination",
    ],
    relevantServices: [
      "water-testing",
      "workplace-monitoring",
      "indoor-air-quality",
      "environmental-monitoring",
    ],
    seoTitle: "Testing Services for Pharmaceutical Facilities in Hyderabad",
    seoDescription:
      "Testing services for pharmaceutical facilities in Hyderabad including water testing, workplace monitoring, Indoor Air Quality and environmental monitoring.",
    keywords: [
      "pharmaceutical testing services Hyderabad",
      "pharma water testing Hyderabad",
      "pharma environmental monitoring Hyderabad",
      "workplace monitoring pharma Hyderabad",
      "IAQ testing pharmaceutical Hyderabad",
      "pharma facility testing Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    faqs: [
      {
        question: "What testing services can pharmaceutical facilities use?",
        answer:
          "Depending on facility requirements, services can include water testing, workplace monitoring, Indoor Air Quality monitoring and environmental monitoring.",
      },
      {
        question: "Can RO and treated water samples be tested?",
        answer:
          "Yes. RO water and other treated water samples can be coordinated for testing based on the required parameters.",
      },
      {
        question: "Do you support environmental monitoring for pharmaceutical facilities?",
        answer:
          "Yes. Environmental monitoring requirements can be reviewed and coordinated based on the facility and agreed testing scope.",
      },
      {
        question: "Can workplace monitoring be arranged at the site?",
        answer:
          "Yes. Field monitoring can be coordinated based on the required parameters, site conditions and agreed scope.",
      },
      {
        question: "How do we request a quotation?",
        answer:
          "Share the facility location, service requirement, sample details and monitoring scope. Our team can review the requirement and coordinate the quotation.",
      },
    ],
  },

  "residential-commercial": {
    title: "Testing Services for Residential & Commercial Facilities in Hyderabad",
    shortTitle: "Residential & Commercial",
    subtitle:
      "Water testing and environmental monitoring support for apartments, gated communities and commercial buildings in Hyderabad.",
    description:
      "Nexus Test Labs supports residential communities and commercial buildings in Hyderabad with drinking water testing, RO water testing, Indoor Air Quality monitoring and environmental monitoring requirements.",
    icon: Stethoscope,
    image: "/images/nexus-water-testing.jpg",
    needs: [
      "Drinking water testing",
      "RO water testing",
      "Domestic water quality monitoring",
      "Indoor Air Quality monitoring",
      "Facility environmental monitoring",
      "Routine testing coordination",
    ],
    relevantServices: [
      "water-testing",
      "indoor-air-quality",
      "environmental-monitoring",
      "workplace-monitoring",
    ],
    seoTitle: "Testing Services for Residential & Commercial Facilities in Hyderabad",
    seoDescription:
      "Testing services for residential and commercial facilities in Hyderabad including drinking water, RO water, Indoor Air Quality and environmental monitoring.",
    keywords: [
      "apartment water testing Hyderabad",
      "residential water testing Hyderabad",
      "commercial building water testing Hyderabad",
      "IAQ testing apartments Hyderabad",
      "facility testing services Hyderabad",
      "gated community water testing Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    faqs: [
      {
        question: "What testing services are available for residential facilities?",
        answer:
          "Residential and commercial facilities can use drinking water testing, RO water testing, Indoor Air Quality monitoring and environmental monitoring services depending on their requirements.",
      },
      {
        question: "Can apartment drinking water be tested?",
        answer:
          "Yes. Drinking water, domestic water and RO water samples can be coordinated for testing based on the required scope.",
      },
      {
        question: "Do you support gated communities in Hyderabad?",
        answer:
          "Yes. Nexus Test Labs can support testing requirements for apartments, gated communities and commercial facilities in Hyderabad.",
      },
      {
        question: "Can Indoor Air Quality monitoring be arranged?",
        answer:
          "Yes. Indoor Air Quality monitoring can be coordinated for common areas, commercial buildings and other occupied spaces depending on the requirement.",
      },
      {
        question: "How can a facility manager request a quotation?",
        answer:
          "Share the facility location, type of testing required, number of samples and testing scope. Our team can review the requirement and coordinate a quotation.",
      },
    ],
  },
};

const serviceNames: Record<string, string> = {
  "water-testing": "Water Testing",
  "food-testing": "Food Testing",
  "indoor-air-quality": "Indoor Air Quality",
  "ambient-air-quality": "Ambient Air Quality",
  "workplace-monitoring": "Workplace Monitoring",
  "environmental-monitoring": "Environmental Monitoring",
};

type IndustrySlug = keyof typeof industries;

export function generateStaticParams() {
  return Object.keys(industries).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries[slug as IndustrySlug];

  if (!industry) {
    return {
      title: "Industries",
      description:
        "Industry testing and environmental monitoring services from Nexus Test Labs.",
    };
  }

  return {
    title: industry.seoTitle,
    description: industry.seoDescription,
    keywords: industry.keywords,
    alternates: {
      canonical: `/industries/${slug}`,
    },
    openGraph: {
      title: `${industry.seoTitle} | Nexus Test Labs`,
      description: industry.seoDescription,
      url: `/industries/${slug}`,
      type: "website",
      images: [
        {
          url: industry.image,
          alt: `${industry.shortTitle} testing services from Nexus Test Labs`,
        },
      ],
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = industries[slug as IndustrySlug];

  if (!industry) {
    return (
      <main className="industry-not-found">
        <h1>Industry not found</h1>
        <Link href="/">
          <ArrowLeft size={17} />
          Return Home
        </Link>
      </main>
    );
  }

  const Icon = industry.icon;

  return (
    <main className="industry-page">
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

      <section className="industry-hero">
        <div className="container industry-hero-grid">
          <div>
            <Link href="/#industries" className="industry-back">
              <ArrowLeft size={16} />
              All Industries
            </Link>

            <div className="industry-icon">
              <Icon size={28} />
            </div>

            <span className="eyebrow">Industry Testing Solutions</span>

            <h1>{industry.title}</h1>

            <p>{industry.subtitle}</p>

            <div className="industry-actions">
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

          <div className="industry-hero-image">
            <img
              src={industry.image}
              alt={`${industry.shortTitle} testing services from Nexus Test Labs`}
            />

            <div className="industry-image-badge">
              <ShieldCheck size={19} />
              Nexus Test Labs
            </div>
          </div>
        </div>
      </section>

      <section className="industry-overview">
        <div className="container industry-overview-grid">
          <div>
            <span className="eyebrow">Industry Support</span>

            <h2>
              Testing support built around
              <span> your facility requirements.</span>
            </h2>
          </div>

          <div>
            <p>{industry.description}</p>

            <p>
              Our team supports enquiries, quotations, sample coordination,
              field monitoring and laboratory testing for organisations across
              Hyderabad, Telangana and Andhra Pradesh.
            </p>
          </div>
        </div>
      </section>

      <section className="industry-needs">
        <div className="container">
          <div className="industry-section-heading">
            <span className="eyebrow">Typical Requirements</span>
            <h2>Testing needs for {industry.shortTitle}</h2>
          </div>

          <div className="industry-needs-grid">
            {industry.needs.map((need) => (
              <div className="industry-need-card" key={need}>
                <CheckCircle2 size={19} />
                <span>{need}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="industry-services">
        <div className="container">
          <div className="industry-section-heading center">
            <span className="eyebrow">Relevant Services</span>
            <h2>Services commonly used by {industry.shortTitle}</h2>
          </div>

          <div className="industry-service-grid">
            {industry.relevantServices.map((serviceSlug) => (
              <Link
                href={`/services/${serviceSlug}`}
                className="industry-service-card"
                key={serviceSlug}
              >
                <div>
                  <span>Testing Service</span>
                  <h3>{serviceNames[serviceSlug]}</h3>
                </div>

                <ArrowRight size={20} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="industry-faq">
        <div className="container">
          <div className="industry-section-heading center">
            <span className="eyebrow">Frequently Asked Questions</span>
            <h2>Questions about testing for {industry.shortTitle}</h2>
          </div>

          <div className="industry-faq-list">
            {industry.faqs.map((faq) => (
              <details className="industry-faq-item" key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <span className="industry-faq-plus">+</span>
                </summary>

                <div className="industry-faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="industry-cta">
        <div className="container industry-cta-inner">
          <div>
            <span>Need testing support?</span>
            <h2>Discuss your {industry.shortTitle} testing requirement.</h2>
            <p>
              Nexus Test Labs can coordinate the appropriate testing scope,
              quotation and next steps for your facility.
            </p>
          </div>

          <Link href="/#contact" className="industry-cta-button">
            Request a Quote
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="service-footer">
        <div className="container service-footer-inner">
          <div>
            <strong>Nexus Test Labs Pvt. Ltd.</strong>
            <span>Testing & Environmental Monitoring Services</span>
          </div>

          <Link href="/">Back to Homepage</Link>
        </div>
      </footer>

      <style>{`
        .industry-hero {
          padding: 110px 0 90px;
          background:
            radial-gradient(circle at 15% 10%, rgba(37, 99, 235, 0.09), transparent 30%),
            linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
        }

        .industry-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
          gap: 70px;
          align-items: center;
        }

        .industry-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 28px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .industry-icon {
          display: grid;
          width: 56px;
          height: 56px;
          place-items: center;
          margin-bottom: 20px;
          border-radius: 16px;
          background: #eff6ff;
          color: #2563eb;
        }

        .industry-hero h1 {
          max-width: 760px;
          margin: 12px 0 22px;
          color: #0f172a;
          font-size: clamp(42px, 5.5vw, 68px);
          line-height: 1.02;
          letter-spacing: -0.045em;
        }

        .industry-hero p {
          max-width: 690px;
          margin: 0;
          color: #64748b;
          font-size: 18px;
          line-height: 1.8;
        }

        .industry-actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .industry-hero-image {
          position: relative;
        }

        .industry-hero-image img {
          width: 100%;
          min-height: 450px;
          object-fit: cover;
          border-radius: 26px;
          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.15);
        }

        .industry-image-badge {
          position: absolute;
          right: 20px;
          bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.94);
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
        }

        .industry-overview {
          padding: 94px 0;
          background: #ffffff;
        }

        .industry-overview-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 75px;
        }

        .industry-overview h2 {
          margin: 12px 0 0;
          color: #0f172a;
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.035em;
        }

        .industry-overview h2 span {
          color: #2563eb;
        }

        .industry-overview p {
          margin: 0 0 18px;
          color: #64748b;
          font-size: 16px;
          line-height: 1.85;
        }

        .industry-needs {
          padding: 94px 0;
          background: #f8fafc;
        }

        .industry-section-heading {
          max-width: 720px;
          margin-bottom: 38px;
        }

        .industry-section-heading.center {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .industry-section-heading h2 {
          margin: 10px 0 0;
          color: #0f172a;
          font-size: clamp(31px, 4vw, 44px);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .industry-needs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .industry-need-card {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 88px;
          padding: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 16px;
          background: #ffffff;
          color: #0f172a;
          font-size: 15px;
          font-weight: 650;
          box-shadow: 0 7px 22px rgba(15, 23, 42, 0.04);
        }

        .industry-need-card svg {
          flex: 0 0 auto;
          color: #16a34a;
        }

        .industry-services {
          padding: 94px 0;
          background: #ffffff;
        }

        .industry-service-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          max-width: 900px;
          margin: 0 auto;
        }

        .industry-service-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          min-height: 135px;
          padding: 23px;
          border: 1px solid rgba(37, 99, 235, 0.11);
          border-radius: 18px;
          background: linear-gradient(145deg, #ffffff, #f8fbff);
          text-decoration: none;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
          transition: 0.25s ease;
        }

        .industry-service-card:hover {
          transform: translateY(-4px);
          border-color: rgba(37, 99, 235, 0.24);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
        }

        .industry-service-card span {
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .industry-service-card h3 {
          margin: 7px 0 0;
          color: #0f172a;
          font-size: 20px;
        }

        .industry-service-card > svg {
          flex: 0 0 auto;
          color: #2563eb;
        }

        .industry-faq {
          padding: 96px 0;
          background:
            radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.06), transparent 34%),
            #f8fafc;
        }

        .industry-faq-list {
          width: min(860px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .industry-faq-item {
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.09);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.045);
        }

        .industry-faq-item summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 22px 24px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 650;
        }

        .industry-faq-item summary::-webkit-details-marker {
          display: none;
        }

        .industry-faq-plus {
          display: grid;
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          place-items: center;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 23px;
          transition: 0.25s ease;
        }

        .industry-faq-item[open] .industry-faq-plus {
          transform: rotate(45deg);
          background: #2563eb;
          color: #ffffff;
        }

        .industry-faq-answer {
          padding: 0 72px 22px 24px;
        }

        .industry-faq-answer p {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.8;
        }

        .industry-cta {
          padding: 86px 0;
          background: #0f172a;
        }

        .industry-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
        }

        .industry-cta span {
          color: #93c5fd;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .industry-cta h2 {
          max-width: 700px;
          margin: 10px 0 13px;
          color: #ffffff;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .industry-cta p {
          max-width: 680px;
          margin: 0;
          color: #cbd5e1;
          line-height: 1.75;
        }

        .industry-cta-button {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 14px 19px;
          border-radius: 13px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 900px) {
          .industry-hero-grid,
          .industry-overview-grid {
            grid-template-columns: 1fr;
          }

          .industry-needs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .industry-hero-image img {
            min-height: 380px;
          }
        }

        @media (max-width: 768px) {
          .industry-hero {
            padding: 78px 0 65px;
          }

          .industry-hero-grid {
            gap: 42px;
          }

          .industry-hero h1 {
            font-size: 40px;
          }

          .industry-hero p {
            font-size: 16px;
          }

          .industry-hero-image img {
            min-height: 300px;
            border-radius: 20px;
          }

          .industry-overview,
          .industry-needs,
          .industry-services,
          .industry-faq {
            padding: 68px 0;
          }

          .industry-needs-grid,
          .industry-service-grid {
            grid-template-columns: 1fr;
          }

          .industry-cta {
            padding: 68px 0;
          }

          .industry-cta-inner {
            align-items: flex-start;
            flex-direction: column;
            gap: 26px;
          }

          .industry-faq-item summary {
            padding: 18px;
            gap: 16px;
            font-size: 15px;
          }

          .industry-faq-answer {
            padding: 0 18px 18px;
          }
        }
      `}</style>
    </main>
  );
}