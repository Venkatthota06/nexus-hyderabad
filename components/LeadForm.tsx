"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { sendGAEvent } from "@next/third-parties/google";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";

const services = [
  "Water Testing",
  "Food Testing",
  "Indoor Air Quality",
  "Ambient Air Quality",
  "Workplace Monitoring",
  "Environmental Monitoring",
];

export default function LeadForm() {
  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    needsCollection,
    setNeedsCollection,
  ] = useState(false);

  /*
   * If the customer arrives from:
   *
   * /?collection=yes#contact
   *
   * automatically select sample
   * collection and display the
   * collection fields.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    if (
      params.get("collection") ===
      "yes"
    ) {
      setNeedsCollection(true);
    }
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const selectedService =
      String(
        formData.get("service") || ""
      );

    const originalRequirement =
      String(
        formData.get("requirement") ||
          ""
      ).trim();

    const sampleCollection =
      String(
        formData.get(
          "sampleCollection"
        ) || "No"
      );

    const collectionLocation =
      String(
        formData.get(
          "collectionLocation"
        ) || ""
      ).trim();

    const preferredCollectionDate =
      String(
        formData.get(
          "preferredCollectionDate"
        ) || ""
      ).trim();

    let finalRequirement =
      originalRequirement;

    /*
     * Store sample collection details
     * inside the existing requirement
     * field.
     *
     * This keeps the current CRM and
     * database structure unchanged.
     */
    if (sampleCollection === "Yes") {
      finalRequirement +=
        "\n\n--- Sample Collection Request ---";

      finalRequirement +=
        "\nSample Collection Required: Yes";

      if (collectionLocation) {
        finalRequirement +=
          `\nCollection Location: ${collectionLocation}`;
      }

      if (preferredCollectionDate) {
        finalRequirement +=
          `\nPreferred Collection Date: ${preferredCollectionDate}`;
      }
    } else {
      finalRequirement +=
        "\n\nSample Collection Required: No";
    }

    const data = {
      name:
        formData.get("name"),

      company:
        formData.get("company"),

      phone:
        formData.get("phone"),

      email:
        formData.get("email"),

      service:
        formData.get("service"),

      requirement:
        finalRequirement,

      // Hidden anti-bot honeypot
      website:
        formData.get("website"),

      source:
        "Nexus Hyderabad Website",
    };

    try {
      const response =
        await fetch("/api/leads", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(data),
        });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit enquiry."
        );
      }

      /*
       * Google Analytics
       *
       * Record the lead only after
       * successful API submission.
       */
      sendGAEvent(
        "event",
        "generate_lead",
        {
          service:
            selectedService,

          lead_source:
            "website_form",

          sample_collection:
            sampleCollection,
        }
      );

      setSuccess(true);

      form.reset();

      /*
       * After successful submission,
       * reset the collection UI.
       */
      setNeedsCollection(false);
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
    <form
      className="contact-form"
      onSubmit={handleSubmit}
    >
      {/* ===============================================
          ANTI-BOT HONEYPOT
      =============================================== */}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="website">
          Leave this field empty
        </label>

        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* ===============================================
          FORM HEADING
      =============================================== */}

      <div className="form-heading">
        <span>
          Request a Quote
        </span>

        <h3>
          How can we help?
        </h3>
      </div>

      {/* ===============================================
          CUSTOMER INFORMATION
      =============================================== */}

      <div className="form-row">
        <input
          type="text"
          name="name"
          placeholder="Your Name *"
          maxLength={100}
          required
        />

        <input
          type="text"
          name="company"
          placeholder="Company Name *"
          maxLength={150}
          required
        />
      </div>

      <div className="form-row">
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number *"
          maxLength={20}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address *"
          maxLength={254}
          required
        />
      </div>

      {/* ===============================================
          TESTING SERVICE
      =============================================== */}

      <select
        name="service"
        defaultValue=""
        required
      >
        <option
          value=""
          disabled
        >
          Select Testing Service *
        </option>

        {services.map(
          (service) => (
            <option
              value={service}
              key={service}
            >
              {service}
            </option>
          )
        )}
      </select>

      {/* ===============================================
          TESTING REQUIREMENT
      =============================================== */}

      <textarea
        name="requirement"
        placeholder="Tell us about your testing requirement..."
        rows={5}
        maxLength={1500}
        required
      />

      {/* ===============================================
          SAMPLE COLLECTION
      =============================================== */}

      <div className="collection-request-box">
        <div className="collection-request-heading">
          <div className="collection-request-icon">
            <Truck size={20} />
          </div>

          <div>
            <strong>
              Need Sample Collection?
            </strong>

            <span>
              Our field team can
              coordinate collection
              from your location for
              applicable testing
              requirements.
            </span>
          </div>
        </div>

        <div className="collection-options">
          {/* NO */}

          <label
            className={
              !needsCollection
                ? "collection-option collection-option-active"
                : "collection-option"
            }
          >
            <input
              type="radio"
              name="sampleCollection"
              value="No"
              checked={
                !needsCollection
              }
              onChange={() =>
                setNeedsCollection(
                  false
                )
              }
            />

            <span>
              No
            </span>
          </label>

          {/* YES */}

          <label
            className={
              needsCollection
                ? "collection-option collection-option-active"
                : "collection-option"
            }
          >
            <input
              type="radio"
              name="sampleCollection"
              value="Yes"
              checked={
                needsCollection
              }
              onChange={() =>
                setNeedsCollection(
                  true
                )
              }
            />

            <span>
              Yes, I need collection
            </span>
          </label>
        </div>

        {/* =============================================
            COLLECTION DETAILS
        ============================================= */}

        {needsCollection && (
          <div className="collection-details">
            <div className="collection-field">
              <MapPin size={17} />

              <input
                type="text"
                name="collectionLocation"
                placeholder="Collection Location / Area *"
                maxLength={300}
                required
              />
            </div>

            <div className="collection-field">
              <CalendarDays
                size={17}
              />

              <input
                type="date"
                name="preferredCollectionDate"
                aria-label="Preferred Collection Date"
              />
            </div>

            <small className="collection-help">
              Preferred date is
              optional. Our team will
              confirm the final
              collection schedule after
              reviewing your testing
              requirement and location.
            </small>
          </div>
        )}
      </div>

      {/* ===============================================
          SUBMIT
      =============================================== */}

      <button
        type="submit"
        className="primary-btn submit-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2
              size={18}
              className="submit-spinner"
            />

            Submitting...
          </>
        ) : (
          <>
            Submit Enquiry

            <ArrowRight
              size={18}
            />
          </>
        )}
      </button>

      {/* ===============================================
          SUCCESS
      =============================================== */}

      {success && (
        <div className="form-success">
          <CheckCircle2
            size={20}
          />

          <div>
            <strong>
              Enquiry submitted
              successfully!
            </strong>

            <span>
              Our team will contact
              you regarding your
              testing requirement.
            </span>
          </div>
        </div>
      )}

      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <small className="form-note">
        Your information will only
        be used to respond to your
        testing enquiry.
      </small>

      {/* ===============================================
          SAMPLE COLLECTION STYLES
      =============================================== */}

      <style jsx>{`
        .collection-request-box {
          padding: 18px;

          border: 1px solid
            rgba(
              15,
              23,
              42,
              0.09
            );

          border-radius: 14px;

          background: #f8fafc;
        }

        .collection-request-heading {
          display: flex;
          align-items: flex-start;

          gap: 12px;
        }

        .collection-request-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex: 0 0 38px;

          border-radius: 10px;

          background:
            rgba(
              156,
              201,
              0,
              0.12
            );

          color: #789c00;
        }

        .collection-request-heading
          > div:last-child {
          display: flex;
          flex-direction: column;

          gap: 4px;
        }

        .collection-request-heading
          strong {
          color: #0f172a;

          font-size: 14px;
          font-weight: 750;
        }

        .collection-request-heading
          span {
          color: #64748b;

          font-size: 11px;
          line-height: 1.55;
        }

        .collection-options {
          display: grid;

          grid-template-columns:
            0.65fr
            1.35fr;

          gap: 9px;

          margin-top: 16px;
        }

        .collection-option {
          min-height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 10px 12px;

          border: 1px solid
            #e2e8f0;

          border-radius: 10px;

          background: #ffffff;
          color: #64748b;

          cursor: pointer;

          font-size: 12px;
          font-weight: 700;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .collection-option:hover {
          transform:
            translateY(-1px);

          border-color:
            rgba(
              156,
              201,
              0,
              0.55
            );
        }

        .collection-option input {
          position: absolute;

          opacity: 0;

          pointer-events: none;
        }

        .collection-option-active {
          border-color: #9cc900;

          background:
            rgba(
              156,
              201,
              0,
              0.09
            );

          color: #607d00;
        }

        .collection-details {
          display: grid;

          gap: 10px;

          margin-top: 14px;
          padding-top: 14px;

          border-top: 1px solid
            #e2e8f0;
        }

        .collection-field {
          position: relative;

          display: flex;
          align-items: center;
        }

        .collection-field svg {
          position: absolute;

          left: 14px;

          z-index: 1;

          color: #94a3b8;

          pointer-events: none;
        }

        .collection-field input {
          width: 100%;
          min-height: 46px;

          padding:
            11px
            14px
            11px
            42px;

          border: 1px solid
            #e2e8f0;

          border-radius: 10px;

          outline: none;

          background: #ffffff;
          color: #0f172a;

          font-family: inherit;
          font-size: 13px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .collection-field
          input:focus {
          border-color:
            rgba(
              156,
              201,
              0,
              0.85
            );

          box-shadow:
            0 0 0 3px
            rgba(
              156,
              201,
              0,
              0.1
            );
        }

        .collection-help {
          display: block;

          color: #94a3b8;

          font-size: 10px;
          line-height: 1.55;
        }

        @media (
          max-width: 600px
        ) {
          .collection-options {
            grid-template-columns:
              1fr;
          }

          .collection-option {
            justify-content:
              flex-start;
          }
        }
      `}</style>
    </form>
  );
}