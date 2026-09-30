"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileClock,
  FlaskConical,
  MapPin,
  PackageCheck,
  RefreshCw,
  Send,
  TestTube2,
} from "lucide-react";

import "./operations.css";

type QueueItem = {
  id: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  companyName: string;
  locationName: string;
  status: string;
  reportStatus: string;
  testingLocation: string;
  collectionDate: string | null;
  expectedCompletionDate: string | null;
  daysUntilDue: number | null;
  daysOverdue: number | null;
};

type WorkflowBucket = {
  records: number;
  quantity: number;
};

type Summary = {
  success: boolean;
  generatedAt?: string;
  message?: string;
  totals?: {
    records?: number;
    physicalSamples?: number;
    pendingReports?: number;
    pendingReportRecords?: number;
    deliveredReports?: number;
    deliveredReportRecords?: number;
    missingExpectedCompletionDate?: number;
    missingExpectedCompletionQuantity?: number;
    missingTestingLocation?: number;
    dueSoon?: number;
    dueSoonRecords?: number;
    overdue?: number;
    overdueRecords?: number;
    readyToDeliver?: number;
    readyToDeliverRecords?: number;
  };
  workflow?: {
    planned?: WorkflowBucket;
    collected?: WorkflowBucket;
    dispatched?: WorkflowBucket;
    receivedAtLab?: WorkflowBucket;
    testing?: WorkflowBucket;
    completed?: WorkflowBucket;
    reportDelivered?: WorkflowBucket;
    other?: WorkflowBucket;
  };
  queues?: {
    overdue?: QueueItem[];
    dueSoon?: QueueItem[];
    missingDueDate?: QueueItem[];
    awaitingLab?: QueueItem[];
    inTesting?: QueueItem[];
    readyToDeliver?: QueueItem[];
    missingTestingLocation?: QueueItem[];
  };
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Metric({
  label,
  value,
  helper,
  tone,
  icon,
  href,
}: {
  label: string;
  value: number;
  helper: string;
  tone: "red" | "orange" | "blue" | "purple" | "green" | "cyan" | "navy";
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className={`ops-metric ${tone}`}>
      <span className="ops-metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
      <ArrowRight size={15} className="ops-metric-arrow" />
    </Link>
  );
}

function WorkflowStep({
  label,
  bucket,
  tone,
}: {
  label: string;
  bucket?: WorkflowBucket;
  tone: string;
}) {
  return (
    <div className={`ops-flow-step ${tone}`}>
      <span>{label}</span>
      <strong>{bucket?.quantity || 0}</strong>
      <small>{bucket?.records || 0} record{bucket?.records === 1 ? "" : "s"}</small>
    </div>
  );
}

function Queue({
  title,
  subtitle,
  items,
  empty,
  tone,
}: {
  title: string;
  subtitle: string;
  items?: QueueItem[];
  empty: string;
  tone: "red" | "orange" | "blue" | "green" | "purple";
}) {
  const visible = items?.slice(0, 8) || [];

  return (
    <section className="ops-panel">
      <div className="ops-panel-head">
        <div>
          <span className={`ops-panel-dot ${tone}`} />
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <strong>{items?.length || 0}</strong>
      </div>

      <div className="ops-queue">
        {visible.length ? (
          visible.map((item) => (
            <Link
              key={item.id}
              href={`/admin/samples/${item.id}`}
              className="ops-queue-row"
            >
              <div className="ops-queue-main">
                <strong>{item.sampleNumber}</strong>
                <span>{item.sampleType} · Qty {item.sampleCount}</span>
                <small>{item.companyName} · {item.locationName}</small>
              </div>

              <div className="ops-queue-meta">
                <span>{item.status}</span>
                <small>
                  {item.daysOverdue !== null
                    ? `${item.daysOverdue} day${item.daysOverdue === 1 ? "" : "s"} overdue`
                    : item.daysUntilDue !== null
                      ? item.daysUntilDue === 0
                        ? "Due today"
                        : `Due in ${item.daysUntilDue} day${item.daysUntilDue === 1 ? "" : "s"}`
                      : item.expectedCompletionDate
                        ? formatDate(item.expectedCompletionDate)
                        : "Due date missing"}
                </small>
              </div>

              <ArrowRight size={15} />
            </Link>
          ))
        ) : (
          <div className="ops-empty">{empty}</div>
        )}
      </div>
    </section>
  );
}

export default function OperationsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/operations/summary", {
        cache: "no-store",
      });
      const json = (await response.json()) as Summary;

      if (!response.ok || json.success === false) {
        throw new Error(json.message || "Unable to load operations summary.");
      }

      setData(json);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load operations summary.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totals = data?.totals || {};
  const queues = data?.queues || {};
  const workflow = data?.workflow || {};

  const generatedLabel = useMemo(() => {
    if (!data?.generatedAt) return "Live CRM data";
    const date = new Date(data.generatedAt);
    if (Number.isNaN(date.getTime())) return "Live CRM data";
    return `Updated ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, [data?.generatedAt]);

  return (
    <main className="ops-page">
      <div className="ops-topbar">
        <div>
          <span>Hyderabad Operations</span>
          <strong>{generatedLabel}</strong>
        </div>

        <div className="ops-top-actions">
          <button type="button" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={15} className={loading ? "ops-spin" : ""} />
            Refresh
          </button>

          <Link href="/admin/samples">
            All Samples
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <section className="ops-hero">
        <div>
          <span>Operations Control Center</span>
          <h1>Laboratory Workflow & Report Control</h1>
          <p>
            Track collected samples, laboratory movement, testing, expected
            completion and report delivery using the same live CRM data.
          </p>
        </div>

        <div className="ops-hero-summary">
          <small>Physical Samples</small>
          <strong>{totals.physicalSamples || 0}</strong>
          <span>{totals.records || 0} CRM records</span>
        </div>
      </section>

      {error && <div className="ops-alert error">{error}</div>}

      {loading && !data ? (
        <div className="ops-loading">Loading live Hyderabad operations…</div>
      ) : (
        <>
          <section className="ops-metrics">
            <Metric
              label="Overdue"
              value={totals.overdue || 0}
              helper={`${totals.overdueRecords || 0} records past expected date`}
              tone="red"
              icon={<AlertTriangle size={19} />}
              href="/admin/samples?report=pending"
            />
            <Metric
              label="Due Soon"
              value={totals.dueSoon || 0}
              helper={`${totals.dueSoonRecords || 0} records due within 2 days`}
              tone="orange"
              icon={<CalendarClock size={19} />}
              href="/admin/samples?report=pending"
            />
            <Metric
              label="Pending Reports"
              value={totals.pendingReports || 0}
              helper={`${totals.pendingReportRecords || 0} open report records`}
              tone="blue"
              icon={<FileClock size={19} />}
              href="/admin/samples?report=pending"
            />
            <Metric
              label="Ready to Deliver"
              value={totals.readyToDeliver || 0}
              helper={`${totals.readyToDeliverRecords || 0} reports ready`}
              tone="purple"
              icon={<PackageCheck size={19} />}
              href="/admin/samples?report=ready"
            />
            <Metric
              label="Missing Due Date"
              value={totals.missingExpectedCompletionDate || 0}
              helper={`${totals.missingExpectedCompletionQuantity || 0} physical samples`}
              tone="cyan"
              icon={<ClipboardList size={19} />}
              href="/admin/samples?report=pending"
            />
            <Metric
              label="Delivered Reports"
              value={totals.deliveredReports || 0}
              helper={`${totals.deliveredReportRecords || 0} completed records`}
              tone="green"
              icon={<CheckCircle2 size={19} />}
              href="/admin/samples?report=delivered"
            />
          </section>

          <section className="ops-flow-panel">
            <div className="ops-section-heading">
              <div>
                <span>Live Workflow</span>
                <h2>Sample Movement</h2>
                <p>Quantity currently sitting at each operational stage.</p>
              </div>
              <FlaskConical size={22} />
            </div>

            <div className="ops-flow">
              <WorkflowStep label="Planned" bucket={workflow.planned} tone="slate" />
              <WorkflowStep label="Collected" bucket={workflow.collected} tone="cyan" />
              <WorkflowStep label="Dispatched" bucket={workflow.dispatched} tone="blue" />
              <WorkflowStep label="Received at Lab" bucket={workflow.receivedAtLab} tone="indigo" />
              <WorkflowStep label="Testing" bucket={workflow.testing} tone="purple" />
              <WorkflowStep label="Completed" bucket={workflow.completed} tone="green" />
              <WorkflowStep label="Report Delivered" bucket={workflow.reportDelivered} tone="navy" />
            </div>
          </section>

          <section className="ops-grid two">
            <Queue
              title="Overdue Reports"
              subtitle="Expected completion date has already passed."
              items={queues.overdue}
              empty="No overdue reports."
              tone="red"
            />
            <Queue
              title="Due Soon"
              subtitle="Expected within the next two days."
              items={queues.dueSoon}
              empty="Nothing is due within the next two days."
              tone="orange"
            />
          </section>

          <section className="ops-grid two">
            <Queue
              title="Missing Expected Date"
              subtitle="Collected/open samples that need an expected completion date."
              items={queues.missingDueDate}
              empty="All active samples have expected completion dates."
              tone="blue"
            />
            <Queue
              title="Ready to Deliver"
              subtitle="Reports marked ready but not yet delivered."
              items={queues.readyToDeliver}
              empty="No reports are waiting for delivery."
              tone="green"
            />
          </section>

          <section className="ops-grid two">
            <Queue
              title="Awaiting Laboratory"
              subtitle="Collected or dispatched samples that have not reached testing."
              items={queues.awaitingLab}
              empty="No samples are waiting for laboratory movement."
              tone="blue"
            />
            <Queue
              title="Currently Testing"
              subtitle="Active samples presently in laboratory testing."
              items={queues.inTesting}
              empty="No samples are currently marked as Testing."
              tone="purple"
            />
          </section>

          <section className="ops-quality-panel">
            <div>
              <MapPin size={18} />
              <span>
                <strong>Workflow Data Quality</strong>
                <small>
                  {totals.missingTestingLocation || 0} active sample record
                  {(totals.missingTestingLocation || 0) === 1 ? "" : "s"} missing a testing location.
                </small>
              </span>
            </div>
            <Link href="/admin/samples">
              Review Samples
              <ArrowRight size={14} />
            </Link>
          </section>

          <section className="ops-automation-note">
            <TestTube2 size={19} />
            <div>
              <strong>Automatic control is active</strong>
              <p>
                Identification imports create Collected samples, report records
                synchronize back to the sample, and the notification system
                automatically raises Due Soon and Overdue alerts from the
                Expected Completion Date without creating duplicate alerts.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
