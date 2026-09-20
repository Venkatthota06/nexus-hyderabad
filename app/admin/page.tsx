import Link from "next/link";
import DashboardSearch from "./DashboardSearch";
import NotificationBell from "./NotificationBell";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  FlaskConical,
  MapPin,
  Search,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import "./admin-dashboard.css";

export const dynamic = "force-dynamic";

type Company = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  createdAt: string;
};

type Location = {
  id: string;
  companyId: string;
  name: string;
  status: string;
};

type RecurringService = {
  id: string;
  companyId: string;
  locationId: string | null;
  service: string;
  sampleType: string;
  samplesPerMonth: number;
  status: string;
};

type WorkOrder = {
  id: string;
  companyId: string;
  workOrderNumber: string;
  service: string;
  totalAmount: number;
  status: string;
  confirmedDate: string;
};

type Payment = {
  id: string;
  companyId: string;
  quotationId: string | null;
  workOrderId: string | null;
  amount: number;
  paymentDate: string;
  status: string;
};

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  totalAmount: number;
  status: string;
  nextFollowUp: string | null;
  createdAt: string;
};

type ActivityRow = {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string | null;
  activityDate: string;
  nextAction: string | null;
  nextFollowUp: string | null;
};

type Lead = {
  id: string;
  companyId: string | null;
  name: string;
  company: string;
  service: string;
  status: string;
  nextFollowUp: string | null;
  createdAt: string;
};

type Sample = {
  id: string;
  companyId: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  status: string;
  createdAt: string;
};

type PlanItem = {
  id: string;
  companyId: string | null;
  title: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
};

async function safeAll<T>(fn: () => Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Dashboard ${label}:`, error);
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isActiveStatus(status: string) {
  return !["inactive", "cancelled", "canceled", "closed", "rejected", "void"].includes(
    status.toLowerCase(),
  );
}

function isOpenQuotation(status: string) {
  return ![
    "accepted",
    "approved",
    "won",
    "closed",
    "rejected",
    "cancelled",
    "canceled",
    "expired",
  ].includes(status.toLowerCase());
}

function isValidWorkOrder(status: string) {
  return !["cancelled", "canceled", "rejected", "void"].includes(
    status.toLowerCase(),
  );
}

function isReceivedPayment(status: string) {
  return ["received", "paid", "collected", "completed"].includes(
    status.toLowerCase(),
  );
}

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (["accepted", "completed", "delivered", "received", "paid", "collected"].some((x) => s.includes(x))) return "green";
  if (["sent", "new", "ready"].some((x) => s.includes(x))) return "blue";
  if (["follow", "review", "meeting"].some((x) => s.includes(x))) return "purple";
  if (["pending", "discussion", "identified", "contacted", "visited"].some((x) => s.includes(x))) return "amber";
  return "slate";
}

function Donut({
  segments,
  centerTop,
  centerBottom,
}: {
  segments: { value: number; color: string }[];
  centerTop: string;
  centerBottom: string;
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = segments
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = total ? (cursor / total) * 360 : 0;
      cursor += item.value;
      const end = total ? (cursor / total) * 360 : 0;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div
      className="v3-donut"
      style={{
        background: total
          ? `conic-gradient(${stops})`
          : "conic-gradient(#e8eef5 0deg 360deg)",
      }}
    >
      <div className="v3-donut-hole">
        <strong>{centerTop}</strong>
        <span>{centerBottom}</span>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  title,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  note: React.ReactNode;
  tone: string;
}) {
  return (
    <article className={`v3-kpi v3-kpi-${tone}`}>
      <div className="v3-kpi-icon">{icon}</div>
      <div className="v3-kpi-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const [
    companies,
    locations,
    recurringServices,
    workOrders,
    payments,
    quotations,
    activities,
    leads,
    samples,
    planItems,
  ] = await Promise.all([
    safeAll<Company>(
      async () => (await db.orm.public.Company.orderBy((row) => row.createdAt.desc()).all()) as Company[],
      "companies",
    ),
    safeAll<Location>(async () => (await db.orm.public.Location.all()) as Location[], "locations"),
    safeAll<RecurringService>(
      async () => (await db.orm.public.RecurringService.all()) as RecurringService[],
      "recurring",
    ),
    safeAll<WorkOrder>(
      async () => (await db.orm.public.WorkOrder.orderBy((row) => row.confirmedDate.desc()).all()) as WorkOrder[],
      "work orders",
    ),
    safeAll<Payment>(
      async () => (await db.orm.public.Payment.orderBy((row) => row.paymentDate.desc()).all()) as Payment[],
      "payments",
    ),
    safeAll<Quotation>(
      async () => (await db.orm.public.Quotation.orderBy((row) => row.createdAt.desc()).all()) as Quotation[],
      "quotations",
    ),
    safeAll<ActivityRow>(
      async () => (await db.orm.public.Activity.orderBy((row) => row.activityDate.desc()).all()) as ActivityRow[],
      "activities",
    ),
    safeAll<Lead>(
      async () => (await db.orm.public.Lead.orderBy((row) => row.createdAt.desc()).all()) as Lead[],
      "leads",
    ),
    safeAll<Sample>(
      async () => (await db.orm.public.Sample.orderBy((row) => row.createdAt.desc()).all()) as Sample[],
      "samples",
    ),
    safeAll<PlanItem>(
      async () => (await db.orm.public.PlanItem.orderBy((row) => row.createdAt.desc()).all()) as PlanItem[],
      "plan",
    ),
  ]);

  const companyMap = new Map(companies.map((company) => [company.id, company.name]));

  const activeRecurring = recurringServices.filter(
    (service) => service.status.toLowerCase() === "active",
  );

  const recurringLocationIds = new Set(
    activeRecurring
      .map((service) => service.locationId)
      .filter((id): id is string => Boolean(id)),
  );

  const recurringLocations = locations.filter(
    (location) =>
      recurringLocationIds.has(location.id) &&
      location.status.toLowerCase() === "active",
  );

  const recurringCompanyIds = new Set(activeRecurring.map((service) => service.companyId));

  const recurringSamples = activeRecurring.reduce(
    (total, service) => total + Number(service.samplesPerMonth || 0),
    0,
  );

  const sampleMix = activeRecurring.reduce(
    (result, service) => {
      const type = service.sampleType.toLowerCase();
      const count = Number(service.samplesPerMonth || 0);
      if (type.includes("water") || type.includes("ro")) result.water += count;
      else if (type.includes("food") || type.includes("meal")) result.food += count;
      else if (type.includes("swab")) result.swab += count;
      else result.other += count;
      return result;
    },
    { water: 0, food: 0, swab: 0, other: 0 },
  );

  const validOrders = workOrders.filter((order) => isValidWorkOrder(order.status));
  const businessValue = validOrders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0,
  );

  const receivedPayments = payments.filter((payment) =>
    isReceivedPayment(payment.status),
  );

  const collectedAmount = receivedPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const pendingAmount = validOrders.reduce((total, order) => {
    const orderPayments = receivedPayments
      .filter((payment) => payment.workOrderId === order.id)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return total + Math.max(Number(order.totalAmount || 0) - orderPayments, 0);
  }, 0);

  const orderCollected = validOrders.reduce((total, order) => {
    const linked = receivedPayments
      .filter((payment) => payment.workOrderId === order.id)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return total + Math.min(linked, Number(order.totalAmount || 0));
  }, 0);

  const collectionRate = businessValue
    ? (orderCollected / businessValue) * 100
    : 0;

  const openQuotations = quotations.filter((quotation) =>
    isOpenQuotation(quotation.status),
  );

  const activeLeads = leads.filter((lead) => isActiveStatus(lead.status));

  const followups = [
    ...leads
      .filter((lead) => lead.nextFollowUp)
      .map((lead) => ({
        id: `lead-${lead.id}`,
        title: lead.company || lead.name || "Lead",
        purpose: lead.service || "Lead follow-up",
        date: lead.nextFollowUp!,
        status: lead.status,
        href: `/admin/leads/${lead.id}`,
      })),
    ...activities
      .filter((activity) => activity.nextFollowUp)
      .map((activity) => ({
        id: `activity-${activity.id}`,
        title: companyMap.get(activity.companyId) || "Client",
        purpose: activity.nextAction || activity.title,
        date: activity.nextFollowUp!,
        status: "Follow-up",
        href: `/admin/companies/${activity.companyId}`,
      })),
    ...quotations
      .filter((quotation) => quotation.nextFollowUp && isOpenQuotation(quotation.status))
      .map((quotation) => ({
        id: `quotation-${quotation.id}`,
        title: companyMap.get(quotation.companyId) || "Client",
        purpose: quotation.service,
        date: quotation.nextFollowUp!,
        status: quotation.status,
        href: `/admin/quotations/${quotation.id}`,
      })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const recentClients = companies.slice(0, 5);
  const recentActivities = activities.slice(0, 5);
  const activeQuotes = openQuotations.slice(0, 5);
  const upcomingFollowups = followups.slice(0, 5);
  const activePlan = planItems
    .filter((item) => item.status.toLowerCase() !== "completed")
    .slice(0, 6);

  const recurringLocationCountByCompany = new Map<string, number>();
  recurringLocations.forEach((location) => {
    recurringLocationCountByCompany.set(
      location.companyId,
      (recurringLocationCountByCompany.get(location.companyId) || 0) + 1,
    );
  });

  const recurringClientGroups = [...recurringCompanyIds].map((companyId) => ({
    companyId,
    name: companyMap.get(companyId) || "Client",
    locations: recurringLocationCountByCompany.get(companyId) || 0,
  }));

  const weWorkLocations = recurringClientGroups
    .filter((item) => item.name.toLowerCase().includes("wework"))
    .reduce((sum, item) => sum + item.locations, 0);

  const corporateLocations = Math.max(recurringLocations.length - weWorkLocations, 0);

  const monthSampleTotal =
    sampleMix.water + sampleMix.food + sampleMix.swab + sampleMix.other;

  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(today);

  return (
    <div className="v3-dashboard">
      <header className="v3-topbar">
        <DashboardSearch />
        <div className="v3-top-actions">
          <NotificationBell />
          <div className="v3-profile">
            <div className="v3-avatar">V</div>
            <div>
              <strong>Venkat</strong>
              <span>Hyderabad Operations</span>
            </div>
          </div>
        </div>
      </header>

      <section className="v3-hero">
        <div className="v3-hero-copy">
          <h1>Welcome back, Venkat <span>👋</span></h1>
          <h2>Hyderabad Operations Dashboard</h2>
          <p>Recurring operations, sales pipeline, collections, client activity and growth overview.</p>
        </div>
        <div className="v3-hero-art" aria-hidden="true">
          <div className="v3-city-line" />
          <span>Serving a<br />Healthier Hyderabad</span>
        </div>
        <div className="v3-date-card">
          <CalendarDays size={23} />
          <div>
            <strong>{todayLabel}</strong>
            <span>Hyderabad Operations</span>
          </div>
        </div>
      </section>

      <section className="v3-kpi-grid">
        <KpiCard
          icon={<Building2 size={27} />}
          title="Existing Customer Locations"
          value={recurringLocations.length}
          note="Active recurring locations"
          tone="blue"
        />
        <KpiCard
          icon={<FlaskConical size={27} />}
          title="Recurring Samples / Month"
          value={recurringSamples}
          note={`${sampleMix.water} Water · ${sampleMix.food} Food · ${sampleMix.swab} Swabs`}
          tone="green"
        />
        <KpiCard
          icon={<FileText size={27} />}
          title="Orders Closed"
          value={validOrders.length}
          note={`${money(businessValue)} business value`}
          tone="rose"
        />
        <KpiCard
          icon={<TrendingUp size={27} />}
          title="Amount Collected"
          value={money(collectedAmount)}
          note={`${collectionRate.toFixed(1)}% against confirmed orders`}
          tone="mint"
        />
        <KpiCard
          icon={<WalletCards size={27} />}
          title="Pending Amount"
          value={money(pendingAmount)}
          note="Against confirmed orders"
          tone="amber"
        />
        <KpiCard
          icon={<Target size={27} />}
          title="Active Opportunities"
          value={openQuotations.length}
          note={`${activeLeads.length} active leads`}
          tone="purple"
        />
      </section>

      <section className="v3-analytics-grid">
        <article className="v3-card v3-chart-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <CalendarDays size={20} />
              <div>
                <h3>Monthly Sample Mix</h3>
                <span>Active recurring samples / month</span>
              </div>
            </div>
            <span className="v3-filter">This Month⌄</span>
          </div>
          <div className="v3-chart-body">
            <Donut
              centerTop={String(monthSampleTotal)}
              centerBottom="Samples"
              segments={[
                { value: sampleMix.water, color: "#179cf0" },
                { value: sampleMix.food, color: "#58b947" },
                { value: sampleMix.swab, color: "#9a50e8" },
                { value: sampleMix.other, color: "#cbd5e1" },
              ]}
            />
            <div className="v3-legend">
              {[
                ["Water", sampleMix.water, "#179cf0"],
                ["Food", sampleMix.food, "#58b947"],
                ["Swabs", sampleMix.swab, "#9a50e8"],
              ].map(([label, value, color]) => (
                <div className="v3-legend-row" key={String(label)}>
                  <i style={{ background: String(color) }} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <em>
                    {monthSampleTotal
                      ? `(${((Number(value) / monthSampleTotal) * 100).toFixed(1)}%)`
                      : "(0%)"}
                  </em>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="v3-card v3-chart-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <Users size={20} />
              <div>
                <h3>Client Type Distribution</h3>
                <span>Across {recurringLocations.length} active locations</span>
              </div>
            </div>
            <span className="v3-filter">All Locations⌄</span>
          </div>
          <div className="v3-chart-body">
            <Donut
              centerTop={String(recurringLocations.length)}
              centerBottom="Locations"
              segments={[
                { value: weWorkLocations, color: "#12a7d9" },
                { value: corporateLocations, color: "#58b947" },
              ]}
            />
            <div className="v3-legend">
              <div className="v3-legend-row">
                <i style={{ background: "#12a7d9" }} />
                <span>WeWork</span>
                <strong>{weWorkLocations}</strong>
                <em>
                  {recurringLocations.length
                    ? `(${((weWorkLocations / recurringLocations.length) * 100).toFixed(1)}%)`
                    : "(0%)"}
                </em>
              </div>
              <div className="v3-legend-row">
                <i style={{ background: "#58b947" }} />
                <span>Corporate</span>
                <strong>{corporateLocations}</strong>
                <em>
                  {recurringLocations.length
                    ? `(${((corporateLocations / recurringLocations.length) * 100).toFixed(1)}%)`
                    : "(0%)"}
                </em>
              </div>
            </div>
          </div>
        </article>

        <article className="v3-card v3-chart-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <CircleDollarSign size={20} />
              <div>
                <h3>Collection Status</h3>
                <span>Total confirmed order value: {money(businessValue)}</span>
              </div>
            </div>
            <span className="v3-filter">This Month⌄</span>
          </div>
          <div className="v3-chart-body">
            <Donut
              centerTop={money(businessValue)}
              centerBottom="Order Value"
              segments={[
                { value: orderCollected, color: "#25ad69" },
                { value: pendingAmount, color: "#f7b928" },
              ]}
            />
            <div className="v3-legend">
              <div className="v3-legend-row">
                <i style={{ background: "#25ad69" }} />
                <span>Collected</span>
                <strong>{money(orderCollected)}</strong>
              </div>
              <div className="v3-legend-row">
                <i style={{ background: "#f7b928" }} />
                <span>Pending</span>
                <strong>{money(pendingAmount)}</strong>
              </div>
              <small className="v3-legend-note">
                Total received across all recorded payments: {money(collectedAmount)}
              </small>
            </div>
          </div>
        </article>
      </section>

      <section className="v3-mid-grid">
        <article className="v3-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <Users size={20} />
              <h3>Recent Clients &amp; Sample Activity</h3>
            </div>
            <Link href="/admin/companies">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead>
                <tr><th>#</th><th>Client Name</th><th>Type</th><th>Samples</th><th>Recent Activity</th></tr>
              </thead>
              <tbody>
                {recentClients.length ? recentClients.map((company, index) => {
                  const count = samples
                    .filter((sample) => sample.companyId === company.id)
                    .reduce((sum, sample) => sum + Number(sample.sampleCount || 0), 0);
                  const lastActivity = activities.find((activity) => activity.companyId === company.id);
                  return (
                    <tr key={company.id}>
                      <td>{index + 1}</td>
                      <td><Link href={`/admin/companies/${company.id}`}>{company.name}</Link></td>
                      <td>{company.industry || "—"}</td>
                      <td>{count || "—"}</td>
                      <td>{lastActivity?.title || "No recent activity"}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5} className="v3-empty">No client records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="v3-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <FileText size={20} />
              <h3>Active Quotations &amp; Opportunities</h3>
            </div>
            <Link href="/admin/quotations">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead>
                <tr><th>Client Name</th><th>Service</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activeQuotes.length ? activeQuotes.map((quotation) => (
                  <tr key={quotation.id}>
                    <td><Link href={`/admin/quotations/${quotation.id}`}>{companyMap.get(quotation.companyId) || "Client"}</Link></td>
                    <td>{quotation.service}</td>
                    <td>{money(quotation.totalAmount)}</td>
                    <td><span className={`v3-status ${statusClass(quotation.status)}`}>{quotation.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="v3-empty">No active quotations.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="v3-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <Activity size={20} />
              <h3>Recent Activities</h3>
            </div>
            <Link href="/admin/follow-ups">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="v3-activity-list">
            {recentActivities.length ? recentActivities.map((activity) => (
              <Link href={`/admin/companies/${activity.companyId}`} className="v3-activity-row" key={activity.id}>
                <i />
                <div>
                  <strong>{activity.title}</strong>
                  <span>{companyMap.get(activity.companyId) || activity.type}</span>
                </div>
                <time>{formatTime(activity.activityDate)}</time>
              </Link>
            )) : <div className="v3-empty-block">No recent activities.</div>}
          </div>
        </article>
      </section>

      <section className="v3-bottom-grid">
        <article className="v3-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <CalendarDays size={20} />
              <h3>Upcoming Follow-ups</h3>
            </div>
            <Link href="/admin/follow-ups">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead><tr><th>Date</th><th>Client</th><th>Purpose</th><th>Status</th></tr></thead>
              <tbody>
                {upcomingFollowups.length ? upcomingFollowups.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td><Link href={item.href}>{item.title}</Link></td>
                    <td>{item.purpose}</td>
                    <td><span className={`v3-status ${statusClass(item.status)}`}>{item.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="v3-empty">No follow-ups scheduled.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="v3-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <TrendingUp size={20} />
              <h3>This Month Collection Summary</h3>
            </div>
            <Link href="/admin/payments">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead><tr><th>Client</th><th>Collected</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {receivedPayments.slice(0, 5).length ? receivedPayments.slice(0, 5).map((payment) => (
                  <tr key={payment.id}>
                    <td>{companyMap.get(payment.companyId) || "Client"}</td>
                    <td className="v3-money-green">{money(payment.amount)}</td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td><span className={`v3-status ${statusClass(payment.status)}`}>{payment.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="v3-empty">No received payments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="v3-card">
          <div className="v3-card-head">
            <div className="v3-title">
              <Target size={20} />
              <h3>Next 30 Days Plan</h3>
            </div>
            <Link href="/admin/monthly-plan">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="v3-plan-list">
            {activePlan.length ? activePlan.map((item) => (
              <Link href="/admin/monthly-plan" className="v3-plan-row" key={item.id}>
                <span className="v3-checkbox" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : `${item.category} · ${item.priority}`}</span>
                </div>
              </Link>
            )) : <div className="v3-empty-block">No upcoming plan items.</div>}
          </div>
        </article>
      </section>

      <footer className="v3-footer">
        <span>© 2026 Nexus Test Labs Pvt. Ltd. &nbsp;|&nbsp; Hyderabad Operations</span>
        <strong>Testing for a Healthier Tomorrow</strong>
      </footer>
    </div>
  );
}
