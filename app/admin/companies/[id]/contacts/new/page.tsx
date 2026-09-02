"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

export default function NewContactPage() {
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();

  const companyId = params.id;

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const formData =
      new FormData(event.currentTarget);

    const payload = {
      companyId,

      name:
        formData.get("name")?.toString() ||
        "",

      designation:
        formData
          .get("designation")
          ?.toString() || "",

      phone:
        formData.get("phone")?.toString() ||
        "",

      email:
        formData.get("email")?.toString() ||
        "",

      linkedin:
        formData
          .get("linkedin")
          ?.toString() || "",

      decisionMaker:
        formData.get("decisionMaker") ===
        "on",
    };

    try {
      const response = await fetch(
        "/api/contacts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create contact."
        );

        setLoading(false);
        return;
      }

      setMessage(
        "Contact created successfully."
      );

      setTimeout(() => {
        router.push(
          `/admin/companies/${companyId}`
        );

        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Create contact error:",
        error
      );

      setError(
        "Something went wrong while creating the contact."
      );

      setLoading(false);
    }
  }

  return (
    <main className="company-form-page">

      <header className="company-form-topbar">

        <Link
          href={`/admin/companies/${companyId}`}
        >
          <ArrowLeft size={17} />
          Back to Company
        </Link>

        <div>
          Nexus Hyderabad CRM
        </div>

      </header>

      <section className="company-form-container">

        <div className="company-form-heading">

          <div className="company-form-icon">
            <UserPlus size={25} />
          </div>

          <div>
            <span>
              Company Contacts
            </span>

            <h1>
              Add Contact
            </h1>

            <p>
              Add a decision-maker or business
              contact for this company.
            </p>
          </div>

        </div>

        <form
          className="company-form"
          onSubmit={handleSubmit}
        >

          <div className="company-form-section">

            <div className="company-form-section-heading">

              <h2>
                Contact Information
              </h2>

              <p>
                Add the person's basic details.
              </p>

            </div>

            <div className="company-form-grid">

              <div className="company-form-field full">

                <label htmlFor="name">
                  Contact Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Example: Ramesh Kumar"
                />

              </div>

              <div className="company-form-field">

                <label htmlFor="designation">
                  Designation
                </label>

                <select
                  id="designation"
                  name="designation"
                  defaultValue=""
                >
                  <option value="">
                    Select designation
                  </option>

                  <option value="Facility Manager">
                    Facility Manager
                  </option>

                  <option value="Admin Manager">
                    Admin Manager
                  </option>

                  <option value="EHS Manager">
                    EHS Manager
                  </option>

                  <option value="Procurement Manager">
                    Procurement Manager
                  </option>

                  <option value="Operations Manager">
                    Operations Manager
                  </option>

                  <option value="QA/QC Manager">
                    QA/QC Manager
                  </option>

                  <option value="Maintenance Manager">
                    Maintenance Manager
                  </option>

                  <option value="HR Manager">
                    HR Manager
                  </option>

                  <option value="Purchase Manager">
                    Purchase Manager
                  </option>

                  <option value="General Manager">
                    General Manager
                  </option>

                  <option value="Director">
                    Director
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="company-form-field">

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                />

              </div>

              <div className="company-form-field">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                />

              </div>

              <div className="company-form-field">

                <label htmlFor="linkedin">
                  LinkedIn Profile
                </label>

                <input
                  id="linkedin"
                  name="linkedin"
                  type="text"
                  placeholder="https://linkedin.com/in/..."
                />

              </div>

            </div>

          </div>

          <div className="company-form-section">

            <div className="company-form-section-heading">

              <h2>
                Decision Maker
              </h2>

              <p>
                Mark important contacts who can
                influence or approve testing work.
              </p>

            </div>

            <label className="company-checkbox">

              <input
                type="checkbox"
                name="decisionMaker"
              />

              <span>
                This person is a decision-maker
                or key business contact.
              </span>

            </label>

          </div>

          {message && (
            <div className="company-form-success">
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          {error && (
            <div className="company-form-error">
              {error}
            </div>
          )}

          <div className="company-form-actions">

            <Link
              href={`/admin/companies/${companyId}`}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
            >
              <UserPlus size={17} />

              {loading
                ? "Saving..."
                : "Create Contact"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}