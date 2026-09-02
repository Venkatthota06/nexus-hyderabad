"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
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
  FileText,
  FlaskConical,
  Hash,
  Layers3,
  Link2,
  Loader2,
  MapPin,
  NotebookPen,
  PackageCheck,
  Save,
  Sparkles,
  TestTube2,
  UserRound,
} from "lucide-react";

type Sample = {
  id: string;
  companyId: string;
  quotationId: string | null;

  sampleNumber: string;
  sampleType: string;
  sampleCount: number;

  collectionDate: string | null;
  collectedBy: string | null;

  status: string;

  testingLocation: string | null;
  expectedCompletionDate: string | null;

  reportStatus: string;
  reportDeliveredDate: string | null;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
};

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
  totalAmount: number;
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

function normalizeDate(
  value: string | null | undefined
) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

export default function SampleDetailPage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();

  const sampleId = params.id;

  const [
    samples,
    setSamples,
  ] = useState<Sample[]>([]);

  const [
    companies,
    setCompanies,
  ] = useState<Company[]>([]);

  const [
    quotations,
    setQuotations,
  ] = useState<Quotation[]>([]);

  const [
    companyId,
    setCompanyId,
  ] = useState("");

  const [
    quotationId,
    setQuotationId,
  ] = useState("");

  const [
    sampleNumber,
    setSampleNumber,
  ] = useState("");

  const [
    sampleType,
    setSampleType,
  ] = useState("");

  const [
    sampleCount,
    setSampleCount,
  ] = useState("1");

  const [
    collectionDate,
    setCollectionDate,
  ] = useState("");

  const [
    collectedBy,
    setCollectedBy,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("Planned");

  const [
    testingLocation,
    setTestingLocation,
  ] = useState("");

  const [
    expectedCompletionDate,
    setExpectedCompletionDate,
  ] = useState("");

  const [
    reportStatus,
    setReportStatus,
  ] = useState("Pending");

  const [
    reportDeliveredDate,
    setReportDeliveredDate,
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
          samplesResponse,
          companiesResponse,
          quotationsResponse,
        ] = await Promise.all([
          fetch(
            "/api/samples",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/companies",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/quotations",
            {
              cache: "no-store",
            }
          ),
        ]);

        const samplesData =
          await samplesResponse.json();

        const companiesData =
          await companiesResponse.json();

        const quotationsData =
          await quotationsResponse.json();

        if (!samplesResponse.ok) {
          throw new Error(
            samplesData.message ||
              "Unable to load sample."
          );
        }

        if (!companiesResponse.ok) {
          throw new Error(
            companiesData.message ||
              "Unable to load companies."
          );
        }

        if (!quotationsResponse.ok) {
          throw new Error(
            quotationsData.message ||
              "Unable to load quotations."
          );
        }

        if (
          !Array.isArray(samplesData) ||
          !Array.isArray(companiesData) ||
          !Array.isArray(quotationsData)
        ) {
          throw new Error(
            "Invalid CRM data received."
          );
        }

        const selectedSample =
          (
            samplesData as Sample[]
          ).find(
            (sample) =>
              sample.id === sampleId
          );

        if (!selectedSample) {
          throw new Error(
            "Sample not found."
          );
        }

        setSamples(samplesData);
        setCompanies(companiesData);
        setQuotations(quotationsData);

        setCompanyId(
          selectedSample.companyId
        );

        setQuotationId(
          selectedSample.quotationId ||
            ""
        );

        setSampleNumber(
          selectedSample.sampleNumber
        );

        setSampleType(
          selectedSample.sampleType
        );

        setSampleCount(
          String(
            selectedSample.sampleCount
          )
        );

        setCollectionDate(
          normalizeDate(
            selectedSample.collectionDate
          )
        );

        setCollectedBy(
          selectedSample.collectedBy ||
            ""
        );

        setStatus(
          selectedSample.status
        );

        setTestingLocation(
          selectedSample.testingLocation ||
            ""
        );

        setExpectedCompletionDate(
          normalizeDate(
            selectedSample.expectedCompletionDate
          )
        );

        setReportStatus(
          selectedSample.reportStatus
        );

        setReportDeliveredDate(
          normalizeDate(
            selectedSample.reportDeliveredDate
          )
        );

        setNotes(
          selectedSample.notes ||
            ""
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load sample."
        );
      } finally {
        setLoading(false);
      }
    }

    if (sampleId) {
      loadData();
    }
  }, [sampleId]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const selectedSample =
    useMemo(() => {
      return samples.find(
        (sample) =>
          sample.id === sampleId
      );
    }, [samples, sampleId]);

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

  const companyQuotations =
    useMemo(() => {
      if (!companyId) {
        return [];
      }

      return quotations.filter(
        (quotation) =>
          quotation.companyId ===
          companyId
      );
    }, [
      companyId,
      quotations,
    ]);

  const selectedQuotation =
    useMemo(() => {
      if (!quotationId) {
        return undefined;
      }

      return quotations.find(
        (quotation) =>
          quotation.id ===
          quotationId
      );
    }, [
      quotationId,
      quotations,
    ]);

  /* =========================================================
     HANDLERS
  ========================================================= */

  function handleCompanyChange(
    value: string
  ) {
    setCompanyId(value);
    setQuotationId("");
  }

  function handleReportStatusChange(
    value: string
  ) {
    setReportStatus(value);

    if (value !== "Delivered") {
      setReportDeliveredDate("");
    }

    if (value === "Delivered") {
      setStatus(
        "Report Delivered"
      );
    }
  }

  /* =========================================================
     UPDATE SAMPLE
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/samples",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: sampleId,

              companyId,
              quotationId,

              sampleNumber,
              sampleType,

              sampleCount:
                Number(sampleCount),

              collectionDate,
              collectedBy,

              status,

              testingLocation,
              expectedCompletionDate,

              reportStatus,
              reportDeliveredDate,

              notes,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update sample."
        );
      }

      setSuccess("Sample updated successfully.");

if (data) {
  setCompanyId(data.companyId || "");
  setQuotationId(data.quotationId || "");

  setSampleNumber(data.sampleNumber || "");
  setSampleType(data.sampleType || "");
  setSampleCount(String(data.sampleCount || 1));

  setCollectionDate(
    normalizeDate(data.collectionDate)
  );

  setCollectedBy(data.collectedBy || "");

  setStatus(data.status || "Planned");

  setTestingLocation(
    data.testingLocation || ""
  );

  setExpectedCompletionDate(
    normalizeDate(
      data.expectedCompletionDate
    )
  );

  setReportStatus(
    data.reportStatus || "Pending"
  );

  setReportDeliveredDate(
    normalizeDate(
      data.reportDeliveredDate
    )
  );

  setNotes(data.notes || "");
}

router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update sample."
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
      <div className="sample-edit-loading">
        <div>
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            <strong>
              Loading Sample
            </strong>

            Preparing laboratory
            workflow...
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error &&
    !selectedSample
  ) {
    return (
      <div className="sample-edit-not-found">
        <div>
          <FlaskConical
            size={31}
          />

          <h1>
            Sample Not Found
          </h1>

          <p>{error}</p>

          <Link href="/admin/samples">
            <ArrowLeft size={15} />
            Back to Samples
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="sample-edit-page">
      {/* HEADER */}

      <header className="sample-edit-header">
        <div>
          <Link
            href="/admin/samples"
            className="sample-edit-back"
          >
            <ArrowLeft size={14} />
            Back to Samples
          </Link>

          <div className="sample-edit-eyebrow">
            <Sparkles size={12} />
            Laboratory Operations
          </div>

          <h1>Edit Sample</h1>

          <p>
            Update sample collection,
            movement, laboratory testing
            and report delivery progress.
          </p>
        </div>

        <div className="sample-edit-header-side">
          <span>
            Sample Reference
          </span>

          <strong>
            {sampleNumber ||
              "Sample"}
          </strong>

          <small>
            {status}
          </small>
        </div>
      </header>

      {/* QUICK METRICS */}

      <div className="sample-edit-metrics">
        <SampleMetric
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

        <SampleMetric
          label="Sample Status"
          value={status || "—"}
          type="cyan"
          icon={
            <FlaskConical
              size={16}
            />
          }
        />

        <SampleMetric
          label="Report Status"
          value={
            reportStatus || "—"
          }
          type="green"
          icon={
            <FileText
              size={16}
            />
          }
        />

        <SampleMetric
          label="Sample Count"
          value={
            sampleCount || "0"
          }
          type="purple"
          icon={
            <Layers3
              size={16}
            />
          }
        />
      </div>

      {/* LINKED QUOTATION */}

      {selectedQuotation && (
        <div className="sample-edit-linked-quotation">
          <div className="sample-edit-linked-icon">
            <FileText size={18} />
          </div>

          <div className="sample-edit-linked-info">
            <span>
              Linked Quotation
            </span>

            <strong>
              {
                selectedQuotation.quotationNumber
              }
            </strong>

            <small>
              {
                selectedQuotation.service
              }{" "}
              •{" "}
              {
                selectedQuotation.status
              }{" "}
              •{" "}
              {formatCurrency(
                selectedQuotation.totalAmount
              )}
            </small>
          </div>

          <Link
            href={`/admin/quotations/${selectedQuotation.id}`}
            className="sample-edit-linked-button"
          >
            View Quotation
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ALERTS */}

      {error && (
        <div className="sample-edit-message error">
          <FileText size={16} />

          <div>
            <strong>
              Unable to update sample
            </strong>

            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="sample-edit-message success">
          <CheckCircle2
            size={16}
          />

          <div>
            <strong>
              Sample Updated
            </strong>

            <span>
              {success}
            </span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="sample-edit-main"
      >
        {/* CLIENT */}

        <SampleEditSection
          icon={
            <Building2 size={18} />
          }
          eyebrow="Client"
          title="Company & Reference"
          description="Manage the company relationship and linked quotation."
          type="blue"
        >
          <div className="sample-edit-grid two">
            <SampleEditField
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
            </SampleEditField>

            <SampleEditField
              label="Linked Quotation"
              icon={
                <Link2 size={14} />
              }
            >
              <select
                value={quotationId}
                onChange={(e) =>
                  setQuotationId(
                    e.target.value
                  )
                }
                disabled={!companyId}
              >
                <option value="">
                  No quotation linked
                </option>

                {companyQuotations.map(
                  (quotation) => (
                    <option
                      key={quotation.id}
                      value={
                        quotation.id
                      }
                    >
                      {
                        quotation.quotationNumber
                      }{" "}
                      —{" "}
                      {
                        quotation.service
                      }{" "}
                      —{" "}
                      {
                        quotation.status
                      }
                    </option>
                  )
                )}
              </select>
            </SampleEditField>
          </div>

          {selectedCompany && (
            <div className="sample-edit-company-preview">
              <div>
                <Building2
                  size={15}
                />
              </div>

              <span>
                <small>
                  Selected Client
                </small>

                <strong>
                  {
                    selectedCompany.name
                  }
                </strong>

                <em>
                  {
                    selectedCompany.status
                  }
                </em>
              </span>

              <Link
                href={`/admin/companies/${selectedCompany.id}`}
              >
                View Company
                <ArrowRight
                  size={13}
                />
              </Link>
            </div>
          )}
        </SampleEditSection>

        {/* SAMPLE DETAILS */}

        <SampleEditSection
          icon={
            <TestTube2 size={18} />
          }
          eyebrow="Sample"
          title="Sample Details"
          description="Update the laboratory sample reference, type and quantity."
          type="cyan"
        >
          <div className="sample-edit-grid three">
            <SampleEditField
              label="Sample Number"
              required
              icon={
                <Hash size={14} />
              }
            >
              <input
                type="text"
                value={sampleNumber}
                onChange={(e) =>
                  setSampleNumber(
                    e.target.value
                  )
                }
                required
              />
            </SampleEditField>

            <SampleEditField
              label="Sample Type"
              required
              icon={
                <FlaskConical
                  size={14}
                />
              }
            >
              <input
                type="text"
                value={sampleType}
                onChange={(e) =>
                  setSampleType(
                    e.target.value
                  )
                }
                placeholder="Water, Food, Air..."
                required
              />
            </SampleEditField>

            <SampleEditField
              label="Sample Count"
              required
              icon={
                <Layers3
                  size={14}
                />
              }
            >
              <input
                type="number"
                min="1"
                value={sampleCount}
                onChange={(e) =>
                  setSampleCount(
                    e.target.value
                  )
                }
                required
              />
            </SampleEditField>
          </div>
        </SampleEditSection>

        {/* COLLECTION */}

        <SampleEditSection
          icon={
            <PackageCheck
              size={18}
            />
          }
          eyebrow="Movement"
          title="Collection & Progress"
          description="Track sample collection, custody and movement toward the laboratory."
          type="orange"
        >
          <div className="sample-edit-grid three">
            <SampleEditField
              label="Collection Date"
              icon={
                <CalendarDays
                  size={14}
                />
              }
            >
              <input
                type="date"
                value={
                  collectionDate
                }
                onChange={(e) =>
                  setCollectionDate(
                    e.target.value
                  )
                }
              />
            </SampleEditField>

            <SampleEditField
              label="Collected By"
              icon={
                <UserRound
                  size={14}
                />
              }
            >
              <input
                type="text"
                value={collectedBy}
                onChange={(e) =>
                  setCollectedBy(
                    e.target.value
                  )
                }
                placeholder="Collector name"
              />
            </SampleEditField>

            <SampleEditField
              label="Sample Status"
              icon={
                <PackageCheck
                  size={14}
                />
              }
            >
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                {sampleStatuses.map(
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
            </SampleEditField>
          </div>

          <SampleLifecycle
            currentStatus={status}
          />
        </SampleEditSection>

        {/* TESTING */}

        <SampleEditSection
          icon={
            <FlaskConical
              size={18}
            />
          }
          eyebrow="Laboratory"
          title="Testing Details"
          description="Track testing location and expected completion."
          type="purple"
        >
          <div className="sample-edit-grid two">
            <SampleEditField
              label="Testing Location"
              icon={
                <MapPin size={14} />
              }
            >
              <input
                type="text"
                value={
                  testingLocation
                }
                onChange={(e) =>
                  setTestingLocation(
                    e.target.value
                  )
                }
                placeholder="Bangalore Laboratory"
              />
            </SampleEditField>

            <SampleEditField
              label="Expected Completion Date"
              icon={
                <CalendarDays
                  size={14}
                />
              }
            >
              <input
                type="date"
                value={
                  expectedCompletionDate
                }
                onChange={(e) =>
                  setExpectedCompletionDate(
                    e.target.value
                  )
                }
              />
            </SampleEditField>
          </div>
        </SampleEditSection>

        {/* REPORT */}

        <SampleEditSection
          icon={
            <FileText size={18} />
          }
          eyebrow="Reporting"
          title="Report Tracking"
          description="Update report preparation and delivery progress."
          type="green"
        >
          <div className="sample-edit-grid two">
            <SampleEditField
              label="Report Status"
              icon={
                <FileText
                  size={14}
                />
              }
            >
              <select
                value={reportStatus}
                onChange={(e) =>
                  handleReportStatusChange(
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
            </SampleEditField>

            <SampleEditField
              label="Report Delivered Date"
              icon={
                <CalendarDays
                  size={14}
                />
              }
            >
              <input
                type="date"
                value={
                  reportDeliveredDate
                }
                onChange={(e) =>
                  setReportDeliveredDate(
                    e.target.value
                  )
                }
                disabled={
                  reportStatus !==
                  "Delivered"
                }
              />

              {reportStatus !==
                "Delivered" && (
                <small className="sample-edit-help">
                  Select Delivered
                  to enable this date.
                </small>
              )}
            </SampleEditField>
          </div>

          <div
            className={`sample-edit-report-state ${
              reportStatus ===
              "Delivered"
                ? "delivered"
                : ""
            }`}
          >
            <div>
              {reportStatus ===
              "Delivered" ? (
                <CheckCircle2
                  size={17}
                />
              ) : (
                <FileText
                  size={17}
                />
              )}
            </div>

            <span>
              <small>
                Report Status
              </small>

              <strong>
                {reportStatus}
              </strong>
            </span>
          </div>
        </SampleEditSection>

        {/* NOTES */}

        <SampleEditSection
          icon={
            <NotebookPen
              size={18}
            />
          }
          eyebrow="Internal"
          title="Sample Notes"
          description="Record sample condition, courier details, laboratory updates and client notes."
          type="navy"
        >
          <SampleEditField
            label="Notes"
            icon={
              <NotebookPen
                size={14}
              />
            }
          >
            <textarea
              rows={5}
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Sample condition, courier details, laboratory updates or client report notes..."
            />
          </SampleEditField>
        </SampleEditSection>

        {/* SUBMIT */}

        <div className="sample-edit-submit-wrap">
          <div className="sample-edit-submit-info">
            <div>
              <Save size={17} />
            </div>

            <span>
              <strong>
                Update this sample
              </strong>

              <small>
                Save collection,
                testing and report
                progress.
              </small>
            </span>
          </div>

          <div className="sample-edit-submit-actions">
            <Link
              href="/admin/samples"
              className="sample-edit-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="sample-edit-submit"
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
   SECTION
========================================================= */

function SampleEditSection({
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
    <section
      className={`sample-edit-section ${type}`}
    >
      <div className="sample-edit-section-head">
        <div className="sample-edit-section-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>

          <h2>{title}</h2>

          <p>{description}</p>
        </div>
      </div>

      <div className="sample-edit-section-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function SampleEditField({
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
    <label className="sample-edit-field">
      <span className="sample-edit-label">
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
   METRIC
========================================================= */

function SampleMetric({
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
    | "green"
    | "purple";
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`sample-edit-metric ${type}`}
    >
      <div>
        {icon}
      </div>

      <span>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>
      </span>
    </div>
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
  const activeIndex =
    sampleStatuses.indexOf(
      currentStatus
    );

  return (
    <div className="sample-edit-lifecycle">
      <div className="sample-edit-lifecycle-title">
        <span>
          Sample Lifecycle
        </span>

        <strong>
          {currentStatus}
        </strong>
      </div>

      <div className="sample-edit-lifecycle-track">
        {sampleStatuses.map(
          (stage, index) => {
            const active =
              index <= activeIndex;

            const current =
              index === activeIndex;

            return (
              <div
                key={stage}
                className={`sample-edit-lifecycle-stage ${
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