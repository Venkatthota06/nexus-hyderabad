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
========================================================= */

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

/* =========================================================
   DATABASE
========================================================= */

async function getSamples(): Promise<Sample[]> {
  try {
    const samples = await db.orm.public.Sample
      .orderBy((sample) => sample.createdAt.desc())
      .all();

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
========================================================= */

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
  return status
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-");
}

/* =========================================================
   PAGE
========================================================= */

export default async function SamplesPage() {
  const [samples, companies, quotations] = await Promise.all([
    getSamples(),
    getCompanies(),
    getQuotations(),
  ]);

  /* =======================================================
     MAPS
  ======================================================= */

  const companyMap = new Map(
    companies.map((company) => [company.id, company])
  );

  const quotationMap = new Map(
    quotations.map((quotation) => [
      quotation.id,
      quotation,
    ])
  );

  /* =======================================================
     METRICS
  ======================================================= */

  const totalSampleRecords = samples.length;

  const totalPhysicalSamples = samples.reduce(
    (total, sample) =>
      total + Number(sample.sampleCount || 0),
    0
  );

  const collectedSamples = samples.filter(
    (sample) => sample.status === "Collected"
  ).length;

  const transitSamples = samples.filter(
    (sample) =>
      sample.status === "Dispatched" ||
      sample.status === "Received at Lab"
  ).length;

  const testingSamples = samples.filter(
    (sample) => sample.status === "Testing"
  ).length;

  const completedSamples = samples.filter(
    (sample) =>
      sample.status === "Completed" ||
      sample.status === "Report Delivered"
  ).length;

  const pendingReports = samples.filter(
    (sample) => sample.reportStatus !== "Delivered"
  ).length;

  const deliveredReports = samples.filter(
    (sample) => sample.reportStatus === "Delivered"
  ).length;

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
            Track sample collection, movement, laboratory
            testing and report delivery from one operational
            workspace.
          </p>
        </div>

        <Link
          href="/admin/samples/new"
          className="samples-premium-add"
        >
          <Plus size={17} />
          <span>Add Sample</span>
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* =====================================================
          METRICS
      ====================================================== */}

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
              <p>
                Collection → Dispatch → Laboratory → Testing
                → Report
              </p>
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
              Once an order is confirmed and sample collection
              is planned, create the sample here to track its
              complete laboratory lifecycle.
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
              const company =
                companyMap.get(sample.companyId);

              const quotation = sample.quotationId
                ? quotationMap.get(sample.quotationId)
                : undefined;

              return (
                <article
                  key={sample.id}
                  className={`samples-premium-card sample-status-${statusSlug(
                    sample.status
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
                              sample.status
                            )}`}
                          >
                            {sample.status}
                          </span>

                          <span
                            className={`samples-premium-report-status ${statusSlug(
                              sample.reportStatus
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

                          {company?.name ||
                            "Unknown Company"}

                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>

                    <div className="samples-premium-count-box">
                      <span>Sample Quantity</span>

                      <strong>{sample.sampleCount}</strong>

                      <small>
                        {sample.sampleCount === 1
                          ? "Sample"
                          : "Samples"}
                      </small>
                    </div>
                  </div>

                  {/* OPERATIONAL INFORMATION */}

                  <div className="samples-premium-info-grid">
                    <SampleInfo
                      label="Collection Date"
                      value={formatDate(
                        sample.collectionDate
                      )}
                      icon={<CalendarDays size={15} />}
                      type="collection"
                    />

                    <SampleInfo
                      label="Expected Completion"
                      value={formatDate(
                        sample.expectedCompletionDate
                      )}
                      icon={<FileClock size={15} />}
                      type="expected"
                    />

                    <SampleInfo
                      label="Testing Location"
                      value={
                        sample.testingLocation || "—"
                      }
                      icon={<MapPin size={15} />}
                      type="location"
                    />

                    <SampleInfo
                      label="Report Delivered"
                      value={formatDate(
                        sample.reportDeliveredDate
                      )}
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
                            <strong>
                              {sample.collectedBy}
                            </strong>
                          </span>
                        </div>
                      )}

                      {quotation && (
                        <div className="samples-premium-quotation">
                          <div className="samples-premium-quotation-icon">
                            <ReceiptText size={15} />
                          </div>

                          <div>
                            <span>
                              Linked Quotation
                            </span>

                            <strong>
                              {quotation.quotationNumber}
                            </strong>

                            <small>
                              {quotation.service} •{" "}
                              {quotation.status}
                            </small>
                          </div>

                          <Link
                            href={`/admin/quotations/${quotation.id}`}
                          >
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
========================================================= */

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
  type:
    | "navy"
    | "cyan"
    | "blue"
    | "purple"
    | "green"
    | "orange";
}) {
  return (
    <div className={`samples-premium-metric ${type}`}>
      <div className="samples-premium-metric-icon">
        {icon}
      </div>

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
========================================================= */

function SampleInfo({
  label,
  value,
  icon,
  type,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  type:
    | "collection"
    | "expected"
    | "location"
    | "report";
}) {
  return (
    <div className={`samples-premium-info ${type}`}>
      <div className="samples-premium-info-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}