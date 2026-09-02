"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  FileText,
  FlaskConical,
  Hash,
  Link2,
  Loader2,
  MailCheck,
  NotebookPen,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

type Report = {
  id: string;
  companyId: string;
  sampleId: string;

  reportNumber: string;
  reportType: string;

  reportDate: string | null;

  status: string;

  deliveredDate: string | null;
  deliveryMethod: string | null;

  fileReference: string | null;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
};

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

function normalizeDate(
  value: string | null | undefined
) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function ReportDetailPage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();

  const reportId = params.id;

  const [
    reports,
    setReports,
  ] = useState<Report[]>([]);

  const [
    companies,
    setCompanies,
  ] = useState<Company[]>([]);

  const [
    samples,
    setSamples,
  ] = useState<Sample[]>([]);

  const [
    companyId,
    setCompanyId,
  ] = useState("");

  const [
    sampleId,
    setSampleId,
  ] = useState("");

  const [
    reportNumber,
    setReportNumber,
  ] = useState("");

  const [
    reportType,
    setReportType,
  ] = useState("Final Report");

  const [
    reportDate,
    setReportDate,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("Pending");

  const [
    deliveredDate,
    setDeliveredDate,
  ] = useState("");

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState("");

  const [
    fileReference,
    setFileReference,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          reportResponse,
          companyResponse,
          sampleResponse,
        ] = await Promise.all([
          fetch("/api/reports", {
            cache: "no-store",
          }),

          fetch("/api/companies", {
            cache: "no-store",
          }),

          fetch("/api/samples", {
            cache: "no-store",
          }),
        ]);

        const reportData =
          await reportResponse.json();

        const companyData =
          await companyResponse.json();

        const sampleData =
          await sampleResponse.json();

        if (!reportResponse.ok) {
          throw new Error(
            reportData.error ||
              reportData.message ||
              "Unable to load reports."
          );
        }

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

        if (
          !Array.isArray(reportData) ||
          !Array.isArray(companyData) ||
          !Array.isArray(sampleData)
        ) {
          throw new Error(
            "Invalid CRM data received."
          );
        }

        const selectedReport =
          (
            reportData as Report[]
          ).find(
            (report) =>
              report.id === reportId
          );

        if (!selectedReport) {
          throw new Error(
            "Report not found."
          );
        }

        setReports(reportData);
        setCompanies(companyData);
        setSamples(sampleData);

        setCompanyId(
          selectedReport.companyId
        );

        setSampleId(
          selectedReport.sampleId
        );

        setReportNumber(
          selectedReport.reportNumber
        );

        setReportType(
          selectedReport.reportType
        );

        setReportDate(
          normalizeDate(
            selectedReport.reportDate
          )
        );

        setStatus(
          selectedReport.status
        );

        setDeliveredDate(
          normalizeDate(
            selectedReport.deliveredDate
          )
        );

        setDeliveryMethod(
          selectedReport.deliveryMethod ||
            ""
        );

        setFileReference(
          selectedReport.fileReference ||
            ""
        );

        setNotes(
          selectedReport.notes || ""
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load report."
        );
      } finally {
        setLoading(false);
      }
    }

    if (reportId) {
      loadData();
    }
  }, [reportId]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const selectedReport =
    useMemo(() => {
      return reports.find(
        (report) =>
          report.id === reportId
      );
    }, [
      reports,
      reportId,
    ]);

  const companySamples =
    useMemo(() => {
      if (!companyId) {
        return [];
      }

      return samples.filter(
        (sample) =>
          sample.companyId ===
          companyId
      );
    }, [
      companyId,
      samples,
    ]);

  const selectedCompany =
    useMemo(() => {
      return companies.find(
        (company) =>
          company.id === companyId
      );
    }, [
      companies,
      companyId,
    ]);

  const selectedSample =
    useMemo(() => {
      return samples.find(
        (sample) =>
          sample.id === sampleId
      );
    }, [
      samples,
      sampleId,
    ]);

  /* =========================================================
     HANDLERS
  ========================================================= */

  function handleCompanyChange(
    value: string
  ) {
    setCompanyId(value);
    setSampleId("");
  }

  function handleStatusChange(
    value: string
  ) {
    setStatus(value);

    if (value !== "Delivered") {
      setDeliveredDate("");
      setDeliveryMethod("");
    }
  }

  /* =========================================================
     SAVE REPORT
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/reports",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: reportId,

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
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to update report."
        );
      }

      setReports((current) =>
        current.map((report) =>
          report.id === reportId
            ? data
            : report
        )
      );

      setCompanyId(
        data.companyId || ""
      );

      setSampleId(
        data.sampleId || ""
      );

      setReportNumber(
        data.reportNumber || ""
      );

      setReportType(
        data.reportType ||
          "Final Report"
      );

      setReportDate(
        normalizeDate(
          data.reportDate
        )
      );

      setStatus(
        data.status || "Pending"
      );

      setDeliveredDate(
        normalizeDate(
          data.deliveredDate
        )
      );

      setDeliveryMethod(
        data.deliveryMethod || ""
      );

      setFileReference(
        data.fileReference || ""
      );

      setNotes(
        data.notes || ""
      );

      setSuccess(
        "Report updated successfully."
      );

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
      <div className="report-edit-loading">
        <div>
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            <strong>
              Loading Report
            </strong>

            Preparing report
            management details...
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (
    !selectedReport &&
    error
  ) {
    return (
      <div className="report-edit-not-found">
        <div>
          <FileText size={30} />

          <h1>
            Report Not Found
          </h1>

          <p>{error}</p>

          <Link href="/admin/reports">
            <ArrowLeft size={15} />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="report-edit-page">
      {/* HEADER */}

      <header className="report-edit-header">
        <div>
          <Link
            href="/admin/reports"
            className="report-edit-back"
          >
            <ArrowLeft size={14} />
            Back to Reports
          </Link>

          <div className="report-edit-eyebrow">
            <Sparkles size={12} />
            Report Management
          </div>

          <h1>
            Edit Report
          </h1>

          <p>
            Review and update report
            preparation, delivery,
            document reference and
            client reporting status.
          </p>
        </div>

        <div className="report-edit-header-side">
          <span>
            Report Reference
          </span>

          <strong>
            {reportNumber ||
              "Report"}
          </strong>

          <small>
            {status}
          </small>
        </div>
      </header>

      {/* METRICS */}

      <div className="report-edit-metrics">
        <ReportMetric
          label="Company"
          value={
            selectedCompany?.name ||
            "—"
          }
          type="blue"
          icon={
            <Building2
              size={16}
            />
          }
        />

        <ReportMetric
          label="Sample"
          value={
            selectedSample?.sampleNumber ||
            "—"
          }
          type="cyan"
          icon={
            <FlaskConical
              size={16}
            />
          }
        />

        <ReportMetric
          label="Report Type"
          value={
            reportType || "—"
          }
          type="purple"
          icon={
            <FileCheck2
              size={16}
            />
          }
        />

        <ReportMetric
          label="Status"
          value={
            status || "—"
          }
          type="green"
          icon={
            <CheckCircle2
              size={16}
            />
          }
        />
      </div>

      {/* QUICK LINKS */}

      {(selectedCompany ||
        selectedSample) && (
        <div className="report-edit-quick-links">
          <div>
            <Link2 size={15} />

            <span>
              Related Records
            </span>
          </div>

          <div className="report-edit-quick-actions">
            {selectedCompany && (
              <Link
                href={`/admin/companies/${selectedCompany.id}`}
              >
                <Building2
                  size={14}
                />
                View Company
                <ArrowRight
                  size={13}
                />
              </Link>
            )}

            {selectedSample && (
              <Link
                href={`/admin/samples/${selectedSample.id}`}
              >
                <FlaskConical
                  size={14}
                />
                View Sample
                <ArrowRight
                  size={13}
                />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES */}

      {error && (
        <div className="report-edit-message error">
          <FileText size={16} />

          <div>
            <strong>
              Unable to update report
            </strong>

            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="report-edit-message success">
          <CheckCircle2
            size={16}
          />

          <div>
            <strong>
              Report Updated
            </strong>

            <span>
              {success}
            </span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="report-edit-main"
      >
        {/* CLIENT & SAMPLE */}

        <ReportEditSection
          icon={
            <Building2 size={18} />
          }
          eyebrow="Client"
          title="Company & Sample"
          description="Manage the client relationship and the laboratory sample linked to this report."
          type="blue"
        >
          <div className="report-edit-grid two">
            <ReportEditField
              label="Company"
              required
              icon={
                <Building2
                  size={14}
                />
              }
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

                {companies.map(
                  (company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name} —{" "}
                      {company.status}
                    </option>
                  )
                )}
              </select>
            </ReportEditField>

            <ReportEditField
              label="Sample"
              required
              icon={
                <FlaskConical
                  size={14}
                />
              }
            >
              <select
                value={sampleId}
                onChange={(e) =>
                  setSampleId(
                    e.target.value
                  )
                }
                disabled={!companyId}
                required
              >
                <option value="">
                  Select sample
                </option>

                {companySamples.map(
                  (sample) => (
                    <option
                      key={sample.id}
                      value={sample.id}
                    >
                      {
                        sample.sampleNumber
                      }{" "}
                      —{" "}
                      {
                        sample.sampleType
                      }{" "}
                      —{" "}
                      {
                        sample.status
                      }
                    </option>
                  )
                )}
              </select>

              {companyId &&
                companySamples.length ===
                  0 && (
                  <small className="report-edit-help">
                    No samples found for
                    this company.
                  </small>
                )}
            </ReportEditField>
          </div>

          {selectedSample && (
            <div className="report-edit-sample-preview">
              <div>
                <FlaskConical
                  size={16}
                />
              </div>

              <span>
                <small>
                  Linked Sample
                </small>

                <strong>
                  {
                    selectedSample.sampleNumber
                  }
                </strong>

                <em>
                  {
                    selectedSample.sampleType
                  }{" "}
                  •{" "}
                  {
                    selectedSample.sampleCount
                  }{" "}
                  sample
                  {selectedSample.sampleCount ===
                  1
                    ? ""
                    : "s"}{" "}
                  •{" "}
                  {
                    selectedSample.status
                  }
                </em>
              </span>

              <Link
                href={`/admin/samples/${selectedSample.id}`}
              >
                View Sample
                <ArrowRight
                  size={13}
                />
              </Link>
            </div>
          )}
        </ReportEditSection>

        {/* REPORT DETAILS */}

        <ReportEditSection
          icon={
            <FileCheck2 size={18} />
          }
          eyebrow="Report"
          title="Report Details"
          description="Update the report reference, report type and laboratory report date."
          type="purple"
        >
          <div className="report-edit-grid three">
            <ReportEditField
              label="Report Number"
              required
              icon={
                <Hash size={14} />
              }
            >
              <input
                type="text"
                value={reportNumber}
                onChange={(e) =>
                  setReportNumber(
                    e.target.value
                  )
                }
                required
              />
            </ReportEditField>

            <ReportEditField
              label="Report Type"
              icon={
                <FileText
                  size={14}
                />
              }
            >
              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(
                    e.target.value
                  )
                }
              >
                {reportTypes.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </ReportEditField>

            <ReportEditField
              label="Report Date"
              icon={
                <CalendarDays
                  size={14}
                />
              }
            >
              <input
                type="date"
                value={reportDate}
                onChange={(e) =>
                  setReportDate(
                    e.target.value
                  )
                }
              />
            </ReportEditField>
          </div>
        </ReportEditSection>

        {/* STATUS */}

        <ReportEditSection
          icon={
            <Send size={18} />
          }
          eyebrow="Workflow"
          title="Report Status"
          description="Track the report from preparation through final client delivery."
          type="orange"
        >
          <div className="report-edit-grid three">
            <ReportEditField
              label="Status"
              icon={
                <FileCheck2
                  size={14}
                />
              }
            >
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value
                  )
                }
              >
                {reportStatuses.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </ReportEditField>

            <ReportEditField
              label="Delivered Date"
              icon={
                <CalendarDays
                  size={14}
                />
              }
            >
              <input
                type="date"
                value={deliveredDate}
                onChange={(e) =>
                  setDeliveredDate(
                    e.target.value
                  )
                }
                disabled={
                  status !==
                  "Delivered"
                }
              />

              {status !==
                "Delivered" && (
                <small className="report-edit-help">
                  Available when status
                  is Delivered.
                </small>
              )}
            </ReportEditField>

            <ReportEditField
              label="Delivery Method"
              icon={
                <MailCheck
                  size={14}
                />
              }
            >
              <select
                value={deliveryMethod}
                onChange={(e) =>
                  setDeliveryMethod(
                    e.target.value
                  )
                }
                disabled={
                  status !==
                  "Delivered"
                }
              >
                <option value="">
                  Select method
                </option>

                {deliveryMethods.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </ReportEditField>
          </div>

          <ReportLifecycle
            currentStatus={status}
          />
        </ReportEditSection>

        {/* DELIVERY STATE */}

        <ReportEditSection
          icon={
            <CheckCircle2
              size={18}
            />
          }
          eyebrow="Delivery"
          title="Delivery Tracking"
          description="Confirm report delivery information and client handover status."
          type="green"
        >
          <div
            className={`report-edit-delivery-state ${
              status ===
              "Delivered"
                ? "delivered"
                : ""
            }`}
          >
            <div>
              {status ===
              "Delivered" ? (
                <CheckCircle2
                  size={18}
                />
              ) : (
                <Send size={18} />
              )}
            </div>

            <span>
              <small>
                Current Delivery State
              </small>

              <strong>
                {status ===
                "Delivered"
                  ? "Report Delivered"
                  : status}
              </strong>

              <em>
                {status ===
                "Delivered"
                  ? `${
                      deliveryMethod ||
                      "Delivery method not selected"
                    }${
                      deliveredDate
                        ? ` • ${deliveredDate}`
                        : ""
                    }`
                  : "Delivery details become available after the report is marked Delivered."}
              </em>
            </span>
          </div>
        </ReportEditSection>

        {/* DOCUMENT */}

        <ReportEditSection
          icon={
            <Link2 size={18} />
          }
          eyebrow="Document"
          title="Document Reference"
          description="Store the location or reference used to access the final report document."
          type="cyan"
        >
          <ReportEditField
            label="File Reference"
            icon={
              <Link2 size={14} />
            }
          >
            <input
              type="text"
              value={fileReference}
              onChange={(e) =>
                setFileReference(
                  e.target.value
                )
              }
              placeholder="Google Drive link, internal file path or report reference"
            />
          </ReportEditField>
        </ReportEditSection>

        {/* NOTES */}

        <ReportEditSection
          icon={
            <NotebookPen
              size={18}
            />
          }
          eyebrow="Internal"
          title="Report Notes"
          description="Record preparation updates, pending parameters, delivery information and client comments."
          type="navy"
        >
          <ReportEditField
            label="Notes"
            icon={
              <NotebookPen
                size={14}
              />
            }
          >
            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Report preparation, pending parameters, delivery information or client comments..."
            />
          </ReportEditField>
        </ReportEditSection>

        {/* SAVE */}

        <div className="report-edit-submit-wrap">
          <div className="report-edit-submit-info">
            <div>
              <Save size={17} />
            </div>

            <span>
              <strong>
                Update this report
              </strong>

              <small>
                Save report, delivery
                and document changes.
              </small>
            </span>
          </div>

          <div className="report-edit-submit-actions">
            <Link
              href="/admin/reports"
              className="report-edit-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="report-edit-submit"
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
                  ? "Saving Changes..."
                  : "Save Changes"}
              </span>

              {!saving && (
                <ArrowRight
                  size={15}
                />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SECTION COMPONENT
========================================================= */

function ReportEditSection({
  icon,
  eyebrow,
  title,
  description,
  type,
  children,
}: {
  icon: ReactNode;
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

  children: ReactNode;
}) {
  return (
    <section
      className={`report-edit-section ${type}`}
    >
      <div className="report-edit-section-head">
        <div className="report-edit-section-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>

          <h2>{title}</h2>

          <p>{description}</p>
        </div>
      </div>

      <div className="report-edit-section-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD COMPONENT
========================================================= */

function ReportEditField({
  label,
  required = false,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="report-edit-field">
      <span className="report-edit-label">
        {icon}

        {label}

        {required && (
          <em>*</em>
        )}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   METRIC COMPONENT
========================================================= */

function ReportMetric({
  label,
  value,
  type,
  icon,
}: {
  label: string;
  value: string;

  type:
    | "blue"
    | "cyan"
    | "purple"
    | "green";

  icon: ReactNode;
}) {
  return (
    <div
      className={`report-edit-metric ${type}`}
    >
      <div>{icon}</div>

      <span>
        <small>{label}</small>

        <strong>
          {value}
        </strong>
      </span>
    </div>
  );
}

/* =========================================================
   REPORT LIFECYCLE
========================================================= */

function ReportLifecycle({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const activeIndex =
    reportStatuses.indexOf(
      currentStatus
    );

  return (
    <div className="report-edit-lifecycle">
      <div className="report-edit-lifecycle-title">
        <span>
          Report Lifecycle
        </span>

        <strong>
          {currentStatus}
        </strong>
      </div>

      <div className="report-edit-lifecycle-track">
        {reportStatuses.map(
          (stage, index) => {
            const active =
              index <= activeIndex;

            const current =
              index === activeIndex;

            return (
              <div
                key={stage}
                className={`report-edit-lifecycle-stage ${
                  active
                    ? "active"
                    : ""
                } ${
                  current
                    ? "current"
                    : ""
                }`}
              >
                <div>
                  {active &&
                  index <
                    activeIndex ? (
                    <CheckCircle2
                      size={11}
                    />
                  ) : (
                    <span>
                      {index + 1}
                    </span>
                  )}
                </div>

                <small>
                  {stage}
                </small>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}