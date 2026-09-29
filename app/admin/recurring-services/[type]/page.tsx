import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileClock,
  FileText,
  FlaskConical,
  MapPin,
  PackageCheck,
  ReceiptText,
  Send,
  TestTube2,
  UserRound,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./sample-type.css";

export const dynamic = "force-dynamic";

/* =========================================================

   TYPES

   ========================================================= */

type Category = "water" | "food" | "swab";

type PageCategory = Category | "all";

type Company = {
  id: string;

  name: string;

  status: string;
};

type Location = {
  id: string;

  companyId: string;

  name: string;

  city: string | null;

  state: string | null;

  status: string;
};

type RecurringService = {
  id: string;

  companyId: string;

  locationId: string | null;

  service: string;

  sampleType: string;

  samplesPerMonth: number;

  frequency: string;

  status: string;

  startDate: string | null;

  endDate: string | null;

  notes: string | null;
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

type Quotation = {
  id: string;

  companyId: string;

  quotationNumber: string;

  service: string;

  status: string;

  totalAmount: number;
};

type PageProps = {
  params: Promise<{
    type: string;
  }>;
};

/* =========================================================

   DATABASE

   ========================================================= */

async function getCompanies(): Promise<Company[]> {
  try {
    return (await db.orm.public.Company.all()) as Company[];
  } catch (error) {
    console.error("Sample type getCompanies error:", error);

    return [];
  }
}

async function getLocations(): Promise<Location[]> {
  try {
    return (await db.orm.public.Location.all()) as Location[];
  } catch (error) {
    console.error("Sample type getLocations error:", error);

    return [];
  }
}

async function getRecurringServices(): Promise<RecurringService[]> {
  try {
    return (await db.orm.public.RecurringService.all()) as RecurringService[];
  } catch (error) {
    console.error("Sample type getRecurringServices error:", error);

    return [];
  }
}

async function getSamples(): Promise<Sample[]> {
  try {
    const samples = await db.orm.public.Sample.orderBy((sample) =>
      sample.createdAt.desc(),
    ).all();

    return samples as Sample[];
  } catch (error) {
    console.error("Sample type getSamples error:", error);

    return [];
  }
}

async function getQuotations(): Promise<Quotation[]> {
  try {
    return (await db.orm.public.Quotation.all()) as Quotation[];
  } catch (error) {
    console.error("Sample type getQuotations error:", error);

    return [];
  }
}

/* =========================================================

   HELPERS

   ========================================================= */

function normalize(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatDate(value: string | null) {
  if (!value) return "—";

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

function statusSlug(value: string) {
  return normalize(value)
    .replaceAll(" ", "-")

    .replaceAll("/", "-");
}

function getCategoryFromText(value: string): Category | "other" {
  const text = normalize(value);

  if (text.includes("food")) {
    return "food";
  }

  if (text.includes("swab")) {
    return "swab";
  }

  if (text.includes("water") || text === "ro") {
    return "water";
  }

  return "other";
}

/*

  IMPORTANT:



  Your existing recurring data has records like:



  service = Water Testing

  sampleType = Food



  Therefore sampleType is the primary recurring

  classification.

*/

function getRecurringCategory(record: RecurringService): Category | "other" {
  const fromSampleType = getCategoryFromText(record.sampleType);

  if (fromSampleType !== "other") {
    return fromSampleType;
  }

  return getCategoryFromText(record.service);
}

function getSampleCategory(sample: Sample): Category | "other" {
  return getCategoryFromText(sample.sampleType);
}

function sumSamples(samples: Sample[]) {
  return samples.reduce(
    (total, sample) => total + Number(sample.sampleCount || 0),

    0,
  );
}

function isSameMonth(
  value: string | null,

  now: Date,
) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function getCategoryConfig(type: PageCategory) {
  if (type === "all")
    return {
      title: "Recurring Sample Operations",
      shortTitle: "All",
      description:
        "Complete Hyderabad recurring sample operations covering Water, Food and Swab testing.",
    };
  if (type === "food")
    return {
      title: "Food Samples",
      shortTitle: "Food",
      description:
        "Complete food sample collection, testing and report operations.",
    };
  if (type === "swab")
    return {
      title: "Swab Samples",
      shortTitle: "Swab",
      description:
        "Complete swab collection, laboratory testing and report operations.",
    };
  return {
    title: "Water Samples",
    shortTitle: "Water",
    description:
      "Complete Water and RO Water collection, testing and report operations.",
  };
}

/* =========================================================

   PAGE

   ========================================================= */

export default async function SampleTypePage({ params }: PageProps) {
  const resolvedParams = await params;

  const requestedType = normalize(resolvedParams.type);

  const type: PageCategory =
    requestedType === "food"
      ? "food"
      : requestedType === "swab"
        ? "swab"
        : requestedType === "all"
          ? "all"
          : "water";

  const config = getCategoryConfig(type);

  const [companies, locations, recurringServices, samples, quotations] =
    await Promise.all([
      getCompanies(),

      getLocations(),

      getRecurringServices(),

      getSamples(),

      getQuotations(),
    ]);

  /* =======================================================

     LOOKUPS

     ======================================================= */

  const companyMap = new Map(companies.map((company) => [company.id, company]));

  const locationMap = new Map(
    locations.map((location) => [location.id, location]),
  );

  const quotationMap = new Map(
    quotations.map((quotation) => [quotation.id, quotation]),
  );

  /* =======================================================

     RECURRING COMMITMENT

     ======================================================= */

  const allActiveRecurring = recurringServices.filter(
    (record) => normalize(record.status) === "active",
  );
  const waterRecurring = allActiveRecurring.filter(
    (record) => getRecurringCategory(record) === "water",
  );
  const foodRecurring = allActiveRecurring.filter(
    (record) => getRecurringCategory(record) === "food",
  );
  const swabRecurring = allActiveRecurring.filter(
    (record) => getRecurringCategory(record) === "swab",
  );
  const waterCommitment = waterRecurring.reduce(
    (t, r) => t + Number(r.samplesPerMonth || 0),
    0,
  );
  const foodCommitment = foodRecurring.reduce(
    (t, r) => t + Number(r.samplesPerMonth || 0),
    0,
  );
  const swabCommitment = swabRecurring.reduce(
    (t, r) => t + Number(r.samplesPerMonth || 0),
    0,
  );
  const recurringRecords = allActiveRecurring.filter((record) => {
    const category = getRecurringCategory(record);
    return type === "all"
      ? ["water", "food", "swab"].includes(category)
      : category === type;
  });
  const monthlyCommitment = recurringRecords.reduce(
    (t, r) => t + Number(r.samplesPerMonth || 0),
    0,
  );
  const recurringCompanyIds = new Set(recurringRecords.map((r) => r.companyId));
  const recurringLocationIds = new Set(
    recurringRecords
      .map((r) => r.locationId)
      .filter((id): id is string => Boolean(id)),
  );

  /* =======================================================

     ACTUAL SAMPLES

     ======================================================= */

  const categorySamples = samples.filter((sample) => {
    const category = getSampleCategory(sample);
    return type === "all"
      ? ["water", "food", "swab"].includes(category)
      : category === type;
  });

  /*

    Monthly actuals are based on collectionDate.



    This means:

    Planned = RecurringService.samplesPerMonth

    Actual = Sample.sampleCount collected this month

  */

  const now = new Date();

  const currentMonthSamples = categorySamples.filter((sample) =>
    isSameMonth(
      sample.collectionDate,

      now,
    ),
  );

  const collectedThisMonth = sumSamples(currentMonthSamples);

  const waterCollectedThisMonth = sumSamples(
  currentMonthSamples.filter(
    (sample) =>
      getSampleCategory(sample) === "water",
  ),
);

const foodCollectedThisMonth = sumSamples(
  currentMonthSamples.filter(
    (sample) =>
      getSampleCategory(sample) === "food",
  ),
);

const swabCollectedThisMonth = sumSamples(
  currentMonthSamples.filter(
    (sample) =>
      getSampleCategory(sample) === "swab",
  ),
);

  const remainingThisMonth = Math.max(
    monthlyCommitment - collectedThisMonth,

    0,
  );

  const completionPercentage =
    monthlyCommitment > 0
      ? Math.min(
          (collectedThisMonth / monthlyCommitment) * 100,

          100,
        )
      : 0;

  /* =======================================================

     LIFECYCLE METRICS — CURRENT MONTH

     ======================================================= */

  const collectedOnly = sumSamples(
    currentMonthSamples.filter(
      (sample) => normalize(sample.status) === "collected",
    ),
  );

  const inTransit = sumSamples(
    currentMonthSamples.filter((sample) => {
      const status = normalize(sample.status);

      return status === "dispatched" || status === "received at lab";
    }),
  );

  const inTesting = sumSamples(
    currentMonthSamples.filter(
      (sample) => normalize(sample.status) === "testing",
    ),
  );

  const completed = sumSamples(
    currentMonthSamples.filter((sample) => {
      const status = normalize(sample.status);

      return status === "completed" || status === "report delivered";
    }),
  );

  const reportsDelivered = sumSamples(
    currentMonthSamples.filter(
      (sample) => normalize(sample.reportStatus) === "delivered",
    ),
  );

  const reportsPending = sumSamples(
    currentMonthSamples.filter(
      (sample) => normalize(sample.reportStatus) !== "delivered",
    ),
  );

  /* =======================================================

     CLIENT PERFORMANCE

     ======================================================= */

  const companyIds = new Set<string>();

  recurringRecords.forEach((record) => companyIds.add(record.companyId));

  currentMonthSamples.forEach((sample) => companyIds.add(sample.companyId));

  const clientPerformance = Array.from(companyIds)

    .map((companyId) => {
      const company = companyMap.get(companyId);

      const plannedRecords = recurringRecords.filter(
        (record) => record.companyId === companyId,
      );

      const actualRecords = currentMonthSamples.filter(
        (sample) => sample.companyId === companyId,
      );

      const planned = plannedRecords.reduce(
        (total, record) => total + Number(record.samplesPerMonth || 0),

        0,
      );

      const collected = sumSamples(actualRecords);

      const remaining = Math.max(
        planned - collected,

        0,
      );

      const locationNames = plannedRecords

        .map((record) =>
          record.locationId ? locationMap.get(record.locationId)?.name : null,
        )

        .filter((value): value is string => Boolean(value));

      const uniqueLocations = Array.from(new Set(locationNames));

      const latestCollection =
        actualRecords

          .map((sample) => sample.collectionDate)

          .filter((value): value is string => Boolean(value))

          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ||
        null;

      return {
        companyId,

        companyName: company?.name || "Unknown Company",

        planned,

        collected,

        remaining,

        locations: uniqueLocations,

        latestCollection,
      };
    })

    .sort((a, b) => b.planned - a.planned);

  /* =======================================================

     PAGE UI

     ======================================================= */

  return (
    <main className={`sample-type-page type-${type}`}>
      {/* HEADER */}

      <header className="sample-type-header">
        <div>
          <Link
            href="/admin/recurring-services"

            className="sample-type-back"
          >
            <ArrowLeft size={14} />
            Recurring Samples
          </Link>

          <span className="sample-type-eyebrow">HYDERABAD OPERATIONS</span>

          <h1>{config.title}</h1>

          <p>{config.description}</p>
        </div>

        <Link
          href="/admin/samples/new"

          className="sample-type-add"
        >
          <TestTube2 size={16} />
          Add Sample
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* MAIN KPIs */}

      <section className="sample-type-kpis">
        <OperationMetric
          label="Monthly Commitment"

          value={monthlyCommitment}

          helper="Recurring target"

          icon={<CalendarDays size={21} />}

          tone="navy"
        />

        <OperationMetric
          label="Collected This Month"

          value={collectedThisMonth}

          helper={`${completionPercentage.toFixed(1)}% of commitment`}

          icon={<TestTube2 size={21} />}

          tone="cyan"
        />

        <OperationMetric
          label="Remaining"

          value={remainingThisMonth}

          helper="Still to be collected"

          icon={<Clock3 size={21} />}

          tone="orange"
        />

        <OperationMetric
          label="Active Clients"

          value={recurringCompanyIds.size}

          helper={`${recurringLocationIds.size} recurring locations`}

          icon={<Building2 size={21} />}

          tone="purple"
        />
      </section>

      {/* PROGRESS */}

      <section className="sample-type-progress-card">
        <div className="sample-type-progress-top">
          <div>
            <span>MONTHLY COLLECTION PROGRESS</span>

            <strong>
              {collectedThisMonth} / {monthlyCommitment}
            </strong>

            <small>{remainingThisMonth} samples remaining</small>
          </div>

          <div className="sample-type-percentage">
            {completionPercentage.toFixed(0)}%
          </div>
        </div>

        <div className="sample-type-progress">
          <span
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>
      </section>

      {type === "all" && (
        <section className="sample-type-section">
          <div className="sample-type-section-header">
            <div>
              <span>MONTHLY SAMPLE MIX</span>
              <h2>Recurring Workload Breakdown</h2>
              <p>
                Planned versus collected workload for Water, Food and Swab
                samples.
              </p>
            </div>
          </div>
          <div className="all-sample-breakdown">
            <SampleBreakdownCard
              title="Water"
              value={waterCommitment}
              collected={waterCollectedThisMonth}
              total={monthlyCommitment}
              href="/admin/recurring-services/water"
              tone="water"
            />
            <SampleBreakdownCard
              title="Food"
              value={foodCommitment}
              collected={foodCollectedThisMonth}
              total={monthlyCommitment}
              href="/admin/recurring-services/food"
              tone="food"
            />
            <SampleBreakdownCard
              title="Swabs"
              value={swabCommitment}
              collected={swabCollectedThisMonth}
              total={monthlyCommitment}
              href="/admin/recurring-services/swab"
              tone="swab"
            />
          </div>
        </section>
      )}

      {/* LIFECYCLE */}

      <section className="sample-type-section">
        <div className="sample-type-section-header">
          <div>
            <span>CURRENT MONTH</span>

            <h2>Sample Lifecycle</h2>

            <p>Collection → Laboratory → Testing → Report</p>
          </div>
        </div>

        <div className="sample-type-lifecycle">
          <LifecycleMetric
            label="Collected"

            value={collectedOnly}

            icon={<TestTube2 size={19} />}
          />

          <LifecycleMetric
            label="In Transit / Lab"

            value={inTransit}

            icon={<Send size={19} />}
          />

          <LifecycleMetric
            label="In Testing"

            value={inTesting}

            icon={<FlaskConical size={19} />}
          />

          <LifecycleMetric
            label="Completed"

            value={completed}

            icon={<PackageCheck size={19} />}
          />

          <LifecycleMetric
            label="Reports Pending"

            value={reportsPending}

            icon={<FileClock size={19} />}
          />

          <LifecycleMetric
            label="Reports Delivered"

            value={reportsDelivered}

            icon={<FileCheck2 size={19} />}
          />
        </div>
      </section>

      {/* CLIENT PERFORMANCE */}

      <section className="sample-type-section">
        <div className="sample-type-section-header">
          <div>
            <span>CLIENT PERFORMANCE</span>

            <h2>Monthly Commitment vs Collection</h2>

            <p>Client-wise planned and actual monthly sample workload.</p>
          </div>
        </div>

        <div className="sample-type-table-wrap">
          <table className="sample-type-table">
            <thead>
              <tr>
                <th>Client</th>

                <th>Recurring Locations</th>

                <th className="number">Planned</th>

                <th className="number">Collected</th>

                <th className="number">Remaining</th>

                <th>Last Collection</th>

                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {clientPerformance.map((client) => (
                <tr key={client.companyId}>
                  <td>
                    <Link
                      href={`/admin/companies/${client.companyId}`}

                      className="sample-type-company"
                    >
                      <Building2 size={14} />

                      {client.companyName}
                    </Link>
                  </td>

                  <td>
                    {client.locations.length > 0
                      ? client.locations.join(", ")
                      : "Client level"}
                  </td>

                  <td className="number">
                    <strong>{client.planned}</strong>
                  </td>

                  <td className="number collected-number">
                    <strong>{client.collected}</strong>
                  </td>

                  <td className="number remaining-number">
                    <strong>{client.remaining}</strong>
                  </td>

                  <td>{formatDate(client.latestCollection)}</td>

                  <td>
                    <Link
                      href={`/admin/companies/${client.companyId}`}

                      className="sample-type-view"
                    >
                      View
                      <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ACTUAL COLLECTION HISTORY */}

      <section className="sample-type-section">
        <div className="sample-type-section-header">
          <div>
            <span>COLLECTION HISTORY</span>

            <h2>{config.shortTitle} Sample Collections</h2>

            <p>Complete collection, testing, quotation and report details.</p>
          </div>

          <div className="sample-type-count">
            {sumSamples(categorySamples)} total recorded samples
          </div>
        </div>

        {categorySamples.length === 0 ? (
          <div className="sample-type-empty">
            <TestTube2 size={30} />

            <h3>No {config.shortTitle} samples recorded</h3>

            <p>Actual sample collection records will appear here.</p>
          </div>
        ) : (
          <div className="sample-type-collections">
            {categorySamples.map((sample) => {
              const company = companyMap.get(sample.companyId);

              const quotation = sample.quotationId
                ? quotationMap.get(sample.quotationId)
                : undefined;

              return (
                <article
                  key={sample.id}

                  className="sample-type-collection-card"
                >
                  <div className="sample-type-card-top">
                    <div className="sample-type-card-identity">
                      <div className="sample-type-card-icon">
                        <TestTube2 size={20} />
                      </div>

                      <div>
                        <div className="sample-type-card-badges">
                          <span className="sample-type-number">
                            {sample.sampleNumber}
                          </span>

                          <span
                            className={`sample-type-status ${statusSlug(
                              sample.status,
                            )}`}
                          >
                            {sample.status}
                          </span>

                          <span
                            className={`sample-type-report ${statusSlug(
                              sample.reportStatus,
                            )}`}
                          >
                            Report: {sample.reportStatus}
                          </span>
                        </div>

                        <h3>{sample.sampleType}</h3>

                        <Link href={`/admin/companies/${sample.companyId}`}>
                          <Building2 size={13} />

                          {company?.name || "Unknown Company"}
                        </Link>
                      </div>
                    </div>

                    <div className="sample-type-quantity">
                      <span>Quantity</span>

                      <strong>{sample.sampleCount}</strong>

                      <small>
                        {sample.sampleCount === 1 ? "Sample" : "Samples"}
                      </small>
                    </div>
                  </div>

                  <div className="sample-type-info-grid">
                    <Detail
                      label="Collection Date"

                      value={formatDate(sample.collectionDate)}

                      icon={<CalendarDays size={14} />}
                    />

                    <Detail
                      label="Collected By"

                      value={sample.collectedBy || "—"}

                      icon={<UserRound size={14} />}
                    />

                    <Detail
                      label="Testing Location"

                      value={sample.testingLocation || "—"}

                      icon={<MapPin size={14} />}
                    />

                    <Detail
                      label="Expected Completion"

                      value={formatDate(sample.expectedCompletionDate)}

                      icon={<Clock3 size={14} />}
                    />

                    <Detail
                      label="Report Status"

                      value={sample.reportStatus || "—"}

                      icon={<FileText size={14} />}
                    />

                    <Detail
                      label="Report Delivered"

                      value={formatDate(sample.reportDeliveredDate)}

                      icon={<CheckCircle2 size={14} />}
                    />
                  </div>

                  {(quotation || sample.notes) && (
                    <div className="sample-type-card-bottom">
                      {quotation && (
                        <div className="sample-type-quotation">
                          <ReceiptText size={16} />

                          <div>
                            <span>Linked Quotation</span>

                            <strong>{quotation.quotationNumber}</strong>

                            <small>
                              {quotation.service} · {quotation.status}
                            </small>
                          </div>

                          <Link href={`/admin/quotations/${quotation.id}`}>
                            View
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      )}

                      {sample.notes && (
                        <div className="sample-type-notes">
                          <FileText size={15} />

                          <div>
                            <span>Notes</span>

                            <p>{sample.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/admin/samples/${sample.id}`}

                    className="sample-type-open"
                  >
                    View Complete Sample
                    <ArrowRight size={13} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================

   COMPONENTS

   ========================================================= */

function OperationMetric({
  label,

  value,

  helper,

  icon,

  tone,
}: {
  label: string;

  value: number;

  helper: string;

  icon: React.ReactNode;

  tone: "navy" | "cyan" | "orange" | "purple";
}) {
  return (
    <article className={`sample-type-kpi ${tone}`}>
      <div className="sample-type-kpi-icon">{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>

        <small>{helper}</small>
      </div>
    </article>
  );
}

function LifecycleMetric({
  label,

  value,

  icon,
}: {
  label: string;

  value: number;

  icon: React.ReactNode;
}) {
  return (
    <article className="sample-type-lifecycle-card">
      <div>{icon}</div>

      <span>{label}</span>

      <strong>{value}</strong>
    </article>
  );
}

function Detail({
  label,

  value,

  icon,
}: {
  label: string;

  value: string;

  icon: React.ReactNode;
}) {
  return (
    <div className="sample-type-detail">
      <div>{icon}</div>

      <span>
        {label}

        <strong>{value}</strong>
      </span>
    </div>
  );
}
function SampleBreakdownCard({
  title,
  value,
  collected,
  total,
  href,
  tone,
}: {
  title: string;
  value: number;
  collected: number;
  total: number;
  href: string;
  tone: "water" | "food" | "swab";
}) {
  const workloadPercentage = total > 0 ? (value / total) * 100 : 0;
  const collectionPercentage =
    value > 0 ? Math.min((collected / value) * 100, 100) : 0;
  return (
    <Link href={href} className={`all-sample-card ${tone}`}>
      <div className="all-sample-card-top">
        <span>{title}</span>
        <ArrowRight size={15} />
      </div>
      <strong>{value}</strong>
      <small>{workloadPercentage.toFixed(1)}% of recurring workload</small>
      <div className="all-sample-mini-stats">
        <div>
          <span>Collected</span>
          <b>{collected}</b>
        </div>
        <div>
          <span>Remaining</span>
          <b>{Math.max(value - collected, 0)}</b>
        </div>
      </div>
      <div className="all-sample-progress">
        <span style={{ width: `${collectionPercentage}%` }} />
      </div>
      <small className="all-sample-completion">
        {collectionPercentage.toFixed(0)}% collected this month
      </small>
    </Link>
  );
}
