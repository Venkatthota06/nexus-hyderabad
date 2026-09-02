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
  FileCheck2,
  FileText,
  FlaskConical,
  FolderOpen,
  Hash,
  Loader2,
  Mail,
  NotebookPen,
  PackageCheck,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  status: string;
};

type Sample = {
  id: string;
  companyId: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  status: string;
  reportStatus: string;
};

const reportTypes = [
  "Partial Report",
  "Final Report",
];

const reportStatuses = [
  "Pending",
  "Under Preparation",
  "Ready",
  "Delivered",
];

const deliveryMethods = [
  "Email",
  "WhatsApp",
  "Client Portal",
  "Hard Copy",
  "Courier",
  "Hand Delivered",
];

export default function AddReportPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);

  const [companyId, setCompanyId] = useState("");
  const [sampleId, setSampleId] = useState("");

  const [reportNumber, setReportNumber] = useState("");
  const [reportType, setReportType] =
    useState("Final Report");
  const [reportDate, setReportDate] = useState("");

  const [status, setStatus] = useState("Pending");

  const [deliveredDate, setDeliveredDate] =
    useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState("");

  const [fileReference, setFileReference] =
    useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     LOAD COMPANIES + SAMPLES
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [companyResponse, sampleResponse] =
          await Promise.all([
            fetch("/api/companies", {
              cache: "no-store",
            }),

            fetch("/api/samples", {
              cache: "no-store",
            }),
          ]);

        const companyData =
          await companyResponse.json();
        const sampleData =
          await sampleResponse.json();

        if (!companyResponse.ok) {
          throw new Error(
            companyData.error ||
              companyData.message ||
              "Unable to load companies."
          );
        }

        if (!sampleResponse.ok) {
          throw new Error(
            sampleData.error ||
              sampleData.message ||
              "Unable to load samples."
          );
        }

        setCompanies(companyData);
        setSamples(sampleData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load report form."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =========================================================
     FILTER SAMPLES
  ========================================================= */

  const companySamples = useMemo(() => {
    if (!companyId) {
      return [];
    }

    return samples.filter(
      (sample) =>
        sample.companyId === companyId
    );
  }, [companyId, samples]);

  const selectedSample = useMemo(() => {
    return samples.find(
      (sample) => sample.id === sampleId
    );
  }, [sampleId, samples]);

  function handleCompanyChange(value: string) {
    setCompanyId(value);
    setSampleId("");
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function handleStatusChange(value: string) {
    setStatus(value);

    if (value !== "Delivered") {
      setDeliveredDate("");
      setDeliveryMethod("");
    }
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          companyId,
          sampleId,

          reportNumber,
          reportType,
          reportDate,

          status,

          deliveredDate,
          deliveryMethod,

          fileReference,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to create report."
        );
      }

      router.push("/admin/reports");
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
      <div className="report-form-loading">
        <div>
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            <strong>Preparing Report Form</strong>
            Loading companies and samples...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="report-form-page">
      {/* HEADER */}

      <header className="report-form-header">
        <div>
          <Link
            href="/admin/reports"
            className="report-form-back"
          >
            <ArrowLeft size={14} />
            Back to Reports
          </Link>

          <div className="report-form-eyebrow">
            <Sparkles size={12} />
            Laboratory Reporting
          </div>

          <h1>Create Report</h1>

          <p>
            Register and track laboratory reports from
            preparation through final client delivery.
          </p>
        </div>

        <div className="report-form-header-icon">
          <FileCheck2 size={26} />
        </div>
      </header>

      {error && (
        <div className="report-form-error">
          <FileText size={16} />

          <div>
            <strong>
              Report could not be processed
            </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="report-form-main"
      >
        {/* CLIENT & SAMPLE */}

        <ReportFormSection
          icon={<Building2 size={18} />}
          eyebrow="Client"
          title="Client & Sample"
          description="Connect this report with the correct company and laboratory sample."
          type="blue"
        >
          <div className="report-form-grid two">
            <ReportField
              label="Company"
              required
              icon={<Building2 size={14} />}
            >
              <select
                value={companyId}
                onChange={(e) =>
                  handleCompanyChange(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select company
                </option>

                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name} —{" "}
                    {company.status}
                  </option>
                ))}
              </select>
            </ReportField>

            <ReportField
              label="Sample"
              required
              icon={<FlaskConical size={14} />}
            >
              <select
                value={sampleId}
                onChange={(e) =>
                  setSampleId(e.target.value)
                }
                disabled={!companyId}
                required
              >
                <option value="">
                  Select sample
                </option>

                {companySamples.map((sample) => (
                  <option
                    key={sample.id}
                    value={sample.id}
                  >
                    {sample.sampleNumber} —{" "}
                    {sample.sampleType} —{" "}
                    {sample.status}
                  </option>
                ))}
              </select>

              {companyId &&
                companySamples.length === 0 && (
                  <small className="report-form-help">
                    No samples found for this
                    company.
                  </small>
                )}
            </ReportField>
          </div>

          {selectedSample && (
            <div className="report-form-sample-preview">
              <div className="report-form-sample-preview-icon">
                <FlaskConical size={18} />
              </div>

              <div>
                <span>Selected Sample</span>
                <strong>
                  {selectedSample.sampleNumber}
                </strong>
                <small>
                  {selectedSample.sampleType}
                </small>
              </div>

              <div>
                <span>Quantity</span>
                <strong>
                  {selectedSample.sampleCount}
                </strong>
                <small>Physical samples</small>
              </div>

              <div>
                <span>Sample Status</span>
                <strong>
                  {selectedSample.status}
                </strong>
                <small>
                  Report:{" "}
                  {selectedSample.reportStatus}
                </small>
              </div>
            </div>
          )}
        </ReportFormSection>

        {/* REPORT DETAILS */}

        <ReportFormSection
          icon={<FileText size={18} />}
          eyebrow="Document"
          title="Report Details"
          description="Define the report reference, report type and official report date."
          type="purple"
        >
          <div className="report-form-grid three">
            <ReportField
              label="Report Number"
              required
              icon={<Hash size={14} />}
            >
              <input
                type="text"
                value={reportNumber}
                onChange={(e) =>
                  setReportNumber(e.target.value)
                }
                placeholder="NTL/HYD/RPT/2026/001"
                required
              />
            </ReportField>

            <ReportField
              label="Report Type"
              icon={<FileText size={14} />}
            >
              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value)
                }
              >
                {reportTypes.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </ReportField>

            <ReportField
              label="Report Date"
              icon={<CalendarDays size={14} />}
            >
              <input
                type="date"
                value={reportDate}
                onChange={(e) =>
                  setReportDate(e.target.value)
                }
              />
            </ReportField>
          </div>
        </ReportFormSection>

        {/* STATUS */}

        <ReportFormSection
          icon={<PackageCheck size={18} />}
          eyebrow="Workflow"
          title="Report Status"
          description="Track the report from preparation through final client delivery."
          type="orange"
        >
          <ReportField
            label="Current Status"
            icon={<FileCheck2 size={14} />}
          >
            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(
                  e.target.value
                )
              }
            >
              {reportStatuses.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </ReportField>

          <ReportLifecycle
            currentStatus={status}
          />
        </ReportFormSection>

        {/* DELIVERY */}

        <ReportFormSection
          icon={<Send size={18} />}
          eyebrow="Client Delivery"
          title="Delivery Information"
          description="Record when and how the completed report was delivered to the client."
          type="green"
        >
          <div className="report-form-grid two">
            <ReportField
              label="Delivered Date"
              icon={<CalendarDays size={14} />}
            >
              <input
                type="date"
                value={deliveredDate}
                onChange={(e) =>
                  setDeliveredDate(
                    e.target.value
                  )
                }
                disabled={status !== "Delivered"}
              />

              {status !== "Delivered" && (
                <small className="report-form-help">
                  Available when report status is
                  Delivered.
                </small>
              )}
            </ReportField>

            <ReportField
              label="Delivery Method"
              icon={<Mail size={14} />}
            >
              <select
                value={deliveryMethod}
                onChange={(e) =>
                  setDeliveryMethod(
                    e.target.value
                  )
                }
                disabled={status !== "Delivered"}
              >
                <option value="">
                  Select method
                </option>

                {deliveryMethods.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </ReportField>
          </div>

          <div
            className={`report-form-delivery-state ${
              status === "Delivered"
                ? "delivered"
                : ""
            }`}
          >
            <div>
              {status === "Delivered" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Send size={18} />
              )}
            </div>

            <span>
              <small>Delivery Status</small>

              <strong>
                {status === "Delivered"
                  ? "Report Delivered"
                  : "Awaiting Delivery"}
              </strong>
            </span>
          </div>
        </ReportFormSection>

        {/* FILE */}

        <ReportFormSection
          icon={<FolderOpen size={18} />}
          eyebrow="Reference"
          title="Document Reference"
          description="Store the location or reference of the final laboratory report."
          type="cyan"
        >
          <ReportField
            label="File Reference"
            icon={<FolderOpen size={14} />}
          >
            <input
              type="text"
              value={fileReference}
              onChange={(e) =>
                setFileReference(e.target.value)
              }
              placeholder="Google Drive link, internal file path or report reference"
            />

            <small className="report-form-help">
              This currently stores a reference
              only. Actual file upload can be
              introduced later.
            </small>
          </ReportField>
        </ReportFormSection>

        {/* NOTES */}

        <ReportFormSection
          icon={<NotebookPen size={18} />}
          eyebrow="Internal"
          title="Report Notes"
          description="Record pending parameters, preparation details, delivery information or client comments."
          type="navy"
        >
          <ReportField
            label="Notes"
            icon={<NotebookPen size={14} />}
          >
            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows={4}
              placeholder="Report preparation, pending parameters, delivery information or client comments..."
            />
          </ReportField>
        </ReportFormSection>

        {/* SAVE */}

        <div className="report-form-submit-wrap">
          <div className="report-form-submit-info">
            <div>
              <FileCheck2 size={17} />
            </div>

            <span>
              <strong>
                Ready to create report?
              </strong>

              <small>
                Confirm the report and sample
                information before saving.
              </small>
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="report-form-submit"
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
                ? "Saving Report..."
                : "Create Report"}
            </span>

            {!saving && (
              <ArrowRight size={15} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function ReportFormSection({
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
    | "purple"
    | "orange"
    | "green"
    | "cyan"
    | "navy";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`report-form-section ${type}`}
    >
      <div className="report-form-section-head">
        <div className="report-form-section-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="report-form-section-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function ReportField({
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
    <label className="report-form-field">
      <span className="report-form-label">
        {icon}
        {label}

        {required && <em>*</em>}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   LIFECYCLE
========================================================= */

function ReportLifecycle({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const stages = [
    "Pending",
    "Under Preparation",
    "Ready",
    "Delivered",
  ];

  const currentIndex =
    stages.indexOf(currentStatus);

  return (
    <div className="report-form-lifecycle">
      <div className="report-form-lifecycle-title">
        <span>Report Progress</span>
        <strong>{currentStatus}</strong>
      </div>

      <div className="report-form-lifecycle-track">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={`report-form-lifecycle-stage ${
              index <= currentIndex
                ? "active"
                : ""
            } ${
              index === currentIndex
                ? "current"
                : ""
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