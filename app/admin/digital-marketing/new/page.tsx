"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  LinkIcon,
  Loader2,
  Megaphone,
  Target,
  UserRound,
} from "lucide-react";

import "./new-prospect.css";

/* =========================================================
   TYPES
========================================================= */

type Company = {
  id: string;
  name: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function NewMarketingProspectPage() {
  const router =
    useRouter();

  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);

  const [
    companiesLoading,
    setCompaniesLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     LOAD CRM COMPANIES
  ======================================================= */

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response =
          await fetch(
            "/api/companies",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const rows =
          Array.isArray(data)
            ? data
            : data.companies ||
              data.results ||
              [];

        setCompanies(
          rows.map(
            (
              company: any
            ) => ({
              id:
                company.id,

              name:
                company.name,
            })
          )
        );
      } catch (error) {
        console.error(
          "Load companies error:",
          error
        );
      } finally {
        setCompaniesLoading(
          false
        );
      }
    }

    loadCompanies();
  }, []);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const formData =
      new FormData(
        event.currentTarget
      );

    const payload = {
      companyId:
        formData
          .get("companyId")
          ?.toString() || "",

      companyName:
        formData
          .get("companyName")
          ?.toString() || "",

      contactName:
        formData
          .get("contactName")
          ?.toString() || "",

      designation:
        formData
          .get("designation")
          ?.toString() || "",

      linkedin:
        formData
          .get("linkedin")
          ?.toString() || "",

      email:
        formData
          .get("email")
          ?.toString() || "",

      phone:
        formData
          .get("phone")
          ?.toString() || "",

      industry:
        formData
          .get("industry")
          ?.toString() || "",

      source:
        formData
          .get("source")
          ?.toString() ||
        "LinkedIn",

      targetService:
        formData
          .get("targetService")
          ?.toString() || "",

      outreachStatus:
        formData
          .get("outreachStatus")
          ?.toString() ||
        "Identified",

      priority:
        formData
          .get("priority")
          ?.toString() ||
        "Medium",

      lastContacted:
        formData
          .get("lastContacted")
          ?.toString() || "",

      nextFollowUp:
        formData
          .get("nextFollowUp")
          ?.toString() || "",

      notes:
        formData
          .get("notes")
          ?.toString() || "",

      converted: false,
    };

    try {
      const response =
        await fetch(
          "/api/marketing-prospects",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to save marketing prospect."
        );

        return;
      }

      setMessage(
        "Marketing prospect saved successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/digital-marketing"
        );

        router.refresh();
      }, 600);
    } catch (error) {
      console.error(
        "Create prospect error:",
        error
      );

      setError(
        "Something went wrong while saving the prospect."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="dm-new-page">

      {/* ===================================================
          BACK
      ==================================================== */}

      <div className="dm-new-back">

        <Link href="/admin/digital-marketing">
          <ArrowLeft size={14} />

          Digital Marketing
        </Link>

        <span>
          Hyderabad Operations CRM
        </span>

      </div>

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="dm-new-hero">

        <div className="dm-new-hero-icon">
          <Megaphone
            size={24}
          />
        </div>

        <div>
          <span>
            DIGITAL MARKETING
          </span>

          <h1>
            Add Marketing Prospect
          </h1>

          <p>
            Add a real target company,
            decision maker or online
            prospect to the Hyderabad
            business development
            pipeline.
          </p>
        </div>

      </section>

      {/* ===================================================
          FORM
      ==================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="dm-new-form"
      >

        {/* =================================================
            COMPANY
        ================================================= */}

        <section className="dm-new-panel">

          <PanelHeading
            icon={
              <Building2
                size={17}
              />
            }
            title="Company Information"
            description="Organisation details and optional CRM relationship."
          />

          <div className="dm-new-grid">

            <Field
              label="Company / Prospect Name *"
            >
              <input
                id="companyName"
                name="companyName"
                required
                placeholder="Enter organisation name"
              />
            </Field>

            <Field
              label="Link Existing CRM Company"
              helper="Leave this blank when the organisation is not yet an existing CRM client."
            >
              <select
                id="companyId"
                name="companyId"
                disabled={
                  companiesLoading
                }
                defaultValue=""
              >
                <option value="">
                  {companiesLoading
                    ? "Loading companies..."
                    : "Not linked"}
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={
                        company.id
                      }
                      value={
                        company.id
                      }
                    >
                      {
                        company.name
                      }
                    </option>
                  )
                )}

              </select>
            </Field>

            <Field label="Industry">
              <input
                id="industry"
                name="industry"
                placeholder="Hospital, Corporate, Food, Pharma..."
              />
            </Field>

            <Field label="Prospect Source">
              <select
                id="source"
                name="source"
                defaultValue="LinkedIn"
              >
                <option value="LinkedIn">
                  LinkedIn
                </option>

                <option value="Google">
                  Google
                </option>

                <option value="Website">
                  Website
                </option>

                <option value="Email Campaign">
                  Email Campaign
                </option>

                <option value="Referral">
                  Referral
                </option>

                <option value="Walk-in">
                  Walk-in
                </option>

                <option value="Existing Client Reference">
                  Existing Client Reference
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </Field>

          </div>

        </section>

        {/* =================================================
            CONTACT
        ================================================= */}

        <section className="dm-new-panel">

          <PanelHeading
            icon={
              <UserRound
                size={17}
              />
            }
            title="Decision Maker / Contact"
            description="Facility, EHS, workplace, administration, procurement or other relevant contact."
          />

          <div className="dm-new-grid">

            <Field label="Contact Person">
              <input
                id="contactName"
                name="contactName"
                placeholder="Enter contact name"
              />
            </Field>

            <Field label="Designation">
              <input
                id="designation"
                name="designation"
                placeholder="Facility Manager, EHS Manager..."
              />
            </Field>

            <Field
              label="LinkedIn Profile"
              helper="You can open this profile directly later from the Digital Marketing pipeline."
            >
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
              />
            </Field>

            <Field label="Email">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
              />
            </Field>

            <Field label="Phone">
              <input
                id="phone"
                name="phone"
                placeholder="+91..."
              />
            </Field>

          </div>

        </section>

        {/* =================================================
            OUTREACH
        ================================================= */}

        <section className="dm-new-panel">

          <PanelHeading
            icon={
              <Target
                size={17}
              />
            }
            title="Outreach & Opportunity"
            description="Track the target service, current sales stage and next action."
          />

          <div className="dm-new-grid">

            <Field label="Target Service">
              <select
                id="targetService"
                name="targetService"
                defaultValue=""
              >
                <option value="">
                  Select service
                </option>

                <option value="Water Testing">
                  Water Testing
                </option>

                <option value="RO Water Testing">
                  RO Water Testing
                </option>

                <option value="Food Testing">
                  Food Testing
                </option>

                <option value="Indoor Air Quality">
                  Indoor Air Quality
                </option>

                <option value="Ambient Air Quality">
                  Ambient Air Quality
                </option>

                <option value="Workplace Monitoring">
                  Workplace Monitoring
                </option>

                <option value="Environmental Monitoring">
                  Environmental Monitoring
                </option>

                <option value="Multiple Services">
                  Multiple Services
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </Field>

            <Field label="Outreach Status">
              <select
                id="outreachStatus"
                name="outreachStatus"
                defaultValue="Identified"
              >
                <option value="Identified">
                  Identified
                </option>

                <option value="Contacted">
                  Contacted
                </option>

                <option value="Follow-up">
                  Follow-up
                </option>

                <option value="Response Received">
                  Response Received
                </option>

                <option value="Meeting Scheduled">
                  Meeting Scheduled
                </option>

                <option value="Qualified">
                  Qualified
                </option>

                <option value="Not Interested">
                  Not Interested
                </option>
              </select>
            </Field>

            <Field label="Priority">
              <select
                id="priority"
                name="priority"
                defaultValue="Medium"
              >
                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>
              </select>
            </Field>

            <Field label="Last Contacted">
              <input
                id="lastContacted"
                name="lastContacted"
                type="date"
              />
            </Field>

            <Field label="Next Follow-up">
              <input
                id="nextFollowUp"
                name="nextFollowUp"
                type="date"
              />
            </Field>

            <Field
              label="Notes"
              full
            >
              <textarea
                id="notes"
                name="notes"
                rows={5}
                placeholder="Requirement, discussion, response, decision maker information or next action..."
              />
            </Field>

          </div>

        </section>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="dm-new-success">

            <CheckCircle2
              size={16}
            />

            {message}

          </div>
        )}

        {error && (
          <div className="dm-new-error">
            {error}
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="dm-new-actions">

          <Link
            href="/admin/digital-marketing"
            className="dm-new-cancel"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="dm-new-submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2
                  size={15}
                  className="dm-new-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Megaphone
                  size={15}
                />

                Save Prospect
              </>
            )}
          </button>

        </div>

      </form>

    </main>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  helper,
  full = false,
  children,
}: {
  label: string;
  helper?: string;
  full?: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <div
      className={`dm-new-field ${
        full
          ? "dm-new-field-full"
          : ""
      }`}
    >
      <label>
        {label}
      </label>

      {children}

      {helper && (
        <small className="dm-new-helper">
          {helper}
        </small>
      )}
    </div>
  );
}

/* =========================================================
   PANEL HEADING
========================================================= */

function PanelHeading({
  icon,
  title,
  description,
}: {
  icon:
    React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="dm-new-panel-heading">

      <div className="dm-new-panel-icon">
        {icon}
      </div>

      <div>
        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>
      </div>

    </div>
  );
}