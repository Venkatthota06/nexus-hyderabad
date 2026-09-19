"use client";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  LinkIcon,
  Loader2,
  Mail,
  Megaphone,
  Phone,
  Save,
  Target,
  UserRound,
} from "lucide-react";

import "./prospect.css";

/* =========================================================
   TYPES
========================================================= */

type Prospect = {
  id: string;

  companyId: string | null;
  leadId: string | null;

  companyName: string;

  contactName: string | null;
  designation: string | null;

  linkedin: string | null;
  email: string | null;
  phone: string | null;

  industry: string | null;
  source: string;

  targetService: string | null;

  outreachStatus: string;
  priority: string;

  lastContacted: string | null;
  nextFollowUp: string | null;

  converted: boolean;
  convertedDate: string | null;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
};

type Company = {
  id: string;
  name: string;
};

function dateInputValue(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}

/* =========================================================
   PAGE
========================================================= */

export default function ProspectDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const id =
    params.id;

  const [
    prospect,
    setProspect,
  ] =
    useState<Prospect | null>(
      null
    );

  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    converting,
    setConverting,
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
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [
          prospectResponse,
          companiesResponse,
        ] =
          await Promise.all([
            fetch(
              `/api/marketing-prospects/${id}`,
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/companies",
              {
                cache:
                  "no-store",
              }
            ),
          ]);

        const prospectData =
          await prospectResponse.json();

        if (
          !prospectResponse.ok
        ) {
          setError(
            prospectData.error ||
              "Unable to load prospect."
          );

          return;
        }

        setProspect(
          prospectData
        );

        if (
          companiesResponse.ok
        ) {
          const companyData =
            await companiesResponse.json();

          const rows =
            Array.isArray(
              companyData
            )
              ? companyData
              : companyData.companies ||
                companyData.results ||
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
        }
      } catch (error) {
        console.error(
          "Load prospect error:",
          error
        );

        setError(
          "Unable to load prospect."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  /* =======================================================
     SAVE PROSPECT
  ======================================================= */

  async function handleSave(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!prospect) {
      return;
    }

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
    };

    try {
      const response =
        await fetch(
          `/api/marketing-prospects/${id}`,
          {
            method: "PUT",

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
            "Unable to save prospect."
        );

        return;
      }

      setProspect(data);

      setMessage(
        "Prospect updated successfully."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Save prospect error:",
        error
      );

      setError(
        "Unable to save prospect."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     CONVERT PROSPECT
  ======================================================= */

  async function handleConvert() {
    if (!prospect) {
      return;
    }

    const conversionForm =
      document.getElementById(
        "prospect-form"
      ) as HTMLFormElement | null;

    if (!conversionForm) {
      return;
    }

    const formData =
      new FormData(
        conversionForm
      );

    const contactName =
      formData
        .get("contactName")
        ?.toString()
        .trim() || "";

    const companyName =
      formData
        .get("companyName")
        ?.toString()
        .trim() || "";

    const phone =
      formData
        .get("phone")
        ?.toString()
        .trim() || "";

    const email =
      formData
        .get("email")
        ?.toString()
        .trim() || "";

    const service =
      formData
        .get("targetService")
        ?.toString()
        .trim() || "";

    const requirement =
      formData
        .get("requirement")
        ?.toString()
        .trim() || "";

    const companyId =
      formData
        .get("companyId")
        ?.toString() || "";

    const notes =
      formData
        .get("notes")
        ?.toString() || "";

    if (!contactName) {
      setError(
        "Contact person is required for CRM conversion."
      );

      return;
    }

    if (!companyName) {
      setError(
        "Company name is required for CRM conversion."
      );

      return;
    }

    if (!phone) {
      setError(
        "Phone number is required for CRM conversion."
      );

      return;
    }

    if (!email) {
      setError(
        "Email is required for CRM conversion."
      );

      return;
    }

    if (!service) {
      setError(
        "Target service is required for CRM conversion."
      );

      return;
    }

    if (!requirement) {
      setError(
        "Client requirement is required for CRM conversion."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Convert this marketing prospect into a CRM Lead?"
      );

    if (!confirmed) {
      return;
    }

    setConverting(true);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          `/api/marketing-prospects/${id}/convert`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                companyId,
                companyName,
                contactName,
                phone,
                email,
                service,
                requirement,
                notes,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status ===
            409 &&
          data.companyId
        ) {
          setError(
            "This prospect is already converted."
          );

          return;
        }

        setError(
          data.error ||
            "Unable to convert prospect."
        );

        return;
      }

      setMessage(
        "Prospect converted to CRM Lead successfully."
      );

      setTimeout(() => {
        router.push(
          `/admin/companies/${data.companyId}`
        );
      }, 700);
    } catch (error) {
      console.error(
        "Conversion error:",
        error
      );

      setError(
        "Unable to convert prospect."
      );
    } finally {
      setConverting(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="prospect-page">
        <div className="prospect-loading">
          <Loader2
            size={25}
            className="spin"
          />

          Loading prospect...
        </div>
      </main>
    );
  }

  if (
    !prospect
  ) {
    return (
      <main className="prospect-page">
        <div className="prospect-error-state">
          <h2>
            Prospect not found
          </h2>

          <p>
            {error ||
              "The requested marketing prospect could not be found."}
          </p>

          <Link href="/admin/digital-marketing">
            Back to Digital Marketing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="prospect-page">

      {/* ===================================================
          TOP NAVIGATION
      ==================================================== */}

      <div className="prospect-back-row">

        <Link href="/admin/digital-marketing">
          <ArrowLeft size={14} />

          Digital Marketing
        </Link>

        {prospect.converted && (
          <span className="prospect-converted-pill">
            <CheckCircle2
              size={13}
            />

            Converted
          </span>
        )}

      </div>

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="prospect-hero">

        <div className="prospect-hero-main">

          <div className="prospect-hero-icon">
            <Building2
              size={25}
            />
          </div>

          <div>
            <span>
              DIGITAL MARKETING PROSPECT
            </span>

            <h1>
              {prospect.companyName}
            </h1>

            <p>
              {prospect.contactName
                ? `${prospect.contactName}${
                    prospect.designation
                      ? ` • ${prospect.designation}`
                      : ""
                  }`
                : "Contact person not added"}
            </p>
          </div>

        </div>

        <div className="prospect-hero-actions">

          {prospect.linkedin && (
            <a
              href={
                prospect.linkedin
              }
              target="_blank"
              rel="noreferrer"
            >
              <LinkIcon
                size={14}
              />

              LinkedIn
            </a>
          )}

          {prospect.companyId && (
            <Link
              href={`/admin/companies/${prospect.companyId}`}
            >
              Company 360

              <ArrowRight
                size={14}
              />
            </Link>
          )}

        </div>

      </section>

      {/* ===================================================
          QUICK INFO
      ==================================================== */}

      <section className="prospect-summary-grid">

        <SummaryCard
          icon={
            <Target size={17} />
          }
          label="Outreach Status"
          value={
            prospect.converted
              ? "Converted"
              : prospect.outreachStatus
          }
        />

        <SummaryCard
          icon={
            <Megaphone
              size={17}
            />
          }
          label="Source"
          value={
            prospect.source
          }
        />

        <SummaryCard
          icon={
            <CalendarDays
              size={17}
            />
          }
          label="Next Follow-up"
          value={
            prospect.nextFollowUp
              ? new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    day:
                      "2-digit",
                    month:
                      "short",
                    year:
                      "numeric",
                  }
                ).format(
                  new Date(
                    prospect.nextFollowUp
                  )
                )
              : "Not scheduled"
          }
        />

        <SummaryCard
          icon={
            <CheckCircle2
              size={17}
            />
          }
          label="CRM Status"
          value={
            prospect.converted
              ? "CRM Lead Created"
              : "Not Converted"
          }
        />

      </section>

      {/* ===================================================
          FORM
      ==================================================== */}

      <form
        id="prospect-form"
        onSubmit={
          handleSave
        }
        className="prospect-form"
      >

        {/* COMPANY */}

        <section className="prospect-panel">

          <div className="prospect-panel-title">

            <Building2
              size={18}
            />

            <div>
              <h2>
                Company Information
              </h2>

              <p>
                Prospect organisation
                and CRM relationship.
              </p>
            </div>

          </div>

          <div className="prospect-grid">

            <Field
              label="Company / Prospect Name *"
            >
              <input
                name="companyName"
                required
                defaultValue={
                  prospect.companyName
                }
                disabled={
                  prospect.converted
                }
              />
            </Field>

            <Field
              label="Link Existing CRM Company"
            >
              <select
                name="companyId"
                defaultValue={
                  prospect.companyId ||
                  ""
                }
                disabled={
                  prospect.converted
                }
              >
                <option value="">
                  Create new company when converted
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
                name="industry"
                defaultValue={
                  prospect.industry ||
                  ""
                }
                disabled={
                  prospect.converted
                }
              />
            </Field>

            <Field label="Source">
              <select
                name="source"
                defaultValue={
                  prospect.source
                }
                disabled={
                  prospect.converted
                }
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

        {/* CONTACT */}

        <section className="prospect-panel">

          <div className="prospect-panel-title">

            <UserRound
              size={18}
            />

            <div>
              <h2>
                Contact Person
              </h2>

              <p>
                Decision maker or
                company contact.
              </p>
            </div>

          </div>

          <div className="prospect-grid">

            <Field
              label="Contact Person *"
            >
              <input
                name="contactName"
                defaultValue={
                  prospect.contactName ||
                  ""
                }
                disabled={
                  prospect.converted
                }
              />
            </Field>

            <Field label="Designation">
              <input
                name="designation"
                defaultValue={
                  prospect.designation ||
                  ""
                }
                disabled={
                  prospect.converted
                }
              />
            </Field>

            <Field
              label="Phone *"
            >
              <div className="prospect-input-icon">
                <Phone
                  size={14}
                />

                <input
                  name="phone"
                  defaultValue={
                    prospect.phone ||
                    ""
                  }
                  disabled={
                    prospect.converted
                  }
                />
              </div>
            </Field>

            <Field
              label="Email *"
            >
              <div className="prospect-input-icon">
                <Mail
                  size={14}
                />

                <input
                  name="email"
                  type="email"
                  defaultValue={
                    prospect.email ||
                    ""
                  }
                  disabled={
                    prospect.converted
                  }
                />
              </div>
            </Field>

            <Field
              label="LinkedIn Profile"
              full
            >
              <input
                name="linkedin"
                type="url"
                defaultValue={
                  prospect.linkedin ||
                  ""
                }
                disabled={
                  prospect.converted
                }
              />
            </Field>

          </div>

        </section>

        {/* OPPORTUNITY */}

        <section className="prospect-panel">

          <div className="prospect-panel-title">

            <Target
              size={18}
            />

            <div>
              <h2>
                Opportunity & Follow-up
              </h2>

              <p>
                Track service requirement
                and current outreach
                stage.
              </p>
            </div>

          </div>

          <div className="prospect-grid">

            <Field
              label="Target Service *"
            >
              <select
                name="targetService"
                defaultValue={
                  prospect.targetService ||
                  ""
                }
                disabled={
                  prospect.converted
                }
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

            <Field
              label="Outreach Status"
            >
              <select
                name="outreachStatus"
                defaultValue={
                  prospect.converted
                    ? "Converted"
                    : prospect.outreachStatus
                }
                disabled={
                  prospect.converted
                }
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

                <option value="Converted">
                  Converted
                </option>
              </select>
            </Field>

            <Field label="Priority">
              <select
                name="priority"
                defaultValue={
                  prospect.priority
                }
                disabled={
                  prospect.converted
                }
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
                name="lastContacted"
                type="date"
                defaultValue={dateInputValue(
                  prospect.lastContacted
                )}
                disabled={
                  prospect.converted
                }
              />
            </Field>

            <Field label="Next Follow-up">
              <input
                name="nextFollowUp"
                type="date"
                defaultValue={dateInputValue(
                  prospect.nextFollowUp
                )}
                disabled={
                  prospect.converted
                }
              />
            </Field>

            {/* REQUIRED ONLY FOR LEAD CONVERSION */}

            <Field
              label="Client Requirement *"
              full
            >
              <textarea
                name="requirement"
                rows={4}
                placeholder="Example: Client requires drinking water testing for office facility..."
                disabled={
                  prospect.converted
                }
              />
            </Field>

            <Field
              label="Notes"
              full
            >
              <textarea
                name="notes"
                rows={5}
                defaultValue={
                  prospect.notes ||
                  ""
                }
                disabled={
                  prospect.converted
                }
              />
            </Field>

          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div className="prospect-success-message">
            <CheckCircle2
              size={16}
            />

            {message}
          </div>
        )}

        {error && (
          <div className="prospect-error-message">
            {error}
          </div>
        )}

        {/* ACTIONS */}

        <div className="prospect-actions">

          <Link href="/admin/digital-marketing">
            Cancel
          </Link>

          {!prospect.converted && (
            <>
              <button
                type="submit"
                className="prospect-save-button"
                disabled={
                  saving ||
                  converting
                }
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={15}
                    />

                    Save Prospect
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleConvert
                }
                className="prospect-convert-button"
                disabled={
                  saving ||
                  converting
                }
              >
                {converting ? (
                  <>
                    <Loader2
                      size={15}
                      className="spin"
                    />

                    Converting...
                  </>
                ) : (
                  <>
                    <ArrowRight
                      size={15}
                    />

                    Convert to CRM Lead
                  </>
                )}
              </button>
            </>
          )}

          {prospect.converted &&
            prospect.companyId && (
              <Link
                href={`/admin/companies/${prospect.companyId}`}
                className="prospect-company-button"
              >
                Open Company 360

                <ExternalLink
                  size={14}
                />
              </Link>
            )}

        </div>

      </form>

    </main>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children:
    React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`prospect-field ${
        full
          ? "prospect-field-full"
          : ""
      }`}
    >
      <label>
        {label}
      </label>

      {children}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="prospect-summary-card">

      <div>
        {icon}
      </div>

      <section>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </section>

    </article>
  );
}