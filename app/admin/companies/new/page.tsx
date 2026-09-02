"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function NewCompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      name:
        formData.get("name")?.toString() || "",

      industry:
        formData.get("industry")?.toString() || "",

      website:
        formData.get("website")?.toString() || "",

      phone:
        formData.get("phone")?.toString() || "",

      email:
        formData.get("email")?.toString() || "",

      address:
        formData.get("address")?.toString() || "",

      city:
        formData.get("city")?.toString() || "",

      state:
        formData.get("state")?.toString() || "",

      source:
        formData.get("source")?.toString() || "",

      status:
        formData.get("status")?.toString() ||
        "Prospect",
    };

    try {
      const response = await fetch(
        "/api/companies",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create company."
        );

        setLoading(false);
        return;
      }

      setMessage(
        "Company created successfully."
      );

      setTimeout(() => {
        router.push("/admin/companies");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Create company error:",
        error
      );

      setError(
        "Something went wrong while creating the company."
      );

      setLoading(false);
    }
  }

  return (
    <main className="company-form-page">

      <header className="company-form-topbar">

        <Link href="/admin/companies">
          <ArrowLeft size={17} />
          Back to Companies
        </Link>

        <div>
          Nexus Hyderabad CRM
        </div>

      </header>

      <section className="company-form-container">

        <div className="company-form-heading">

          <div className="company-form-icon">
            <Building2 size={25} />
          </div>

          <div>
            <span>
              Company Database
            </span>

            <h1>
              Add Company
            </h1>

            <p>
              Add a prospect or client organisation
              to your CRM.
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
                Company Information
              </h2>

              <p>
                Basic information about the
                organisation.
              </p>
            </div>

            <div className="company-form-grid">

              <div className="company-form-field full">
                <label htmlFor="name">
                  Company Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Example: ABC Technologies Pvt Ltd"
                />
              </div>

              <div className="company-form-field">
                <label htmlFor="industry">
                  Industry
                </label>

                <select
                  id="industry"
                  name="industry"
                  defaultValue=""
                >
                  <option value="">
                    Select industry
                  </option>

                  <option value="IT & Technology">
                    IT & Technology
                  </option>

                  <option value="Hospital & Healthcare">
                    Hospital & Healthcare
                  </option>

                  <option value="Pharmaceutical">
                    Pharmaceutical
                  </option>

                  <option value="Food & Catering">
                    Food & Catering
                  </option>

                  <option value="Hotel & Hospitality">
                    Hotel & Hospitality
                  </option>

                  <option value="Manufacturing">
                    Manufacturing
                  </option>

                  <option value="Educational Institution">
                    Educational Institution
                  </option>

                  <option value="Corporate Office">
                    Corporate Office
                  </option>

                  <option value="Facility Management">
                    Facility Management
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="company-form-field">
                <label htmlFor="status">
                  Company Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue="Prospect"
                >
                  <option value="Prospect">
                    Prospect
                  </option>

                  <option value="Client">
                    Client
                  </option>

                  <option value="Inactive">
                    Inactive
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
                  placeholder="admin@company.com"
                />
              </div>

              <div className="company-form-field full">
                <label htmlFor="website">
                  Website
                </label>

                <input
                  id="website"
                  name="website"
                  type="text"
                  placeholder="https://company.com"
                />
              </div>

            </div>

          </div>

          <div className="company-form-section">

            <div className="company-form-section-heading">
              <h2>
                Location
              </h2>

              <p>
                Company office or facility location.
              </p>
            </div>

            <div className="company-form-grid">

              <div className="company-form-field full">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="Office address"
                />
              </div>

              <div className="company-form-field">
                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue="Hyderabad"
                />
              </div>

              <div className="company-form-field">
                <label htmlFor="state">
                  State
                </label>

                <select
                  id="state"
                  name="state"
                  defaultValue="Telangana"
                >
                  <option value="Telangana">
                    Telangana
                  </option>

                  <option value="Andhra Pradesh">
                    Andhra Pradesh
                  </option>

                  <option value="Karnataka">
                    Karnataka
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

            </div>

          </div>

          <div className="company-form-section">

            <div className="company-form-section-heading">
              <h2>
                Business Source
              </h2>

              <p>
                Track where this prospect came from.
              </p>
            </div>

            <div className="company-form-field full">

              <label htmlFor="source">
                Lead Source
              </label>

              <select
                id="source"
                name="source"
                defaultValue=""
              >
                <option value="">
                  Select source
                </option>

                <option value="Field Visit">
                  Field Visit
                </option>

                <option value="LinkedIn">
                  LinkedIn
                </option>

                <option value="Website">
                  Website
                </option>

                <option value="Referral">
                  Referral
                </option>

                <option value="Phone Call">
                  Phone Call
                </option>

                <option value="Email Marketing">
                  Email Marketing
                </option>

                <option value="Existing Client">
                  Existing Client
                </option>

                <option value="Google">
                  Google
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

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

            <Link href="/admin/companies">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
            >
              <Building2 size={17} />

              {loading
                ? "Saving..."
                : "Create Company"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}