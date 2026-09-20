import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Mail,
  Phone,
  Search,
  Target,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  name: string;
  company: string;
  companyId: string | null;
  phone: string;
  email: string;
  service: string;
  requirement: string;
  source: string;
  status: string;
  isRead: boolean;
  notes: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

const CLOSED_STATUSES = new Set(["Won", "Lost"]);

const STATUS_OPTIONS = [
  "All",
  "New Lead",
  "Contacted",
  "Visited",
  "Meeting Scheduled",
  "Requirement Identified",
  "Quotation Sent",
  "Follow-up",
  "Won",
  "Lost",
];

async function getLeads(): Promise<Lead[]> {
  try {
    return (await db.orm.public.Lead
      .orderBy((lead) => lead.createdAt.desc())
      .all()) as Lead[];
  } catch (error) {
    console.error("Admin leads getLeads error:", error);
    return [];
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusClass(status: string) {
  switch (status) {
    case "Won":
      return "won";
    case "Lost":
      return "lost";
    case "Quotation Sent":
      return "quotation";
    case "Contacted":
      return "contacted";
    case "Visited":
      return "contacted";
    case "Follow-up":
      return "followup";
    case "Meeting Scheduled":
      return "meeting";
    case "Requirement Identified":
      return "requirement";
    default:
      return "new";
  }
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getFollowUpState(lead: Lead) {
  if (CLOSED_STATUSES.has(lead.status) || !lead.nextFollowUp) {
    return "none";
  }

  const followUp = new Date(lead.nextFollowUp);
  const followUpDay = new Date(
    followUp.getFullYear(),
    followUp.getMonth(),
    followUp.getDate()
  );
  const today = startOfToday();

  if (followUpDay.getTime() < today.getTime()) {
    return "overdue";
  }

  if (followUpDay.getTime() === today.getTime()) {
    return "today";
  }

  return "upcoming";
}

function matchesSearch(lead: Lead, query: string) {
  if (!query) return true;

  const haystack = [
    lead.name,
    lead.company,
    lead.phone,
    lead.email,
    lead.service,
    lead.requirement,
    lead.source,
    lead.status,
    lead.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const leads = await getLeads();
  const params = await searchParams;

  const query = (params.q ?? "").trim();
  const selectedStatus = params.status ?? "All";

  const activeLeads = leads.filter(
    (lead) => !CLOSED_STATUSES.has(lead.status)
  );
  const wonLeads = leads.filter((lead) => lead.status === "Won").length;
  const quotationLeads = leads.filter(
    (lead) => lead.status === "Quotation Sent"
  ).length;
  const overdueFollowUps = activeLeads.filter(
    (lead) => getFollowUpState(lead) === "overdue"
  ).length;
  const dueToday = activeLeads.filter(
    (lead) => getFollowUpState(lead) === "today"
  ).length;

  const filteredLeads = leads.filter((lead) => {
    const statusMatch =
      selectedStatus === "All" || lead.status === selectedStatus;

    return statusMatch && matchesSearch(lead, query);
  });

  return (
    <div className="leads-page-content">
      <header className="leads-page-header">
        <div>
          <span>Nexus Hyderabad CRM</span>
          <h1>Lead Management</h1>
          <p>
            Track enquiries, sales prospects, follow-ups and business
            opportunities without mixing them with operational customers.
          </p>
        </div>

        <div className="leads-database-badge">
          <span />
          Neon Database Connected
        </div>
      </header>

      <div className="leads-metrics">
        <LeadMetricCard
          title="Active Leads"
          value={activeLeads.length}
          icon={<Target size={21} />}
        />

        <LeadMetricCard
          title="Overdue Follow-ups"
          value={overdueFollowUps}
          icon={<CalendarClock size={21} />}
        />

        <LeadMetricCard
          title="Due Today"
          value={dueToday}
          icon={<Users size={21} />}
        />

        <LeadMetricCard
          title="Quotation Sent"
          value={quotationLeads}
          icon={<CircleDollarSign size={21} />}
        />

        <LeadMetricCard
          title="Won"
          value={wonLeads}
          icon={<CheckCircle2 size={21} />}
        />
      </div>

      <section className="leads-panel">
        <div className="leads-panel-header">
          <div>
            <span className="leads-panel-eyebrow">Sales Pipeline</span>
            <h2>Leads & Opportunities</h2>
            <p>
              Website enquiries and manually tracked sales opportunities.
            </p>
          </div>

          <form className="leads-search" method="GET">
            <Search size={16} />

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search leads..."
              aria-label="Search leads"
            />

            {selectedStatus !== "All" && (
              <input type="hidden" name="status" value={selectedStatus} />
            )}
          </form>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            padding: "0 0 18px",
          }}
        >
          {STATUS_OPTIONS.map((status) => {
            const active = status === selectedStatus;
            const href =
              status === "All"
                ? query
                  ? `/admin/leads?q=${encodeURIComponent(query)}`
                  : "/admin/leads"
                : `/admin/leads?status=${encodeURIComponent(status)}${
                    query ? `&q=${encodeURIComponent(query)}` : ""
                  }`;

            return (
              <Link
                key={status}
                href={href}
                className={`leads-status ${getStatusClass(
                  status === "All" ? "New Lead" : status
                )}`}
                style={{
                  textDecoration: "none",
                  opacity: active ? 1 : 0.68,
                  outline: active ? "2px solid currentColor" : "none",
                  outlineOffset: "2px",
                }}
              >
                {status}
              </Link>
            );
          })}
        </div>

        {filteredLeads.length > 0 ? (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Requirement</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => {
                  const followUpState = getFollowUpState(lead);

                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="leads-person">
                          <div className="leads-avatar">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="leads-person-details">
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="leads-name"
                            >
                              {lead.name}
                            </Link>

                            <span>
                              {lead.source}
                              {!lead.isRead ? " · New" : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="leads-company">
                          <Building2 size={14} />
                          {lead.companyId ? (
                            <Link href={`/admin/companies/${lead.companyId}`}>
                              {lead.company}
                            </Link>
                          ) : (
                            <span>{lead.company}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="leads-service">{lead.service}</span>
                      </td>

                      <td>
                        <div className="leads-contact">
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`}>
                              <Phone size={12} />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            <span>Phone not available</span>
                          )}

                          {lead.email ? (
                            <a href={`mailto:${lead.email}`}>
                              <Mail size={12} />
                              <span>{lead.email}</span>
                            </a>
                          ) : (
                            <span>Email not available</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`leads-status ${getStatusClass(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      <td>
                        {lead.nextFollowUp &&
                        !CLOSED_STATUSES.has(lead.status) ? (
                          <div>
                            <span className="leads-date">
                              {formatDate(lead.nextFollowUp)}
                            </span>

                            {followUpState !== "none" && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                {followUpState === "overdue"
                                  ? "Overdue"
                                  : followUpState === "today"
                                    ? "Due today"
                                    : "Upcoming"}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="leads-date">Not scheduled</span>
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="leads-requirement"
                        >
                          {lead.requirement}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : leads.length === 0 ? (
          <div className="leads-empty">
            <Target size={42} />
            <h3>No leads yet</h3>
            <p>
              Website enquiries and future sales opportunities will appear
              here.
            </p>
            <Link href="/#contact">Submit Test Enquiry</Link>
          </div>
        ) : (
          <div className="leads-empty">
            <Search size={42} />
            <h3>No matching leads</h3>
            <p>Try another search term or remove the current status filter.</p>
            <Link href="/admin/leads">Clear Filters</Link>
          </div>
        )}
      </section>
    </div>
  );
}

function LeadMetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="leads-metric-card">
      <div className="leads-metric-icon">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
