import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FlaskConical,
  FolderOpen,
  MailCheck,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   DATABASE
========================================================= */

async function getReports(): Promise<Report[]> {
  try {
    const reports = await db.orm.public.Report
      .orderBy((report) => report.createdAt.desc())
      .all();

    return reports as Report[];
  } catch (error) {
    console.error("Reports page getReports error:", error);
    return [];
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    const companies = await db.orm.public.Company.all();

    return companies as Company[];
  } catch (error) {
    console.error("Reports page getCompanies error:", error);
    return [];
  }
}

async function getSamples(): Promise<Sample[]> {
  try {
    const samples = await db.orm.public.Sample.all();

    return samples as Sample[];
  } catch (error) {
    console.error("Reports page getSamples error:", error);
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

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

export default async function ReportsPage() {
  /*
   * All database operations begin together.
   *
   * This replaces the previous browser-side:
   *
   * /api/reports
   * /api/companies
   * /api/samples
   *
   * requests.
   */
  const [reports, companies, samples] = await Promise.all([
    getReports(),
    getCompanies(),
    getSamples(),
  ]);

  /* =======================================================
     LOOKUP MAPS
  ======================================================= */

  const companyMap = new Map(
    companies.map((company) => [company.id, company])
  );

  const sampleMap = new Map(
    samples.map((sample) => [sample.id, sample])
  );

  /* =======================================================
     METRICS
  ======================================================= */

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  const underPreparation = reports.filter(
    (report) => report.status === "Under Preparation"
  ).length;

  const readyReports = reports.filter(
    (report) => report.status === "Ready"
  ).length;

  const deliveredReports = reports.filter(
    (report) => report.status === "Delivered"
  ).length;

  const deliveryRate =
    totalReports > 0
      ? Math.round((deliveredReports / totalReports) * 100)
      : 0;

  return (
    <div className="reports-premium-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="reports-premium-header">
        <div>
          <div className="reports-premium-eyebrow">
            <span className="reports-premium-eyebrow-icon">
              <Sparkles size={12} />
            </span>

            Laboratory Reporting
          </div>

          <h1>Reports</h1>

          <p>
            Manage laboratory reports from preparation through
            final release and client delivery.
          </p>
        </div>

        <Link
          href="/admin/reports/new"
          className="reports-premium-add"
        >
          <Plus size={17} />
          <span>Add Report</span>
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* =====================================================
          METRICS
      ====================================================== */}

      <section className="reports-premium-metrics">
        <ReportMetric
          label="Total Reports"
          value={totalReports}
          helper="Report records"
          icon={<FileText size={20} />}
          type="navy"
        />

        <ReportMetric
          label="Pending"
          value={pendingReports}
          helper="Awaiting preparation"
          icon={<Clock3 size={20} />}
          type="orange"
        />

        <ReportMetric
          label="Under Preparation"
          value={underPreparation}
          helper="Currently processing"
          icon={<FolderOpen size={20} />}
          type="purple"
        />

        <ReportMetric
          label="Ready"
          value={readyReports}
          helper="Ready for delivery"
          icon={<FileCheck2 size={20} />}
          type="cyan"
        />

        <ReportMetric
          label="Delivered"
          value={deliveredReports}
          helper="Completed delivery"
          icon={<CheckCircle2 size={20} />}
          type="green"
        />

        <ReportMetric
          label="Delivery Rate"
          value={deliveryRate}
          suffix="%"
          helper="Reports delivered"
          icon={<MailCheck size={20} />}
          type="blue"
        />
      </section>

      {/* =====================================================
          REPORT REGISTER
      ====================================================== */}

      <section className="reports-premium-panel">
        <div className="reports-premium-panel-header">
          <div className="reports-premium-panel-heading">
            <div className="reports-premium-panel-icon">
              <FileCheck2 size={20} />
            </div>

            <div>
              <span>Report Lifecycle</span>
              <h2>Report Register</h2>
              <p>
                Preparation → Ready → Client Delivery
              </p>
            </div>
          </div>

          <div className="reports-premium-panel-count">
            {totalReports}{" "}
            {totalReports === 1 ? "Report" : "Reports"}
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="reports-premium-empty">
            <div className="reports-premium-empty-icon">
              <FileText size={29} />
            </div>

            <span>Reporting Workspace</span>

            <h3>No reports yet</h3>

            <p>
              Create your first report and connect it with an
              existing client sample to start tracking report
              preparation and delivery.
            </p>

            <Link href="/admin/reports/new">
              <Plus size={15} />
              Add First Report
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="reports-premium-list">
            {reports.map((report) => {
              const company = companyMap.get(report.companyId);
              const sample = sampleMap.get(report.sampleId);

              return (
                <article
                  key={report.id}
                  className={`reports-premium-card report-status-${statusSlug(
                    report.status
                  )}`}
                >
                  {/* TOP */}

                  <div className="reports-premium-card-top">
                    <div className="reports-premium-identity">
                      <div className="reports-premium-report-icon">
                        <FileText size={22} />
                      </div>

                      <div className="reports-premium-title">
                        <div className="reports-premium-badges">
                          <span
                            className={`reports-premium-status ${statusSlug(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>

                          <span className="reports-premium-type">
                            {report.reportType}
                          </span>
                        </div>

                        <h3>{report.reportNumber}</h3>

                        <span className="reports-premium-created">
                          <CalendarDays size={13} />
                          Created {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="reports-premium-status-box">
                      <span>Report Status</span>

                      <strong>{report.status}</strong>

                      <small>
                        {report.status === "Delivered"
                          ? "Completed"
                          : "In progress"}
                      </small>
                    </div>
                  </div>

                  {/* LINKED DATA */}

                  <div className="reports-premium-link-grid">
                    <div className="reports-premium-link-box company">
                      <div className="reports-premium-link-icon">
                        <Building2 size={15} />
                      </div>

                      <div>
                        <span>Company</span>

                        {company ? (
                          <Link
                            href={`/admin/companies/${company.id}`}
                          >
                            {company.name}
                          </Link>
                        ) : (
                          <strong>Unknown Company</strong>
                        )}
                      </div>
                    </div>

                    <div className="reports-premium-link-box sample">
                      <div className="reports-premium-link-icon">
                        <FlaskConical size={15} />
                      </div>

                      <div>
                        <span>Linked Sample</span>

                        {sample ? (
                          <>
                            <Link
                              href={`/admin/samples/${sample.id}`}
                            >
                              {sample.sampleNumber}
                            </Link>

                            <small>{sample.sampleType}</small>
                          </>
                        ) : (
                          <strong>Unknown Sample</strong>
                        )}
                      </div>
                    </div>

                    <ReportInfo
                      label="Report Date"
                      value={formatDate(report.reportDate)}
                      icon={<CalendarDays size={15} />}
                      type="date"
                    />

                    <ReportInfo
                      label="Delivered Date"
                      value={formatDate(report.deliveredDate)}
                      icon={<CheckCircle2 size={15} />}
                      type="delivered"
                    />
                  </div>

                  {/* DELIVERY INFORMATION */}

                  <div className="reports-premium-details">
                    <div className="reports-premium-detail delivery">
                      <div>
                        <Send size={15} />
                      </div>

                      <span>
                        Delivery Method
                        <strong>
                          {report.deliveryMethod || "—"}
                        </strong>
                      </span>
                    </div>

                    <div className="reports-premium-detail file">
                      <div>
                        <FolderOpen size={15} />
                      </div>

                      <span>
                        File Reference
                        <strong>
                          {report.fileReference || "—"}
                        </strong>
                      </span>
                    </div>

                    {report.notes && (
                      <div className="reports-premium-notes">
                        <FileText size={14} />

                        <div>
                          <span>Notes</span>
                          <p>{report.notes}</p>
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="reports-premium-edit"
                    >
                      <FileCheck2 size={16} />

                      <span>View / Edit Report</span>

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
   METRIC
========================================================= */

function ReportMetric({
  label,
  value,
  helper,
  icon,
  type,
  suffix = "",
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
  type:
    | "navy"
    | "orange"
    | "purple"
    | "cyan"
    | "green"
    | "blue";
  suffix?: string;
}) {
  return (
    <div className={`reports-premium-metric ${type}`}>
      <div className="reports-premium-metric-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
        <small>{helper}</small>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT INFO
========================================================= */

function ReportInfo({
  label,
  value,
  icon,
  type,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  type: "date" | "delivered";
}) {
  return (
    <div className={`reports-premium-info ${type}`}>
      <div className="reports-premium-info-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}