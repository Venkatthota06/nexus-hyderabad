import Link from "next/link";

import { db } from "@/src/prisma/db";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileClock,
  FileText,
  FlaskConical,
  MapPin,
  PackageCheck,
  Plus,
  ReceiptText,
  Send,
  Sparkles,
  TestTube2,
  UserRound,
} from "lucide-react";

export const dynamic = "force-dynamic";

/* =========================================================

   TYPES

\========================================================= */

type Sample = {
  id: string;

  companyId: string;

  locationId: string | null;

  quotationId: string | null;

  sampleNumber: string;

  sampleType: string;

  sampleCount: number;

  collectionDate: string | null;

  collectionMonth: string | null;
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

type RecurringService = {
  id: string;
  locationId: string | null;
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

/* =========================================================

   DATABASE

\========================================================= */

async function getSamples(): Promise<Sample[]> {
  try {
    const samples = await db.orm.public.Sample.orderBy((sample) =>
      sample.createdAt.desc(),
    ).all();

    return samples as Sample[];
  } catch (error) {
    console.error("Samples page getSamples error:", error);

    return [];
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    const companies = await db.orm.public.Company.all();

    return companies as Company[];
  } catch (error) {
    console.error("Samples page getCompanies error:", error);

    return [];
  }
}

async function getRecurringServices(): Promise<RecurringService[]> {
  try {
    const recurringServices = await db.orm.public.RecurringService.all();
    return recurringServices as RecurringService[];
  } catch (error) {
    console.error("Samples page getRecurringServices error:", error);
    return [];
  }
}

async function getQuotations(): Promise<Quotation[]> {
  try {
    const quotations = await db.orm.public.Quotation.all();

    return quotations as Quotation[];
  } catch (error) {
    console.error("Samples page getQuotations error:", error);

    return [];
  }
}

/* =========================================================

   HELPERS

\========================================================= */

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
}

function statusSlug(status: string) {
  return status.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-");
}

function normalizeSampleCategory(value: string) {
  const type = value.toLowerCase().trim();

  if (
    type.includes("water") ||
    type.includes("ro") ||
    type.includes("domestic")
  ) {
    return "water";
  }
  if (type.includes("food") || type.includes("meal")) return "food";
  if (type.includes("swab")) return "swab";
  if (
    type.includes("iaq") ||
    type.includes("aaq") ||
    type.includes("indoor air") ||
    type.includes("ambient air") ||
    type.includes("air quality")
  )
    return "air";

  return "other";
}

function getSampleMonth(sample: Sample) {
  if (
    sample.collectionMonth &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(sample.collectionMonth)
  )
    return sample.collectionMonth;

  if (!sample.collectionDate) return null;

  const date = new Date(sample.collectionDate);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeCategoryParam(value?: string) {
  if (!value) return "";
  return ["water", "food", "swab", "air", "other"].includes(value) ? value : "";
}

function normalizeScopeParam(value?: string) {
  return value === "recurring" || value === "one-time" ? value : "";
}

function reportBucket(value: string | null | undefined) {
  const status = String(value || "").toLowerCase();
  if (status.includes("deliver")) return "delivered";
  if (
    status.includes("ready") ||
    status.includes("complete") ||
    status.includes("approved")
  )
    return "ready";
  return "pending";
}

function normalizeReportParam(value?: string) {
  return ["pending", "ready", "delivered"].includes(value || "")
    ? value || ""
    : "";
}

function categoryLabel(category: string) {
  if (category === "water") return "Water / RO";
  if (category === "food") return "Food";
  if (category === "swab") return "Swab";
  if (category === "air") return "IAQ / AAQ";
  if (category === "other") return "Other";
  return "All Sample Types";
}

/* =========================================================

   PAGE

\========================================================= */

export default async function SamplesPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    category?: string;

    scope?: string;

    report?: string;
  }>;
}) {
  const params = await searchParams;

  const selectedMonth =
    params.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month)
      ? params.month
      : "";

  const selectedCategory = normalizeCategoryParam(params.category);
  const selectedScope = normalizeScopeParam(params.scope);
  const selectedReport = normalizeReportParam(params.report);

  const [allSamples, companies, quotations, recurringServices] =
    await Promise.all([
      getSamples(),
      getCompanies(),
      getQuotations(),
      getRecurringServices(),
    ]);

  const recurringLocationIds = new Set(
    recurringServices
      .filter(
        (service) =>
          service.locationId &&
          String(service.status || "").toLowerCase() === "active",
      )
      .map((service) => service.locationId as string),
  );

  const samples = allSamples.filter((sample) => {
    const monthMatches =
      !selectedMonth || getSampleMonth(sample) === selectedMonth;

    const categoryMatches =
      !selectedCategory ||
      normalizeSampleCategory(sample.sampleType) === selectedCategory;

    const isRecurring =
      Boolean(sample.locationId) &&
      recurringLocationIds.has(sample.locationId as string);

    const scopeMatches =
      !selectedScope ||
      (selectedScope === "recurring" ? isRecurring : !isRecurring);

    const reportMatches =
      !selectedReport || reportBucket(sample.reportStatus) === selectedReport;

    return monthMatches && categoryMatches && scopeMatches && reportMatches;
  });

  const selectedMonthLabel = selectedMonth
    ? new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
      }).format(new Date(`${selectedMonth}-01T12:00:00`))
    : "";

  const hasDrilldownFilter = Boolean(
    selectedMonth || selectedCategory || selectedScope || selectedReport,
  );

  /* =======================================================

     MAPS

  ======================================================= */

  const companyMap = new Map(companies.map((company) => [company.id, company]));

  const quotationMap = new Map(
    quotations.map((quotation) => [quotation.id, quotation]),
  );

  /* =======================================================

     METRICS

  ======================================================= */

  const totalSampleRecords = samples.length;

  const totalPhysicalSamples = samples.reduce(
    (total, sample) => total + Number(sample.sampleCount || 0),

    0,
  );

  function sumSampleQuantity(predicate: (sample: Sample) => boolean) {
    return samples.reduce((total, sample) => {
      if (!predicate(sample)) {
        return total;
      }

      return total + Number(sample.sampleCount || 0);
    }, 0);
  }

  const collectedSamples = sumSampleQuantity(
    (sample) => sample.status === "Collected",
  );

  const transitSamples = sumSampleQuantity(
    (sample) =>
      sample.status === "Dispatched" || sample.status === "Received at Lab",
  );

  const testingSamples = sumSampleQuantity(
    (sample) => sample.status === "Testing",
  );

  const completedSamples = sumSampleQuantity(
    (sample) =>
      sample.status === "Completed" || sample.status === "Report Delivered",
  );

  const pendingReports = sumSampleQuantity(
    (sample) => sample.reportStatus !== "Delivered",
  );

  const deliveredReports = sumSampleQuantity(
    (sample) => sample.reportStatus === "Delivered",
  );

  return (
    <div className="samples-premium-page">
      {/* =====================================================

          HEADER

      ====================================================== */}

      <header className="samples-premium-header">
        <div>
          <div className="samples-premium-eyebrow">
            <span className="samples-premium-eyebrow-icon">
              <Sparkles size={12} />
            </span>
            Laboratory Operations
          </div>

          <h1>Samples</h1>

          <p>
            Track sample collection, movement, laboratory testing and report
            delivery from one operational workspace.
          </p>
        </div>

        <Link href="/admin/samples/new" className="samples-premium-add">
          <Plus size={17} />

          <span>Add Sample</span>

          <ArrowRight size={15} />
        </Link>
      </header>

      {/* =====================================================

          METRICS

      ====================================================== */}

      {hasDrilldownFilter && (
        <section className="samples-drilldown-banner">
          <div>
            <span>Dashboard Drill-Down</span>
            <strong>
              {selectedCategory
                ? categoryLabel(selectedCategory)
                : selectedScope === "recurring"
                  ? "Recurring Samples"
                  : selectedScope === "one-time"
                    ? "One-Time Samples"
                    : selectedReport
                      ? `Report: ${selectedReport.charAt(0).toUpperCase()}${selectedReport.slice(1)}`
                      : "All Sample Types"}
              {selectedMonthLabel ? ` · ${selectedMonthLabel}` : ""}
              {selectedCategory && selectedScope
                ? ` · ${selectedScope === "recurring" ? "Recurring" : "One-Time"}`
                : ""}
              {selectedReport && (selectedCategory || selectedScope)
                ? ` · Report ${selectedReport.charAt(0).toUpperCase()}${selectedReport.slice(1)}`
                : ""}
            </strong>
            <small>
              Showing {samples.length} matching sample record
              {samples.length === 1 ? "" : "s"}.
            </small>
          </div>

          <Link href="/admin/samples" className="samples-drilldown-clear">
            Clear Filter
          </Link>
        </section>
      )}

      <section className="samples-premium-metrics">
        <SampleMetric
          label="Sample Records"

          value={totalSampleRecords}

          helper={`${totalPhysicalSamples} physical samples`}

          icon={<ClipboardList size={20} />}

          type="navy"
        />

        <SampleMetric
          label="Collected"

          value={collectedSamples}

          helper="Ready for processing"

          icon={<TestTube2 size={20} />}

          type="cyan"
        />

        <SampleMetric
          label="In Transit / Lab"

          value={transitSamples}

          helper="Dispatched or received"

          icon={<Send size={20} />}

          type="blue"
        />

        <SampleMetric
          label="In Testing"

          value={testingSamples}

          helper="Laboratory processing"

          icon={<FlaskConical size={20} />}

          type="purple"
        />

        <SampleMetric
          label="Completed"

          value={completedSamples}

          helper="Testing completed"

          icon={<PackageCheck size={20} />}

          type="green"
        />

        <SampleMetric
          label="Reports Pending"

          value={pendingReports}

          helper={`${deliveredReports} delivered`}

          icon={<FileClock size={20} />}

          type="orange"
        />
      </section>

      {/* =====================================================

          OPERATIONS PANEL

      ====================================================== */}

      <section className="samples-premium-panel">
        <div className="samples-premium-panel-header">
          <div className="samples-premium-panel-heading">
            <div className="samples-premium-panel-icon">
              <FlaskConical size={20} />
            </div>

            <div>
              <span>Sample Lifecycle</span>

              <h2>Laboratory Operations</h2>

              <p>Collection → Dispatch → Laboratory → Testing → Report</p>
            </div>
          </div>

          <div className="samples-premium-panel-count">
            {totalPhysicalSamples} Total Samples
          </div>
        </div>

        {samples.length === 0 ? (
          <div className="samples-premium-empty">
            <div className="samples-premium-empty-icon">
              <FlaskConical size={29} />
            </div>

            <span>Laboratory Workspace</span>

            <h3>No samples yet</h3>

            <p>
              Once an order is confirmed and sample collection is planned,
              create the sample here to track its complete laboratory lifecycle.
            </p>

            <Link href="/admin/samples/new">
              <Plus size={15} />
              Add First Sample
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="samples-premium-list">
            {samples.map((sample) => {
              const company = companyMap.get(sample.companyId);

              const quotation = sample.quotationId
                ? quotationMap.get(sample.quotationId)
                : undefined;

              return (
                <article
                  key={sample.id}

                  className={`samples-premium-card sample-status-${statusSlug(
                    sample.status,
                  )}`}
                >
                  {/* TOP */}

                  <div className="samples-premium-card-top">
                    <div className="samples-premium-identity">
                      <div className="samples-premium-sample-icon">
                        <TestTube2 size={22} />
                      </div>

                      <div className="samples-premium-title">
                        <div className="samples-premium-badges">
                          <span className="samples-premium-number">
                            {sample.sampleNumber}
                          </span>

                          <span
                            className={`samples-premium-status ${statusSlug(
                              sample.status,
                            )}`}
                          >
                            {sample.status}
                          </span>

                          <span
                            className={`samples-premium-report-status ${statusSlug(
                              sample.reportStatus,
                            )}`}
                          >
                            Report: {sample.reportStatus}
                          </span>
                        </div>

                        <h3>{sample.sampleType}</h3>

                        <Link
                          href={`/admin/companies/${sample.companyId}`}

                          className="samples-premium-company"
                        >
                          <Building2 size={14} />

                          {company?.name || "Unknown Company"}

                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>

                    <div className="samples-premium-count-box">
                      <span>Sample Quantity</span>

                      <strong>{sample.sampleCount}</strong>

                      <small>
                        {sample.sampleCount === 1 ? "Sample" : "Samples"}
                      </small>
                    </div>
                  </div>

                  {/* OPERATIONAL INFORMATION */}

                  <div className="samples-premium-info-grid">
                    <SampleInfo
                      label="Collection Date"

                      value={formatDate(sample.collectionDate)}

                      icon={<CalendarDays size={15} />}

                      type="collection"
                    />

                    <SampleInfo
                      label="Expected Completion"

                      value={formatDate(sample.expectedCompletionDate)}

                      icon={<FileClock size={15} />}

                      type="expected"
                    />

                    <SampleInfo
                      label="Testing Location"

                      value={sample.testingLocation || "—"}

                      icon={<MapPin size={15} />}

                      type="location"
                    />

                    <SampleInfo
                      label="Report Delivered"

                      value={formatDate(sample.reportDeliveredDate)}

                      icon={<FileText size={15} />}

                      type="report"
                    />
                  </div>

                  {/* DETAILS */}

                  <div className="samples-premium-bottom">
                    <div className="samples-premium-bottom-info">
                      {sample.collectedBy && (
                        <div className="samples-premium-collected">
                          <div>
                            <UserRound size={15} />
                          </div>

                          <span>
                            Collected By
                            <strong>{sample.collectedBy}</strong>
                          </span>
                        </div>
                      )}

                      {quotation && (
                        <div className="samples-premium-quotation">
                          <div className="samples-premium-quotation-icon">
                            <ReceiptText size={15} />
                          </div>

                          <div>
                            <span>Linked Quotation</span>

                            <strong>{quotation.quotationNumber}</strong>

                            <small>
                              {quotation.service} • {quotation.status}
                            </small>
                          </div>

                          <Link href={`/admin/quotations/${quotation.id}`}>
                            View
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      )}

                      {sample.notes && (
                        <div className="samples-premium-notes">
                          <FileText size={14} />

                          <div>
                            <span>Notes</span>

                            <p>{sample.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/admin/samples/${sample.id}`}

                      className="samples-premium-edit"
                    >
                      <FlaskConical size={16} />

                      <span>View / Edit Sample</span>

                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================

   METRIC COMPONENT

\========================================================= */

function SampleMetric({
  label,

  value,

  helper,

  icon,

  type,
}: {
  label: string;

  value: number;

  helper: string;

  icon: React.ReactNode;

  type: "navy" | "cyan" | "blue" | "purple" | "green" | "orange";
}) {
  return (
    <div className={`samples-premium-metric ${type}`}>
      <div className="samples-premium-metric-icon">{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>

        <small>{helper}</small>
      </div>
    </div>
  );
}

/* =========================================================

   INFORMATION COMPONENT

\========================================================= */

function SampleInfo({
  label,

  value,

  icon,

  type,
}: {
  label: string;

  value: string;

  icon: React.ReactNode;

  type: "collection" | "expected" | "location" | "report";
}) {
  return (
    <div className={`samples-premium-info ${type}`}>
      <div className="samples-premium-info-icon">{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}
