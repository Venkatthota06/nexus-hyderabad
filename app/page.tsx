"use client";

import Link from "next/link";

import LeadForm from "@/components/LeadForm";
import { motion } from "framer-motion";
import { sendGAEvent } from "@next/third-parties/google";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Wind,
  Utensils,
  Factory,
  Phone,
  MessageCircle,
  ShieldCheck,
  Microscope,
  Building2,
  MapPin,
  Award,
  FlaskConical,
} from "lucide-react";

export default function Home() {
  const services = [
    {
      title: "Water Testing",
      slug: "water-testing",
      icon: Droplets,
      text: "Professional testing support for drinking water, RO water, domestic water, wastewater and other water quality requirements.",
    },
    {
      title: "Food Testing",
      slug: "food-testing",
      icon: Utensils,
      text: "Food quality, chemical and microbiological testing support for food businesses, catering services and institutions.",
    },
    {
      title: "Indoor Air Quality",
      slug: "indoor-air-quality",
      icon: Wind,
      text: "Indoor Air Quality monitoring support for corporate offices, hospitals, hotels and commercial facilities.",
    },
    {
      title: "Ambient Air Quality",
      slug: "ambient-air-quality",
      icon: Factory,
      text: "Ambient air monitoring solutions for industries, infrastructure projects and commercial facilities.",
    },
    {
      title: "Workplace Monitoring",
      slug: "workplace-monitoring",
      icon: Microscope,
      text: "Workplace and environmental monitoring solutions based on client and facility requirements.",
    },
    {
      title: "Environmental Monitoring",
      slug: "environmental-monitoring",
      icon: ShieldCheck,
      text: "Integrated environmental monitoring and testing support for organisations across multiple sectors.",
    },
  ];

  const industries = [
  {
    name: "Hospitals & Healthcare",
    href: "/industries/hospitals",
  },
  {
    name: "Pharmaceuticals",
    href: "/industries/pharmaceutical",
  },
  {
    name: "Corporate Offices",
    href: "/industries/corporate-offices",
  },
  {
    name: "Food & Catering",
    href: "/industries/hotels-restaurants",
  },
  {
    name: "Hotels & Hospitality",
    href: "/industries/hotels-restaurants",
  },
  {
    name: "Manufacturing",
    href: "/industries/manufacturing",
  },
  {
    name: "IT Parks",
    href: "/industries/corporate-offices",
  },
  {
    name: "Residential & Commercial",
    href: "/industries/residential-commercial",
  },
];

  const credentials = [
    {
      title: "16+",
      text: "Years of Experience",
      icon: Award,
    },
    {
      title: "NABL",
      text: "Accredited Laboratory",
      icon: FlaskConical,
    },
    {
      title: "MOEF",
      text: "Recognized Laboratory",
      icon: ShieldCheck,
    },
    {
      title: "AP & TS",
      text: "Regional Client Support",
      icon: MapPin,
    },
  ];

  return (
    <main>
      <header className="navbar">
        <div className="container nav-inner">
          <motion.a
            href="#home"
            className="brand"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/nexus-logo.png"
              alt="Nexus Test Labs Pvt. Ltd."
            />
          </motion.a>

          <nav className="nav-links">
            {[
              "Home",
              "Services",
              "Industries",
              "About",
              "Contact",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <motion.a
            href="#contact"
            className="quote-btn"
            whileHover={{
              scale: 1.04,
              y: -2,
            }}
            whileTap={{ scale: 0.97 }}
          >
            Get Quote
            <ArrowRight size={17} />
          </motion.a>
        </div>
      </header>

      <section
        id="home"
        className="hero premium-hero"
      >
        <div className="hero-grid-pattern" />
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-orb hero-orb-three" />

        <div className="container hero-grid">
          <motion.div
            className="hero-content"
            initial={{
              opacity: 0,
              y: 35,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >
            <motion.div
              className="badge"
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.25,
              }}
            >
              <span className="badge-dot" />
              Nexus Test Labs Pvt. Ltd. | Hyderabad
            </motion.div>

            <h1>
              Smarter Testing.
              <br />
              Safer Environments.
              <br />
              <span className="gradient-text">
                Better Decisions.
              </span>
            </h1>

            <p className="hero-description">
              Nexus Test Labs Pvt. Ltd. provides
              professional environmental, food, water and
              workplace testing services, with dedicated
              client support for Hyderabad, Telangana and
              Andhra Pradesh.
            </p>

            <div className="hero-actions">
              <motion.a
                href="#contact"
                className="primary-btn"
                whileHover={{
                  y: -4,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                Request a Quote
                <ArrowRight size={18} />
              </motion.a>

              <motion.a
                href="#services"
                className="secondary-btn"
                whileHover={{ y: -4 }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                Explore Services
              </motion.a>
            </div>

            <div className="trust-row">
              <div>
                <CheckCircle2 size={18} />
                NABL Accredited Laboratory
              </div>

              <div>
                <CheckCircle2 size={18} />
                MOEF Recognized Laboratory
              </div>

              <div>
                <CheckCircle2 size={18} />
                ISO Certified Laboratory
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{
              opacity: 0,
              scale: 0.92,
              x: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 0.85,
              delay: 0.15,
            }}
          >
            <motion.div
              className="hero-card premium-card"
              whileHover={{ y: -8 }}
              transition={{
                duration: 0.25,
              }}
            >
              <div className="card-glow" />

              <div className="card-top">
                <span className="mini-label">
                  Testing Solutions
                </span>

                <div className="lab-icon">
                  <FlaskConical size={25} />
                </div>
              </div>

              <h3>Our Key Services</h3>

              <p className="card-description">
                Testing and monitoring solutions for
                organisations across multiple industries.
              </p>

              <div className="hero-service-list">
                {services
                  .slice(0, 5)
                  .map((service, index) => {
                    const Icon =
                      service.icon;

                    return (
                      <motion.div
                        key={
                          service.title
                        }
                        className="hero-service-item"
                        initial={{
                          opacity: 0,
                          x: 25,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            0.45 +
                            index *
                              0.1,
                        }}
                      >
                        <span className="tick">
                          <Icon
                            size={
                              14
                            }
                          />
                        </span>

                        <span>
                          {
                            service.title
                          }
                        </span>
                      </motion.div>
                    );
                  })}
              </div>

              <div className="hero-card-footer">
                <div>
                  <small>
                    Regional Support
                  </small>

                  <strong>
                    Hyderabad • Telangana • AP
                  </strong>
                </div>

                <a href="#contact">
                  Enquire
                  <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>

            <motion.div
              className="floating-badge badge-accredited"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Award size={20} />

              <div>
                <strong>NABL</strong>
                <span>Accredited</span>
              </div>
            </motion.div>

            <motion.div
              className="floating-badge badge-support"
              animate={{
                y: [0, 9, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MapPin size={20} />

              <div>
                <strong>AP & TS</strong>
                <span>
                  Client Support
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        id="credentials"
        className="credentials-section"
      >
        <div className="container credentials-grid">
          {credentials.map(
            (credential, index) => {
              const Icon =
                credential.icon;

              return (
                <motion.div
                  key={
                    credential.text
                  }
                  className="credential-item"
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay:
                      index * 0.1,
                  }}
                >
                  <div className="credential-icon">
                    <Icon size={23} />
                  </div>

                  <div>
                    <strong>
                      {
                        credential.title
                      }
                    </strong>

                    <span>
                      {
                        credential.text
                      }
                    </span>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      </section>

      <section className="lab-showcase-section">
        <div className="container lab-showcase-grid">
          <motion.div
            className="lab-showcase-images"
            initial={{
              opacity: 0,
              x: -40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <div className="lab-main-image-wrap">
              <img
                src="/images/nexus-lab-main.jpg"
                alt="Nexus Test Labs laboratory"
                className="lab-main-image"
              />

              <motion.div
                className="lab-floating-card"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Award size={22} />

                <div>
                  <strong>
                    NABL
                  </strong>

                  <span>
                    Accredited
                    Laboratory
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="lab-small-grid">
              <div className="lab-small-card">
                <img
                  src="/images/nexus-water-testing.jpg"
                  alt="Water testing at Nexus Test Labs"
                />

                <div className="lab-image-overlay">
                  <span>
                    Water Testing
                  </span>
                </div>
              </div>

              <div className="lab-small-card">
                <img
                  src="/images/nexus-food-testing.jpg"
                  alt="Food testing"
                />

                <div className="lab-image-overlay">
                  <span>
                    Food Testing
                  </span>
                </div>
              </div>

              <div className="lab-small-card">
                <img
                  src="/images/nexus-environmental-testing.jpg"
                  alt="Environmental testing"
                />

                <div className="lab-image-overlay">
                  <span>
                    Environmental
                    Testing
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lab-showcase-content"
            initial={{
              opacity: 0,
              x: 40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <span className="eyebrow">
              Inside Nexus Test Labs
            </span>

            <h2>
              Laboratory expertise
              <br />

              <span className="heading-highlight">
                you can see.
              </span>
            </h2>

            <p>
              Behind every test report is a structured
              laboratory process, trained technical team
              and dedicated testing infrastructure.
            </p>

            <div className="lab-feature-list">
              {[
                [
                  "Water Analysis",
                  Droplets,
                ],
                [
                  "Food Testing",
                  Utensils,
                ],
                [
                  "Microbiology",
                  Microscope,
                ],
                [
                  "Environmental Monitoring",
                  Wind,
                ],
              ].map(
                ([title, Icon]: any) => (
                  <div key={title}>
                    <div className="lab-feature-icon">
                      <Icon
                        size={
                          20
                        }
                      />
                    </div>

                    <div>
                      <strong>
                        {title}
                      </strong>

                      <span>
                        Professional
                        laboratory
                        and testing
                        support.
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <a
              href="#contact"
              className="lab-showcase-button"
            >
              Discuss Your Testing Requirement
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      <section
        id="services"
        className="section services-section"
      >
        <div className="container">
          <motion.div
            className="section-heading"
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
          >
            <span>Our Services</span>

            <h2>
              Testing Solutions Built Around
              <br />

              <span className="heading-highlight">
                Your Requirements
              </span>
            </h2>
          </motion.div>

          <div className="services-grid">
            {services.map(
              (service, index) => {
                const Icon =
                  service.icon;

                return (
                  <motion.article
                    key={
                      service.title
                    }
                    className="service-card premium-service-card"
                    initial={{
                      opacity: 0,
                      y: 40,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index *
                        0.08,
                    }}
                    whileHover={{
                      y: -10,
                    }}
                  >
                    <div className="service-number">
                      0
                      {index +
                        1}
                    </div>

                    <div className="service-icon">
                      <Icon
                        size={
                          23
                        }
                      />
                    </div>

                    <h3>
                      {
                        service.title
                      }
                    </h3>

                    <p>
                      {
                        service.text
                      }
                    </p>

                    <a
                      href={`/services/${service.slug}`}
                    >
                      Explore Service
                      <ArrowRight
                        size={
                          16
                        }
                      />
                    </a>
                  </motion.article>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section
        id="industries"
        className="industries-section"
      >
        <div className="container">
          <div className="section-heading">
            <span>
              Industries We Serve
            </span>

            <h2>
              One Testing Partner. Multiple Industries.
            </h2>
          </div>

          <div className="industry-grid">
  {industries.map((industry) => (
    <Link
      href={industry.href}
      className="industry-card"
      key={`${industry.name}-${industry.href}`}
    >
      <div className="industry-icon">
        <Building2 size={22} />
      </div>

      <span>{industry.name}</span>

      <ArrowRight
        className="industry-arrow"
        size={17}
      />
    </Link>
  ))}
</div>
        </div>
      </section>

      <section
        id="about"
        className="section about-section"
      >
        <div className="container about-box">
          <div className="about-left">
            <span className="eyebrow">
              Why Nexus
            </span>

            <h2>
              One trusted laboratory.
              <br />

              <span className="heading-highlight">
                Stronger regional support.
              </span>
            </h2>

            <p>
              Nexus combines laboratory expertise with
              dedicated regional support to help
              organisations coordinate their testing
              requirements efficiently.
            </p>
          </div>

          <div className="about-panel">
            <div className="about-panel-icon">
              <FlaskConical size={27} />
            </div>

            <p>
              Nexus Test Labs Pvt. Ltd. supports
              organisations across multiple sectors. Our
              Hyderabad platform extends the same company
              expertise and service standards to clients
              across Telangana and Andhra Pradesh.
            </p>

            <div className="about-points">
              <span>
                <CheckCircle2 size={17} />
                Faster Enquiries
              </span>

              <span>
                <CheckCircle2 size={17} />
                Regional Support
              </span>

              <span>
                <CheckCircle2 size={17} />
                Professional Follow-ups
              </span>

              <span>
                <CheckCircle2 size={17} />
                Sample Coordination
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="contact-section"
      >
        <div className="container contact-grid">
          <div className="contact-content">
            <span className="eyebrow">
              Get in Touch
            </span>

            <h2>
              Tell us what you need tested.
            </h2>

            <p>
              Share your requirement and our regional team
              will connect with you.
            </p>
          </div>

          <LeadForm />
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-bottom">
          <p>
            © 2026 Nexus Test Labs Pvt. Ltd. All Rights
            Reserved.
          </p>
        </div>
      </footer>

      <div className="floating-actions">
        <a
          href="tel:+916305820206"
          className="floating-call"
          aria-label="Call Nexus Test Labs"
          title="Call Nexus Test Labs"
          onClick={() =>
            sendGAEvent(
              "event",
              "call_click",
              {
                location:
                  "floating_button",
              }
            )
          }
        >
          <Phone size={21} />
        </a>

        <a
          href="https://wa.me/916305820206?text=Hi%20Nexus%20Test%20Labs%2C%20I%20have%20a%20testing%20requirement%20and%20would%20like%20to%20discuss%20the%20details.%20Please%20contact%20me."
          className="floating-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Nexus Test Labs"
          title="WhatsApp Nexus Test Labs"
          onClick={() =>
            sendGAEvent(
              "event",
              "whatsapp_click",
              {
                location:
                  "floating_button",
              }
            )
          }
        >
          <MessageCircle size={22} />
        </a>
      </div>
    </main>
  );
}