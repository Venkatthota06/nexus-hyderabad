"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const services = [
  "Water Testing",
  "Food Testing",
  "Indoor Air Quality",
  "Ambient Air Quality",
  "Workplace Monitoring",
  "Environmental Monitoring",
];

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      service: formData.get("service"),
      requirement: formData.get("requirement"),
      source: "Nexus Hyderabad Website",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit enquiry.");
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span>Request a Quote</span>
        <h3>How can we help?</h3>
      </div>

      <div className="form-row">
        <input
          type="text"
          name="name"
          placeholder="Your Name *"
          required
        />

        <input
          type="text"
          name="company"
          placeholder="Company Name *"
          required
        />
      </div>

      <div className="form-row">
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number *"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address *"
          required
        />
      </div>

      <select name="service" defaultValue="" required>
        <option value="" disabled>
          Select Testing Service *
        </option>

        {services.map((service) => (
          <option value={service} key={service}>
            {service}
          </option>
        ))}
      </select>

      <textarea
        name="requirement"
        placeholder="Tell us about your testing requirement..."
        rows={5}
        required
      />

      <button
        type="submit"
        className="primary-btn submit-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="submit-spinner" />
            Submitting...
          </>
        ) : (
          <>
            Submit Enquiry
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {success && (
        <div className="form-success">
          <CheckCircle2 size={20} />

          <div>
            <strong>Enquiry submitted successfully!</strong>
            <span>Our team will contact you regarding your requirement.</span>
          </div>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <small className="form-note">
        Your information will only be used to respond to your testing enquiry.
      </small>
    </form>
  );
}