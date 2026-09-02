import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileClock,
  FileText,
  FlaskConical,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  service: string;
  requirement: string;
  source: string;
  status: string;
  notes: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

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

/* =========================================================
   DATABASE
========================================================= */

async function getLeads(): Promise<Lead[]> {
  try {
    const leads = await db.orm.public.Lead
      .orderBy((lead) => lead.createdAt.desc())
      .all();

    return leads as Lead[];
  } catch (error) {
    console.error("Dashboard getLeads error:", error);
    return [];
  }
}

async function getSamples(): Promise<Sample[]> {
  try {
    const samples = await db.orm.public.Sample
      .orderBy((sample) => sample.createdAt.desc())
      .all();

    return samples as Sample[];
  } catch (error) {
    console.error("Dashboard getSamples error:", error);
    return [];
  }
}

async function getReports(): Promise<Report[]> {
  try {
    const reports = await db.orm.public.Report
      .orderBy((report) => report.createdAt.desc())
      .all();

    return reports as Report[];
  } catch (error) {
    console.error("Dashboard getReports error:", error);
    return [];
  }
}

/* =========================================================
   HELPERS
========================================================= */

function toDateOnly(value: string) {
  const date = new Date(value);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/* =========================================================
   DASHBOARD
========================================================= */

export default async function AdminDashboardPage() {
  const [leads, samples, reports] = await Promise.all([
    getLeads(),
    getSamples(),
    getReports(),
  ]);

  /* -------------------------
     LEAD METRICS
  ------------------------- */

  const totalLeads = leads.length;

  const wonLeads = leads.filter(
    (lead) => lead.status === "Won"
  );

  const activeLeads = leads.filter(
    (lead) =>
      lead.status !== "Won" &&
      lead.status !== "Lost"
  );

  const quotations = leads.filter(
    (lead) => lead.status === "Quotation Sent"
  );

  const today = toDateOnly(new Date().toISOString());

  const overdue = activeLeads.filter((lead) => {
    if (!lead.nextFollowUp) {
      return false;
    }

    return toDateOnly(lead.nextFollowUp) < today;
  });

  const upcoming = activeLeads.filter((lead) => {
    if (!lead.nextFollowUp) {
      return false;
    }

    return toDateOnly(lead.nextFollowUp) >= today;
  });

  const recentLeads = leads.slice(0, 5);

  /* -------------------------
     SAMPLE METRICS
  ------------------------- */

  const totalSampleRecords = samples.length;

  const totalSamples = samples.reduce(
    (total, sample) =>
      total + Number(sample.sampleCount || 0),
    0
  );

  const samplesInTesting = samples.filter(
    (sample) => sample.status === "Testing"
  ).length;

  const sampleReportsPending = samples.filter(
    (sample) => sample.reportStatus !== "Delivered"
  ).length;

  const sampleReportsDelivered = samples.filter(
    (sample) => sample.reportStatus === "Delivered"
  ).length;

  const recentSamples = samples.slice(0, 5);

  /* -------------------------
     REPORT METRICS
  ------------------------- */

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  const preparingReports = reports.filter(
    (report) => report.status === "Under Preparation"
  ).length;

  const readyReports = reports.filter(
    (report) => report.status === "Ready"
  ).length;

  const deliveredReports = reports.filter(
    (report) => report.status === "Delivered"
  ).length;

  const recentReports = reports.slice(0, 5);

  /* -------------------------
     SALES PIPELINE
  ------------------------- */

  const pipeline = [
    {
      name: "New Lead",
      count: leads.filter(
        (lead) => lead.status === "New Lead"
      ).length,
    },
    {
      name: "Contacted",
      count: leads.filter(
        (lead) => lead.status === "Contacted"
      ).length,
    },
    {
      name: "Meeting Scheduled",
      count: leads.filter(
        (lead) => lead.status === "Meeting Scheduled"
      ).length,
    },
    {
      name: "Requirement Identified",
      count: leads.filter(
        (lead) =>
          lead.status === "Requirement Identified"
      ).length,
    },
    {
      name: "Quotation Sent",
      count: quotations.length,
    },
    {
      name: "Follow-up",
      count: leads.filter(
        (lead) => lead.status === "Follow-up"
      ).length,
    },
    {
      name: "Won",
      count: wonLeads.length,
    },
  ];

  return (
    <div className="crm-dashboard-content">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <header className="crm-header">
        <div>
          <span>Nexus Hyderabad CRM</span>

          <h1>Business Dashboard</h1>

          <p>
            Lead pipeline, follow-ups, samples,
            reports and business development
            activity at a glance.
          </p>
        </div>

        <div className="crm-live-badge">
          <span />
          Neon Database Connected
        </div>
      </header>

      {/* =========================================
          BUSINESS METRICS
      ========================================= */}

      <div className="crm-metrics">
        <MetricCard
          title="Total Leads"
          value={totalLeads}
          icon={<Target size={21} />}
        />

        <MetricCard
          title="Active Leads"
          value={activeLeads.length}
          icon={<Users size={21} />}
        />

        <MetricCard
          title="Quotations"
          value={quotations.length}
          icon={<FileText size={21} />}
        />

        <MetricCard
          title="Won Deals"
          value={wonLeads.length}
          icon={<CircleDollarSign size={21} />}
        />

        <MetricCard
          title="Overdue"
          value={overdue.length}
          icon={<Clock3 size={21} />}
        />

        <MetricCard
          title="Upcoming"
          value={upcoming.length}
          icon={<CalendarDays size={21} />}
        />
      </div>

      {/* =========================================
          SAMPLE OPERATIONS
      ========================================= */}

      <section className="crm-panel crm-dashboard-section">
        <div className="crm-panel-heading">
          <div>
            <h2>Sample Operations</h2>

            <p>
              Live sample collection, testing and
              report status from Neon.
            </p>
          </div>

          <Link href="/admin/samples">
            View Samples
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="crm-metrics crm-operation-metrics">
          <MetricCard
            title="Sample Records"
            value={totalSampleRecords}
            icon={<FlaskConical size={21} />}
          />

          <MetricCard
            title="Total Samples"
            value={totalSamples}
            icon={<FlaskConical size={21} />}
          />

          <MetricCard
            title="In Testing"
            value={samplesInTesting}
            icon={<TrendingUp size={21} />}
          />

          <MetricCard
            title="Reports Pending"
            value={sampleReportsPending}
            icon={<FileClock size={21} />}
          />

          <MetricCard
            title="Reports Delivered"
            value={sampleReportsDelivered}
            icon={<CheckCircle2 size={21} />}
          />
        </div>
      </section>

      {/* =========================================
          REPORT OPERATIONS
      ========================================= */}

      <section className="crm-panel crm-dashboard-section">
        <div className="crm-panel-heading">
          <div>
            <h2>Report Operations</h2>

            <p>
              Laboratory report preparation,
              readiness and client delivery.
            </p>
          </div>

          <Link href="/admin/reports">
            View Reports
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="crm-metrics crm-operation-metrics">
          <MetricCard
            title="Total Reports"
            value={totalReports}
            icon={<FileText size={21} />}
          />

          <MetricCard
            title="Pending"
            value={pendingReports}
            icon={<FileClock size={21} />}
          />

          <MetricCard
            title="Under Preparation"
            value={preparingReports}
            icon={<TrendingUp size={21} />}
          />

          <MetricCard
            title="Ready"
            value={readyReports}
            icon={<CheckCircle2 size={21} />}
          />

          <MetricCard
            title="Delivered"
            value={deliveredReports}
            icon={<CheckCircle2 size={21} />}
          />
        </div>
      </section>

      {/* =========================================
          PIPELINE + FOLLOW UPS
      ========================================= */}

      <div className="crm-dashboard-grid">
        <section className="crm-panel">
          <div className="crm-panel-heading">
            <div>
              <h2>Sales Pipeline</h2>

              <p>
                Current leads by business stage.
              </p>
            </div>

            <Link href="/admin/leads">
              View Leads
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="crm-pipeline">
            {pipeline.map((stage) => {
              const percentage =
                totalLeads > 0
                  ? Math.max(
                      (stage.count / totalLeads) * 100,
                      stage.count > 0 ? 8 : 0
                    )
                  : 0;

              return (
                <div
                  className="crm-pipeline-row"
                  key={stage.name}
                >
                  <div>
                    <span>{stage.name}</span>
                    <strong>{stage.count}</strong>
                  </div>

                  <div className="crm-pipeline-track">
                    <div
                      className="crm-pipeline-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="crm-panel">
          <div className="crm-panel-heading">
            <div>
              <h2>Follow-up Summary</h2>

              <p>
                Leads requiring action.
              </p>
            </div>

            <Link href="/admin/follow-ups">
              View Follow-ups
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="crm-action-summary">
            <Link
              href="/admin/follow-ups"
              className="crm-action-item urgent"
            >
              <div>
                <Clock3 size={18} />
                <span>Overdue</span>
              </div>

              <strong>{overdue.length}</strong>
            </Link>

            <Link
              href="/admin/follow-ups"
              className="crm-action-item"
            >
              <div>
                <CalendarDays size={18} />
                <span>Upcoming</span>
              </div>

              <strong>{upcoming.length}</strong>
            </Link>

            <div className="crm-action-item">
              <div>
                <Target size={18} />
                <span>Active Pipeline</span>
              </div>

              <strong>{activeLeads.length}</strong>
            </div>

            <div className="crm-action-item">
              <div>
                <CircleDollarSign size={18} />
                <span>Closed Won</span>
              </div>

              <strong>{wonLeads.length}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================
          RECENT REPORTS
      ========================================= */}

      <RecentSection
        title="Recent Reports"
        description="Latest laboratory reports being tracked in the CRM."
        viewAllHref="/admin/reports"
      >
        {recentReports.length > 0 ? (
          <div className="crm-recent-list">
            {recentReports.map((report) => (
              <Link
                href={`/admin/reports/${report.id}`}
                className="crm-recent-lead"
                key={report.id}
              >
                <div className="crm-recent-avatar">
                  {report.reportType
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="crm-recent-person">
                  <strong>
                    {report.reportNumber}
                  </strong>

                  <span>{report.reportType}</span>
                </div>

                <div className="crm-recent-service">
                  <span>Status</span>
                  <strong>{report.status}</strong>
                </div>

                <div className="crm-recent-status">
                  {report.status}
                </div>

                <div className="crm-recent-date">
                  {formatDate(report.createdAt)}
                </div>

                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="crm-empty">
            No reports yet.
          </div>
        )}
      </RecentSection>

      {/* =========================================
          RECENT SAMPLES
      ========================================= */}

      <RecentSection
        title="Recent Samples"
        description="Latest samples being tracked in the CRM."
        viewAllHref="/admin/samples"
      >
        {recentSamples.length > 0 ? (
          <div className="crm-recent-list">
            {recentSamples.map((sample) => (
              <Link
                href={`/admin/samples/${sample.id}`}
                className="crm-recent-lead"
                key={sample.id}
              >
                <div className="crm-recent-avatar">
                  {sample.sampleType
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="crm-recent-person">
                  <strong>
                    {sample.sampleNumber}
                  </strong>

                  <span>{sample.sampleType}</span>
                </div>

                <div className="crm-recent-service">
  <span>Samples</span>
  <strong>
    {sample.sampleCount}
  </strong>
</div>

                <div className="crm-recent-status">
                  {sample.status}
                </div>

                <div className="crm-recent-date">
                  {formatDate(sample.createdAt)}
                </div>

                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="crm-empty">
            No samples yet.
          </div>
        )}
      </RecentSection>

      {/* =========================================
          RECENT LEADS
      ========================================= */}

      <RecentSection
        title="Recent Leads"
        description="Latest website enquiries and prospects."
        viewAllHref="/admin/leads"
      >
        {recentLeads.length > 0 ? (
          <div className="crm-recent-list">
            {recentLeads.map((lead) => (
              <Link
                href={`/admin/leads/${lead.id}`}
                className="crm-recent-lead"
                key={lead.id}
              >
                <div className="crm-recent-avatar">
                  {lead.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="crm-recent-person">
                  <strong>{lead.name}</strong>
                  <span>{lead.company}</span>
                </div>

                <div className="crm-recent-service">
                  <span>Service</span>
                  <strong>{lead.service}</strong>
                </div>

                <div className="crm-recent-status">
                  {lead.status}
                </div>

                <div className="crm-recent-date">
                  {formatDate(lead.createdAt)}
                </div>

                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="crm-empty">
            No leads yet.
          </div>
        )}
      </RecentSection>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="crm-metric-card">
      <div className="crm-metric-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   RECENT SECTION
========================================================= */

function RecentSection({
  title,
  description,
  viewAllHref,
  children,
}: {
  title: string;
  description: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="crm-panel crm-recent-panel">
      <div className="crm-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <Link href={viewAllHref}>
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      {children}
    </section>
  );
}