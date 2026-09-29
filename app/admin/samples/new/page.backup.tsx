"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  FlaskConical,
  Hash,
  Loader2,
  MapPin,
  NotebookPen,
  PackageCheck,
  Save,
  Sparkles,
  TestTube2,
  Truck,
  UserRound,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  status: string;
};

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  status: string;
};

const sampleStatuses = [
  "Planned",
  "Collected",
  "Dispatched",
  "Received at Lab",
  "Testing",
  "Completed",
  "Report Delivered",
];

const reportStatuses = [
  "Pending",
  "Partial Report",
  "Ready",
  "Delivered",
];

export default function AddSamplePage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [companyId, setCompanyId] = useState("");
  const [quotationId, setQuotationId] = useState("");

  const [sampleNumber, setSampleNumber] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [sampleCount, setSampleCount] = useState("1");

  const [collectionDate, setCollectionDate] = useState("");
  const [collectedBy, setCollectedBy] = useState("");

  const [status, setStatus] = useState("Planned");

  const [testingLocation, setTestingLocation] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] =
    useState("");

  const [reportStatus, setReportStatus] = useState("Pending");
  const [reportDeliveredDate, setReportDeliveredDate] =
    useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     LOAD COMPANIES + QUOTATIONS
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [companyResponse, quotationResponse] =
          await Promise.all([
            fetch("/api/companies", {
              cache: "no-store",
            }),

            fetch("/api/quotations", {
              cache: "no-store",
            }),
          ]);

        const companyData = await companyResponse.json();
        const quotationData = await quotationResponse.json();

        if (!companyResponse.ok) {
          throw new Error(
            companyData.message ||
              "Unable to load companies."
          );
        }

        if (!quotationResponse.ok) {
          throw new Error(
            quotationData.message ||
              "Unable to load quotations."
          );
        }

        setCompanies(companyData);
        setQuotations(quotationData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load sample form."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =========================================================
     COMPANY QUOTATIONS
  ========================================================= */

  const companyQuotations = useMemo(() => {
    if (!companyId) {
      return [];
    }

    return quotations.filter(
      (quotation) => quotation.companyId === companyId
    );
  }, [companyId, quotations]);

  function handleCompanyChange(value: string) {
    setCompanyId(value);
    setQuotationId("");
  }

  /* =========================================================
     SAVE SAMPLE
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/samples", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          companyId,
          quotationId,
          sampleNumber,
          sampleType,
          sampleCount: Number(sampleCount),

          collectionDate,
          collectedBy,

          status,

          testingLocation,
          expectedCompletionDate,

          reportStatus,
          reportDeliveredDate,

          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create sample."
        );
      }

      router.push("/admin/samples");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="sample-form-loading">
        <div>
          <Loader2 size={22} className="animate-spin" />

          <span>
            <strong>Preparing Sample Form</strong>
            Loading companies and quotations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="sample-form-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sample-form-header">
        <div>
          <Link
            href="/admin/samples"
            className="sample-form-back"
          >
            <ArrowLeft size={14} />
            Back to Samples
          </Link>

          <div className="sample-form-eyebrow">
            <Sparkles size={12} />
            Laboratory Operations
          </div>

          <h1>Add Sample</h1>

          <p>
            Record sample collection, transportation,
            laboratory testing and report progress in one
            operational record.
          </p>
        </div>

        <div className="sample-form-header-icon">
          <FlaskConical size={26} />
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="sample-form-error">
          <FileText size={16} />

          <div>
            <strong>Sample could not be processed</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="sample-form-main"
      >
        {/* ===================================================
            CLIENT & QUOTATION
        ==================================================== */}

        <SampleFormSection
          icon={<Building2 size={18} />}
          eyebrow="Client"
          title="Client & Reference"
          description="Connect this sample with the correct company and quotation."
          type="blue"
        >
          <div className="sample-form-grid two">
            <SampleField
              label="Company"
              required
              icon={<Building2 size={14} />}
            >
              <select
                value={companyId}
                onChange={(e) =>
                  handleCompanyChange(e.target.value)
                }
                required
              >
                <option value="">Select company</option>

                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name} — {company.status}
                  </option>
                ))}
              </select>
            </SampleField>

            <SampleField
              label="Linked Quotation"
              icon={<ClipboardList size={14} />}
            >
              <select
                value={quotationId}
                onChange={(e) =>
                  setQuotationId(e.target.value)
                }
                disabled={!companyId}
              >
                <option value="">
                  No quotation linked
                </option>

                {companyQuotations.map((quotation) => (
                  <option
                    key={quotation.id}
                    value={quotation.id}
                  >
                    {quotation.quotationNumber} —{" "}
                    {quotation.service} —{" "}
                    {quotation.status}
                  </option>
                ))}
              </select>

              {companyId &&
                companyQuotations.length === 0 && (
                  <small className="sample-form-help">
                    No quotations found for this company.
                  </small>
                )}
            </SampleField>
          </div>
        </SampleFormSection>

        {/* ===================================================
            SAMPLE DETAILS
        ==================================================== */}

        <SampleFormSection
          icon={<TestTube2 size={18} />}
          eyebrow="Identification"
          title="Sample Details"
          description="Record the sample reference, material type and physical sample quantity."
          type="cyan"
        >
          <div className="sample-form-grid three">
            <SampleField
              label="Sample Number"
              required
              icon={<Hash size={14} />}
            >
              <input
                type="text"
                value={sampleNumber}
                onChange={(e) =>
                  setSampleNumber(e.target.value)
                }
                placeholder="NTL-HYD-S-001"
                required
              />
            </SampleField>

            <SampleField
              label="Sample Type"
              required
              icon={<FlaskConical size={14} />}
            >
              <input
                type="text"
                value={sampleType}
                onChange={(e) =>
                  setSampleType(e.target.value)
                }
                placeholder="Example: Drinking Water"
                required
              />
            </SampleField>

            <SampleField
              label="Sample Count"
              required
              icon={<PackageCheck size={14} />}
            >
              <input
                type="number"
                min="1"
                value={sampleCount}
                onChange={(e) =>
                  setSampleCount(e.target.value)
                }
                required
              />
            </SampleField>
          </div>

          <div className="sample-form-quantity">
            <div className="sample-form-quantity-icon">
              <TestTube2 size={18} />
            </div>

            <div>
              <span>Physical Samples</span>
              <strong>
                {Number(sampleCount || 0)}
              </strong>
            </div>

            <small>
              Quantity registered under this sample record
            </small>
          </div>
        </SampleFormSection>

        {/* ===================================================
            COLLECTION
        ==================================================== */}

        <SampleFormSection
          icon={<Truck size={18} />}
          eyebrow="Field Operations"
          title="Collection & Movement"
          description="Track when the sample was collected, who collected it and its current operational stage."
          type="orange"
        >
          <div className="sample-form-grid three">
            <SampleField
              label="Collection Date"
              icon={<CalendarDays size={14} />}
            >
              <input
                type="date"
                value={collectionDate}
                onChange={(e) =>
                  setCollectionDate(e.target.value)
                }
              />
            </SampleField>

            <SampleField
              label="Collected By"
              icon={<UserRound size={14} />}
            >
              <input
                type="text"
                value={collectedBy}
                onChange={(e) =>
                  setCollectedBy(e.target.value)
                }
                placeholder="Example: Venkat"
              />
            </SampleField>

            <SampleField
              label="Sample Status"
              icon={<Truck size={14} />}
            >
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                {sampleStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </SampleField>
          </div>

          <SampleLifecycle currentStatus={status} />
        </SampleFormSection>

        {/* ===================================================
            TESTING
        ==================================================== */}

        <SampleFormSection
          icon={<FlaskConical size={18} />}
          eyebrow="Laboratory"
          title="Testing Details"
          description="Record where testing will be performed and the expected completion date."
          type="purple"
        >
          <div className="sample-form-grid two">
            <SampleField
              label="Testing Location"
              icon={<MapPin size={14} />}
            >
              <input
                type="text"
                value={testingLocation}
                onChange={(e) =>
                  setTestingLocation(e.target.value)
                }
                placeholder="Example: Bangalore Laboratory"
              />
            </SampleField>

            <SampleField
              label="Expected Completion Date"
              icon={<CalendarDays size={14} />}
            >
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) =>
                  setExpectedCompletionDate(
                    e.target.value
                  )
                }
              />
            </SampleField>
          </div>
        </SampleFormSection>

        {/* ===================================================
            REPORT
        ==================================================== */}

        <SampleFormSection
          icon={<FileCheck2 size={18} />}
          eyebrow="Reporting"
          title="Report Tracking"
          description="Monitor the report progress and final client delivery."
          type="green"
        >
          <div className="sample-form-grid two">
            <SampleField
              label="Report Status"
              icon={<FileCheck2 size={14} />}
            >
              <select
                value={reportStatus}
                onChange={(e) => {
                  const nextStatus = e.target.value;

                  setReportStatus(nextStatus);

                  if (nextStatus !== "Delivered") {
                    setReportDeliveredDate("");
                  }
                }}
              >
                {reportStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </SampleField>

            <SampleField
              label="Report Delivered Date"
              icon={<CalendarDays size={14} />}
            >
              <input
                type="date"
                value={reportDeliveredDate}
                onChange={(e) =>
                  setReportDeliveredDate(
                    e.target.value
                  )
                }
                disabled={reportStatus !== "Delivered"}
              />

              {reportStatus !== "Delivered" && (
                <small className="sample-form-help">
                  Select report status as Delivered to
                  enable this date.
                </small>
              )}
            </SampleField>
          </div>

          <div
            className={`sample-form-report-state ${
              reportStatus === "Delivered"
                ? "delivered"
                : ""
            }`}
          >
            <div>
              {reportStatus === "Delivered" ? (
                <CheckCircle2 size={18} />
              ) : (
                <FileText size={18} />
              )}
            </div>

            <span>
              <small>Current Report Status</small>
              <strong>{reportStatus}</strong>
            </span>
          </div>
        </SampleFormSection>

        {/* ===================================================
            NOTES
        ==================================================== */}

        <SampleFormSection
          icon={<NotebookPen size={18} />}
          eyebrow="Internal"
          title="Sample Notes"
          description="Add sample condition, courier details, laboratory instructions or other operational notes."
          type="navy"
        >
          <SampleField
            label="Notes"
            icon={<NotebookPen size={14} />}
          >
            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows={4}
              placeholder="Sample condition, courier information, testing instructions or report comments..."
            />
          </SampleField>
        </SampleFormSection>

        {/* ===================================================
            SAVE
        ==================================================== */}

        <div className="sample-form-submit-wrap">
          <div className="sample-form-submit-info">
            <div>
              <FlaskConical size={17} />
            </div>

            <span>
              <strong>Ready to register sample?</strong>
              <small>
                Confirm the sample and collection details
                before saving.
              </small>
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="sample-form-submit"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            <span>
              {saving
                ? "Saving Sample..."
                : "Register Sample"}
            </span>

            {!saving && <ArrowRight size={15} />}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function SampleFormSection({
  icon,
  eyebrow,
  title,
  description,
  type,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  type:
    | "blue"
    | "cyan"
    | "orange"
    | "purple"
    | "green"
    | "navy";
  children: React.ReactNode;
}) {
  return (
    <section className={`sample-form-section ${type}`}>
      <div className="sample-form-section-head">
        <div className="sample-form-section-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="sample-form-section-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function SampleField({
  label,
  required = false,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="sample-form-field">
      <span className="sample-form-label">
        {icon}
        {label}

        {required && <em>*</em>}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   SAMPLE LIFECYCLE
========================================================= */

function SampleLifecycle({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const stages = [
    "Planned",
    "Collected",
    "Dispatched",
    "Received at Lab",
    "Testing",
    "Completed",
    "Report Delivered",
  ];

  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="sample-form-lifecycle">
      <div className="sample-form-lifecycle-title">
        <span>Sample Lifecycle</span>
        <strong>{currentStatus}</strong>
      </div>

      <div className="sample-form-lifecycle-track">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={`sample-form-lifecycle-stage ${
              index <= currentIndex ? "active" : ""
            } ${
              index === currentIndex ? "current" : ""
            }`}
          >
            <div>
              {index < currentIndex ? (
                <CheckCircle2 size={12} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            <small>{stage}</small>
          </div>
        ))}
      </div>
    </div>
  );
}