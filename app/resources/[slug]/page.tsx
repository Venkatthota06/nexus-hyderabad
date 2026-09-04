import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Droplets,
  FlaskConical,
  HeartPulse,
  Phone,
  ShieldCheck,
} from "lucide-react";

const articles = {
  "why-water-testing-is-important-for-hospitals": {
    title: "Why Water Testing Is Important for Hospitals in Hyderabad",
    eyebrow: "Water Quality • Healthcare Facilities",
    description:
      "Learn why regular water testing is important for hospitals and healthcare facilities in Hyderabad, which water sources may require monitoring, and how to plan an appropriate testing program.",
    published: "September 4, 2026",
    readTime: "6 min read",
  },
};

type ArticleSlug = keyof typeof articles;

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug as ArticleSlug];

  if (!article) {
    return {
      title: "Resources & Insights",
      description:
        "Testing, laboratory and environmental monitoring insights from Nexus Test Labs.",
    };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: [
      "hospital water testing Hyderabad",
      "water testing for hospitals Hyderabad",
      "hospital water quality testing Hyderabad",
      "drinking water testing hospitals Hyderabad",
      "RO water testing hospitals Hyderabad",
      "water testing lab Hyderabad",
      "healthcare facility water testing Hyderabad",
      "Nexus Test Labs Hyderabad",
    ],
    alternates: {
      canonical: `/resources/${slug}`,
    },
    openGraph: {
      title: `${article.title} | Nexus Test Labs`,
      description: article.description,
      url: `/resources/${slug}`,
      type: "article",
      images: [
        {
          url: "/images/nexus-water-testing.jpg",
          alt: "Water testing at Nexus Test Labs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Nexus Test Labs`,
      description: article.description,
      images: ["/images/nexus-water-testing.jpg"],
    },
  };
}

export default async function ResourceArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug as ArticleSlug];

  if (!article) {
    return (
      <main className="resource-not-found">
        <h1>Resource not found</h1>

        <Link href="/">
          <ArrowLeft size={17} />
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <main className="resource-page">
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="brand">
            <img
              src="/nexus-logo.png"
              alt="Nexus Test Labs Pvt. Ltd."
            />
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

      <article>
        <section className="resource-hero">
          <div className="container resource-hero-inner">
            <Link href="/" className="resource-back">
              <ArrowLeft size={16} />
              Nexus Test Labs
            </Link>

            <span className="resource-eyebrow">
              {article.eyebrow}
            </span>

            <h1>{article.title}</h1>

            <p className="resource-intro">
              {article.description}
            </p>

            <div className="resource-meta">
              <span>{article.published}</span>
              <span className="resource-dot" />
              <span>{article.readTime}</span>
              <span className="resource-dot" />
              <span>Nexus Test Labs</span>
            </div>
          </div>
        </section>

        <section className="resource-featured-image">
          <div className="container">
            <div className="resource-image-wrap">
              <img
                src="/images/nexus-water-testing.jpg"
                alt="Water testing laboratory services for hospitals in Hyderabad"
              />

              <div className="resource-image-label">
                <FlaskConical size={18} />
                Water Quality Testing
              </div>
            </div>
          </div>
        </section>

        <section className="resource-content-section">
          <div className="container resource-layout">
            <aside className="resource-sidebar">
              <div className="resource-sidebar-card">
                <span>In this article</span>

                <a href="#why-important">
                  Why water testing matters
                </a>

                <a href="#water-sources">
                  Water sources to consider
                </a>

                <a href="#parameters">
                  Choosing test parameters
                </a>

                <a href="#frequency">
                  How often to test
                </a>

                <a href="#planning">
                  Planning your testing
                </a>
              </div>

              <div className="resource-help-card">
                <Droplets size={24} />

                <h3>Need water testing?</h3>

                <p>
                  Discuss your hospital or healthcare facility
                  requirement with our team.
                </p>

                <Link href="/#contact">
                  Request a Quote
                  <ArrowRight size={15} />
                </Link>
              </div>
            </aside>

            <div className="resource-content">
              <p className="resource-lead">
                Hospitals depend on water for a wide range of
                everyday activities. Drinking water, kitchens,
                housekeeping, wash areas and other facility
                operations can involve different water sources
                and different quality requirements.
              </p>

              <p>
                Because water is used throughout a healthcare
                facility, a structured water-quality monitoring
                program can help facility teams understand the
                condition of their water and identify when
                further investigation or corrective action may
                be required.
              </p>

              <section id="why-important">
                <span className="resource-section-number">
                  01
                </span>

                <h2>
                  Why is water testing important for hospitals?
                </h2>

                <p>
                  Water quality can be influenced by the original
                  water source, storage tanks, treatment systems,
                  plumbing networks and conditions within the
                  facility. Testing provides objective laboratory
                  information about selected physical, chemical
                  and microbiological characteristics of a water
                  sample.
                </p>

                <p>
                  For hospital engineering, facility and quality
                  teams, this information can support routine
                  monitoring and help them make informed decisions
                  about water management.
                </p>

                <div className="resource-highlight-grid">
                  <div>
                    <ShieldCheck size={21} />
                    <h3>Quality Monitoring</h3>
                    <p>
                      Establish laboratory data for selected
                      water-quality parameters.
                    </p>
                  </div>

                  <div>
                    <HeartPulse size={21} />
                    <h3>Facility Support</h3>
                    <p>
                      Support healthcare facility teams with
                      structured water-quality information.
                    </p>
                  </div>

                  <div>
                    <Building2 size={21} />
                    <h3>Routine Programs</h3>
                    <p>
                      Build periodic monitoring into facility
                      maintenance and quality programs.
                    </p>
                  </div>
                </div>
              </section>

              <section id="water-sources">
                <span className="resource-section-number">
                  02
                </span>

                <h2>
                  Which hospital water sources may require testing?
                </h2>

                <p>
                  The appropriate testing scope depends on the
                  facility and how the water is being used.
                  Hospitals may have several water sources or
                  treatment stages that need to be considered
                  separately.
                </p>

                <div className="resource-check-list">
                  {[
                    "Incoming or source water",
                    "Drinking water",
                    "RO water",
                    "Domestic or utility water",
                    "Stored water from tanks",
                    "Kitchen and food-service water",
                    "Treated water used for specific facility requirements",
                    "Wastewater where monitoring is required",
                  ].map((item) => (
                    <div key={item}>
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="resource-note">
                  <strong>Important:</strong>
                  <p>
                    Different hospital applications can require
                    different testing scopes. The intended use of
                    the water should be established before the
                    parameters are selected.
                  </p>
                </div>
              </section>

              <section id="parameters">
                <span className="resource-section-number">
                  03
                </span>

                <h2>
                  How should hospitals choose water-testing
                  parameters?
                </h2>

                <p>
                  There is no single parameter list that is
                  appropriate for every hospital water sample.
                  The testing scope should be selected according
                  to factors such as the water source, treatment
                  process, intended use, facility requirement and
                  the purpose of testing.
                </p>

                <p>
                  Depending on the requirement, a laboratory
                  testing scope may include selected physical,
                  chemical and microbiological parameters.
                  Facility teams should communicate the intended
                  water use when requesting a quotation so that
                  the testing requirement can be reviewed
                  appropriately.
                </p>

                <Link
                  href="/services/water-testing"
                  className="resource-inline-link"
                >
                  Explore our Water Testing services
                  <ArrowRight size={16} />
                </Link>
              </section>

              <section id="frequency">
                <span className="resource-section-number">
                  04
                </span>

                <h2>
                  How often should a hospital test its water?
                </h2>

                <p>
                  Testing frequency depends on the facility,
                  water source, treatment system, intended use,
                  internal monitoring program and any applicable
                  requirements. A single schedule should not be
                  assumed to be appropriate for every hospital.
                </p>

                <p>
                  Facilities may consider testing when establishing
                  a baseline, as part of a routine monitoring
                  program, after significant maintenance or
                  treatment-system changes, or when there is a
                  specific water-quality concern.
                </p>
              </section>

              <section id="planning">
                <span className="resource-section-number">
                  05
                </span>

                <h2>
                  Planning a hospital water-testing requirement
                </h2>

                <p>
                  Before requesting testing, it helps to prepare
                  basic information about the facility and sample.
                  This makes it easier to define the scope and
                  coordinate the quotation and sampling process.
                </p>

                <div className="resource-planning">
                  <div>
                    <span>1</span>
                    <p>
                      Identify the water source and sampling
                      location.
                    </p>
                  </div>

                  <div>
                    <span>2</span>
                    <p>
                      Explain how the water is used within the
                      facility.
                    </p>
                  </div>

                  <div>
                    <span>3</span>
                    <p>
                      Confirm whether a particular testing scope
                      or parameter requirement is available.
                    </p>
                  </div>

                  <div>
                    <span>4</span>
                    <p>
                      Confirm the number of samples and required
                      testing schedule.
                    </p>
                  </div>

                  <div>
                    <span>5</span>
                    <p>
                      Coordinate sample collection or submission
                      with the laboratory team.
                    </p>
                  </div>
                </div>

                <p>
                  Nexus Test Labs supports water-testing
                  requirements for organisations in Hyderabad and
                  can coordinate the testing scope, quotation,
                  sample requirements and laboratory testing based
                  on the client&apos;s requirement.
                </p>

                <Link
                  href="/industries/hospitals"
                  className="resource-inline-link"
                >
                  Testing Services for Hospitals in Hyderabad
                  <ArrowRight size={16} />
                </Link>
              </section>

              <section className="resource-faq">
                <span className="resource-section-number">
                  FAQ
                </span>

                <h2>
                  Frequently asked questions about hospital water
                  testing
                </h2>

                <div className="resource-faq-list">
                  <details>
                    <summary>
                      What types of hospital water can be tested?
                      <span>+</span>
                    </summary>

                    <p>
                      Testing can be coordinated for drinking
                      water, RO water, domestic water, source
                      water, treated water and other facility
                      water samples depending on the requirement.
                    </p>
                  </details>

                  <details>
                    <summary>
                      Can Nexus Test Labs support hospital water
                      testing in Hyderabad?
                      <span>+</span>
                    </summary>

                    <p>
                      Yes. Nexus Test Labs supports water-testing
                      requirements for hospitals and healthcare
                      facilities in Hyderabad, including testing
                      scope, quotation and sample coordination.
                    </p>
                  </details>

                  <details>
                    <summary>
                      Which parameters should a hospital test?
                      <span>+</span>
                    </summary>

                    <p>
                      The appropriate parameters depend on the
                      water source, intended use and purpose of
                      testing. The requirement should be reviewed
                      before selecting the testing scope.
                    </p>
                  </details>

                  <details>
                    <summary>
                      Can regular water-testing schedules be
                      coordinated?
                      <span>+</span>
                    </summary>

                    <p>
                      Routine testing requirements can be
                      coordinated based on the facility&apos;s
                      monitoring program and agreed testing scope.
                    </p>
                  </details>
                </div>
              </section>
            </div>
          </div>
        </section>
      </article>

      <section className="resource-cta">
        <div className="container resource-cta-inner">
          <div>
            <span>Hospital Water Testing</span>

            <h2>
              Need to discuss your water-testing requirement?
            </h2>

            <p>
              Share your water source, intended use, number of
              samples and testing requirement with Nexus Test Labs.
            </p>
          </div>

          <div className="resource-cta-actions">
            <Link href="/#contact">
              Request a Quote
              <ArrowRight size={17} />
            </Link>

            <a href="tel:+916305820206">
              <Phone size={17} />
              Call Us
            </a>
          </div>
        </div>
      </section>

      <footer className="service-footer">
        <div className="container service-footer-inner">
          <div>
            <strong>Nexus Test Labs Pvt. Ltd.</strong>
            <span>
              Testing & Environmental Monitoring Services
            </span>
          </div>

          <Link href="/">Back to Homepage</Link>
        </div>
      </footer>

      <style>{`
        .resource-hero {
          padding: 105px 0 68px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(37, 99, 235, 0.1),
              transparent 36%
            ),
            linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
        }

        .resource-hero-inner {
          max-width: 940px;
          text-align: center;
        }

        .resource-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 32px;
          color: #64748b;
          font-size: 14px;
          font-weight: 650;
          text-decoration: none;
        }

        .resource-eyebrow {
          display: block;
          margin-bottom: 15px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 750;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .resource-hero h1 {
          max-width: 900px;
          margin: 0 auto;
          color: #0f172a;
          font-size: clamp(42px, 5.5vw, 66px);
          line-height: 1.04;
          letter-spacing: -0.045em;
        }

        .resource-intro {
          max-width: 760px;
          margin: 24px auto 0;
          color: #64748b;
          font-size: 18px;
          line-height: 1.8;
        }

        .resource-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 25px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
        }

        .resource-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #cbd5e1;
        }

        .resource-featured-image {
          padding: 0 0 85px;
          background: #ffffff;
        }

        .resource-image-wrap {
          position: relative;
          max-width: 1080px;
          margin: 0 auto;
        }

        .resource-image-wrap img {
          display: block;
          width: 100%;
          height: 500px;
          object-fit: cover;
          border-radius: 26px;
          box-shadow: 0 25px 65px rgba(15, 23, 42, 0.12);
        }

        .resource-image-label {
          position: absolute;
          right: 20px;
          bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
        }

        .resource-content-section {
          padding: 90px 0 105px;
          background: #f8fafc;
        }

        .resource-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 760px);
          justify-content: center;
          gap: 65px;
          align-items: start;
        }

        .resource-sidebar {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .resource-sidebar-card,
        .resource-help-card {
          padding: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .resource-sidebar-card > span {
          display: block;
          margin-bottom: 14px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .resource-sidebar-card a {
          display: block;
          padding: 9px 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.45;
          text-decoration: none;
          border-bottom: 1px solid #f1f5f9;
        }

        .resource-sidebar-card a:last-child {
          border-bottom: 0;
        }

        .resource-sidebar-card a:hover {
          color: #2563eb;
        }

        .resource-help-card {
          background: #0f172a;
        }

        .resource-help-card > svg {
          color: #60a5fa;
        }

        .resource-help-card h3 {
          margin: 13px 0 8px;
          color: #ffffff;
          font-size: 18px;
        }

        .resource-help-card p {
          margin: 0 0 16px;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.65;
        }

        .resource-help-card a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #93c5fd;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .resource-content {
          color: #475569;
          font-size: 16px;
          line-height: 1.9;
        }

        .resource-content > p {
          margin: 0 0 22px;
        }

        .resource-lead {
          color: #334155;
          font-size: 19px;
          line-height: 1.8;
        }

        .resource-content section {
          scroll-margin-top: 100px;
          margin-top: 70px;
        }

        .resource-section-number {
          display: inline-flex;
          margin-bottom: 11px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .resource-content h2 {
          margin: 0 0 21px;
          color: #0f172a;
          font-size: clamp(28px, 3.2vw, 38px);
          line-height: 1.18;
          letter-spacing: -0.025em;
        }

        .resource-content section > p {
          margin: 0 0 20px;
        }

        .resource-highlight-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 30px;
        }

        .resource-highlight-grid > div {
          padding: 20px;
          border: 1px solid rgba(37, 99, 235, 0.1);
          border-radius: 16px;
          background: #ffffff;
        }

        .resource-highlight-grid svg {
          color: #2563eb;
        }

        .resource-highlight-grid h3 {
          margin: 12px 0 7px;
          color: #0f172a;
          font-size: 15px;
        }

        .resource-highlight-grid p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.65;
        }

        .resource-check-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 11px;
          margin: 27px 0;
        }

        .resource-check-list > div {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 15px;
          border-radius: 13px;
          background: #ffffff;
          color: #334155;
          font-size: 14px;
          line-height: 1.5;
        }

        .resource-check-list svg {
          flex: 0 0 auto;
          margin-top: 2px;
          color: #16a34a;
        }

        .resource-note {
          margin-top: 28px;
          padding: 20px 22px;
          border-left: 3px solid #f59e0b;
          border-radius: 0 14px 14px 0;
          background: #fffbeb;
        }

        .resource-note strong {
          color: #92400e;
        }

        .resource-note p {
          margin: 5px 0 0;
          color: #78350f;
          font-size: 14px;
          line-height: 1.7;
        }

        .resource-inline-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 7px;
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        .resource-planning {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 27px 0;
        }

        .resource-planning > div {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 17px;
          border-radius: 14px;
          background: #ffffff;
        }

        .resource-planning span {
          display: grid;
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          place-items: center;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
        }

        .resource-planning p {
          margin: 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.55;
        }

        .resource-faq-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-top: 27px;
        }

        .resource-faq-list details {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 15px;
          background: #ffffff;
          overflow: hidden;
        }

        .resource-faq-list summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          cursor: pointer;
          list-style: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.5;
        }

        .resource-faq-list summary::-webkit-details-marker {
          display: none;
        }

        .resource-faq-list summary span {
          font-size: 21px;
          color: #2563eb;
        }

        .resource-faq-list details p {
          margin: 0;
          padding: 0 50px 18px 20px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.75;
        }

        .resource-cta {
          padding: 82px 0;
          background: #0f172a;
        }

        .resource-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
        }

        .resource-cta-inner > div:first-child {
          max-width: 680px;
        }

        .resource-cta span {
          color: #93c5fd;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .resource-cta h2 {
          margin: 10px 0 13px;
          color: #ffffff;
          font-size: clamp(30px, 4vw, 43px);
          line-height: 1.12;
          letter-spacing: -0.03em;
        }

        .resource-cta p {
          margin: 0;
          color: #cbd5e1;
          line-height: 1.7;
        }

        .resource-cta-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 180px;
        }

        .resource-cta-actions a {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 17px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .resource-cta-actions a:first-child {
          background: #2563eb;
          color: #ffffff;
        }

        .resource-cta-actions a:last-child {
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .resource-layout {
            grid-template-columns: 1fr;
            max-width: 760px;
          }

          .resource-sidebar {
            position: static;
          }

          .resource-sidebar-card {
            display: none;
          }

          .resource-help-card {
            max-width: 420px;
          }
        }

        @media (max-width: 768px) {
          .resource-hero {
            padding: 75px 0 50px;
          }

          .resource-hero h1 {
            font-size: 39px;
          }

          .resource-intro {
            font-size: 16px;
          }

          .resource-meta {
            flex-wrap: wrap;
          }

          .resource-featured-image {
            padding-bottom: 55px;
          }

          .resource-image-wrap img {
            height: 300px;
            border-radius: 20px;
          }

          .resource-content-section {
            padding: 65px 0 75px;
          }

          .resource-highlight-grid,
          .resource-check-list {
            grid-template-columns: 1fr;
          }

          .resource-content section {
            margin-top: 55px;
          }

          .resource-cta {
            padding: 65px 0;
          }

          .resource-cta-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 28px;
          }

          .resource-cta-actions {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}