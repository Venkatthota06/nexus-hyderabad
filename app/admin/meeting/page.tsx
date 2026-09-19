import Link from "next/link";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  Target,
  Users,
  WalletCards,
  Droplets,
  Bell,
  ArrowRight,
  Circle,
} from "lucide-react";
import "./dashboard.css";

const kpis = [
  {
    label: "Existing Customer Locations",
    value: "13",
    helper: "Active recurring locations",
    icon: Building2,
    tone: "blue",
  },
  {
    label: "Recurring Samples / Month",
    value: "102",
    helper: "58 Water · 35 Food · 9 Swabs",
    icon: FlaskConical,
    tone: "green",
  },
  {
    label: "Orders Closed",
    value: "4",
    subvalue: "₹73,573",
    helper: "New business value",
    icon: ClipboardCheck,
    tone: "rose",
  },
  {
    label: "Amount Collected",
    value: "₹42,185",
    helper: "57.3% collection rate",
    icon: CircleDollarSign,
    tone: "teal",
  },
  {
    label: "Pending Amount",
    value: "₹31,388",
    helper: "42.7% currently pending",
    icon: WalletCards,
    tone: "amber",
  },
  {
    label: "Active Opportunities",
    value: "3",
    helper: "Quotations / follow-ups",
    icon: Target,
    tone: "violet",
  },
];

const opportunities = [
  {
    client: "Amor Hospitals",
    service: "Water Analysis & Air Monitoring",
    amount: "—",
    status: "Expected",
    next: "Confirm scope / order",
  },
  {
    client: "WeWork Phoenix H10 Tower 2",
    service: "Indoor Air Quality Monitoring",
    amount: "₹16,992",
    status: "Open",
    next: "Approval / work order",
  },
  {
    client: "Omni Hospitals",
    service: "Water Analysis & Air Monitoring",
    amount: "—",
    status: "Expected",
    next: "Confirm requirement",
  },
];

const closedOrders = [
  { client: "SEI Hyderabad - Phoenix Equinox", value: "₹31,388", status: "Pending" },
  { client: "Sri Praneetha Bakers", value: "₹5,605", status: "Collected" },
  { client: "Aarudhra Food Court", value: "₹8,496", status: "Collected" },
  { client: "Hasini Enterprises", value: "₹28,084", status: "Collected" },
];

const activities = [
  "Follow-up call with Omni Hospitals",
  "Follow-up call with Amor Hospitals",
  "LinkedIn prospect research completed",
  "Client and quotation records updated",
  "Hyderabad operations dashboard updated",
];

const plan = [
  "Convert Amor & Omni opportunities",
  "Close WeWork H10 Tower 2 IAQ follow-up",
  "Follow up ₹31,388 pending collection",
  "Increase self-generated corporate outreach",
  "Protect 102 recurring samples / month",
  "Strengthen digital marketing pipeline",
];

function StatusPill({ children }: { children: React.ReactNode }) {
  const txt = String(children).toLowerCase();
  let cls = "pill";
  if (txt.includes("collected")) cls += " pill-green";
  else if (txt.includes("pending") || txt.includes("expected")) cls += " pill-amber";
  else if (txt.includes("open")) cls += " pill-violet";
  else cls += " pill-blue";
  return <span className={cls}>{children}</span>;
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-title-wrap">
        <span className="section-icon"><Icon size={20} /></span>
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {action ? (
        <button className="text-action" type="button">
          {action} <ArrowRight size={14} />
        </button>
      ) : null}
    </div>
  );
}

export default function HyderabadOperationsDashboard() {
  return (
    <main className="nx-shell">
      <aside className="nx-sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Droplets size={23} />
          </div>
          <div>
            <strong>NEXUS TEST LABS</strong>
            <span>Hyderabad Operations</span>
          </div>
        </div>

        <nav className="side-nav">
          <Link className="nav-item active" href="/admin">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link className="nav-item" href="/admin">
            <Users size={18} /> Clients
          </Link>
          <Link className="nav-item" href="/admin">
            <Target size={18} /> Lead Management
          </Link>
          <Link className="nav-item" href="/admin">
            <FileText size={18} /> Quotations
          </Link>
          <Link className="nav-item" href="/admin">
            <FlaskConical size={18} /> Sample Collection
          </Link>
          <Link className="nav-item" href="/admin">
            <ClipboardCheck size={18} /> Reports
          </Link>
          <Link className="nav-item" href="/admin">
            <WalletCards size={18} /> Payments
          </Link>
          <Link className="nav-item" href="/admin">
            <Activity size={18} /> Follow-ups
          </Link>
          <Link className="nav-item" href="/admin">
            <CalendarDays size={18} /> Monthly Plan
          </Link>
          <Link className="nav-item" href="/admin">
            <Megaphone size={18} /> Digital Marketing
          </Link>
          <Link className="nav-item" href="/admin">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="accreditation">
            <div className="badge-row">
              <span>NABL</span><span>ISO</span><span>IAF</span>
            </div>
            <strong>Accredited Testing</strong>
            <p>Trusted Results</p>
          </div>
          <div className="promise">
            <span className="leaf">◆</span>
            <p>Clean Water<br />Clean Air<br />Safer Food<br /><strong>Healthier Tomorrow</strong></p>
          </div>
        </div>
      </aside>

      <section className="nx-content">
        <header className="topbar">
          <div className="searchbox">
            <Search size={17} />
            <span>Search clients, quotations, reports...</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" type="button" aria-label="Notifications">
              <Bell size={19} />
              <span className="notify-dot" />
            </button>
            <div className="profile">
              <span className="avatar">V</span>
              <div>
                <strong>Venkat</strong>
                <span>Hyderabad Operations</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">NEXUS TEST LABS · HYDERABAD</p>
            <h1>Welcome back, Venkat <span>👋</span></h1>
            <h3>Hyderabad Operations Dashboard</h3>
            <p className="hero-copy">
              Recurring operations, sales pipeline, collections, client activity and growth overview.
            </p>
          </div>
          <div className="hero-date">
            <CalendarDays size={22} />
            <div>
              <strong>September 2026</strong>
              <span>Business performance overview</span>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          {kpis.map(({ label, value, helper, icon: Icon, tone, subvalue }) => (
            <article className={`kpi-card tone-${tone}`} key={label}>
              <span className="kpi-icon"><Icon size={24} /></span>
              <div className="kpi-body">
                <p>{label}</p>
                <strong>{value}</strong>
                {subvalue ? <b>{subvalue}</b> : null}
                <span>{helper}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="chart-grid">
          <article className="panel">
            <SectionTitle
              icon={CalendarDays}
              title="Monthly Sample Mix"
              subtitle="Recurring samples handled each month"
            />
            <div className="chart-body">
              <div className="donut sample-donut">
                <div><strong>102</strong><span>Samples / Month</span></div>
              </div>
              <div className="legend">
                <div><i className="dot blue" /><span>Water</span><strong>58</strong><em>56.9%</em></div>
                <div><i className="dot green" /><span>Food</span><strong>35</strong><em>34.3%</em></div>
                <div><i className="dot violet" /><span>Swabs</span><strong>9</strong><em>8.8%</em></div>
              </div>
            </div>
          </article>

          <article className="panel">
            <SectionTitle
              icon={Users}
              title="Client Type Distribution"
              subtitle="Across 13 recurring locations"
            />
            <div className="chart-body">
              <div className="donut client-donut">
                <div><strong>13</strong><span>Locations</span></div>
              </div>
              <div className="legend">
                <div><i className="dot blue" /><span>WeWork</span><strong>7</strong><em>53.8%</em></div>
                <div><i className="dot green" /><span>Corporate</span><strong>6</strong><em>46.2%</em></div>
              </div>
            </div>
          </article>

          <article className="panel">
            <SectionTitle
              icon={CircleDollarSign}
              title="Collection Status"
              subtitle="Total closed business value: ₹73,573"
            />
            <div className="chart-body">
              <div className="donut collection-donut">
                <div><strong>₹73,573</strong><span>Total Value</span></div>
              </div>
              <div className="legend">
                <div><i className="dot green" /><span>Collected</span><strong>₹42,185</strong><em>57.3%</em></div>
                <div><i className="dot amber" /><span>Pending</span><strong>₹31,388</strong><em>42.7%</em></div>
              </div>
            </div>
          </article>
        </section>

        <section className="data-grid top-data">
          <article className="panel data-panel">
            <SectionTitle
              icon={Users}
              title="Recurring Business Snapshot"
              action="View all"
            />
            <div className="snapshot-list">
              <div>
                <span>WeWork recurring locations</span>
                <strong>7</strong>
                <em>30 samples / month</em>
              </div>
              <div>
                <span>Corporate recurring locations</span>
                <strong>6</strong>
                <em>72 samples / month</em>
              </div>
              <div>
                <span>Total recurring baseline</span>
                <strong>13</strong>
                <em>102 samples / month</em>
              </div>
            </div>
          </article>

          <article className="panel data-panel">
            <SectionTitle
              icon={FileText}
              title="Active Quotations & Opportunities"
              action="View all"
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Next Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((row) => (
                    <tr key={row.client}>
                      <td>{row.client}</td>
                      <td>{row.service}</td>
                      <td>{row.amount}</td>
                      <td><StatusPill>{row.status}</StatusPill></td>
                      <td>{row.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel activity-panel">
            <SectionTitle
              icon={Activity}
              title="Recent Activities"
              action="View all"
            />
            <ul className="activity-list">
              {activities.map((item, i) => (
                <li key={item}>
                  <Circle size={9} className={i < 2 ? "status-green" : "status-blue"} fill="currentColor" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="data-grid bottom-data">
          <article className="panel data-panel">
            <SectionTitle icon={CalendarDays} title="Closed Business" action="View all" />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Order Value</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {closedOrders.map((row) => (
                    <tr key={row.client}>
                      <td>{row.client}</td>
                      <td>{row.value}</td>
                      <td><StatusPill>{row.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel collection-summary">
            <SectionTitle icon={BarChart3} title="This Month Business Summary" />
            <div className="summary-stats">
              <div><span>Closed Orders</span><strong>4</strong></div>
              <div><span>Testing Samples</span><strong>22</strong></div>
              <div><span>Business Value</span><strong>₹73,573</strong></div>
              <div><span>Collected</span><strong>₹42,185</strong></div>
            </div>
            <div className="progress-block">
              <div><span>Collection progress</span><strong>57.3%</strong></div>
              <div className="progress-track"><span style={{ width: "57.3%" }} /></div>
            </div>
          </article>

          <article className="panel plan-panel">
            <SectionTitle icon={Target} title="Next 30 Days Plan" />
            <ul>
              {plan.map((item) => (
                <li key={item}>
                  <span className="check-box" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <footer className="dashboard-footer">
          <span>© 2026 Nexus Test Labs Pvt. Ltd. · Hyderabad Operations</span>
          <strong>Testing for a Healthier Tomorrow</strong>
        </footer>
      </section>
    </main>
  );
}
