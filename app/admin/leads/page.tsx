import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  Building2,
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

async function getLeads(): Promise<Lead[]> {
  try {
    const leads = await db.orm.public.Lead
      .orderBy((lead) => lead.createdAt.desc())
      .all();

    return leads as Lead[];
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

export default async function LeadsPage() {
  const leads = await getLeads();

  const newLeads = leads.filter(
    (lead) => lead.status === "New Lead"
  ).length;

  const contacted = leads.filter(
    (lead) => lead.status === "Contacted"
  ).length;

  const quotations = leads.filter(
    (lead) => lead.status === "Quotation Sent"
  ).length;

  return (
    <div className="leads-page-content">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <header className="leads-page-header">
        <div>
          <span>Nexus Hyderabad CRM</span>

          <h1>Lead Management</h1>

          <p>
            Track website enquiries, prospects and
            business opportunities in one place.
          </p>
        </div>

        <div className="leads-database-badge">
          <span />
          Neon Database Connected
        </div>
      </header>

      {/* =========================================
          METRICS
      ========================================= */}

      <div className="leads-metrics">
        <LeadMetricCard
          title="Total Leads"
          value={leads.length}
          icon={<Target size={21} />}
        />

        <LeadMetricCard
          title="New Leads"
          value={newLeads}
          icon={<Users size={21} />}
        />

        <LeadMetricCard
          title="Contacted"
          value={contacted}
          icon={<Phone size={21} />}
        />

        <LeadMetricCard
          title="Quotations"
          value={quotations}
          icon={<CircleDollarSign size={21} />}
        />
      </div>

      {/* =========================================
          LEADS TABLE PANEL
      ========================================= */}

      <section className="leads-panel">
        <div className="leads-panel-header">
          <div>
            <span className="leads-panel-eyebrow">
              Lead Database
            </span>

            <h2>Website Leads</h2>

            <p>
              Enquiries received through the Nexus
              Hyderabad website.
            </p>
          </div>

          <div className="leads-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search leads..."
              disabled
            />
          </div>
        </div>

        {leads.length > 0 ? (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Requirement</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    {/* LEAD */}

                    <td>
                      <div className="leads-person">
                        <div className="leads-avatar">
                          {lead.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="leads-person-details">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="leads-name"
                          >
                            {lead.name}
                          </Link>

                          <span>{lead.source}</span>
                        </div>
                      </div>
                    </td>

                    {/* COMPANY */}

                    <td>
                      <div className="leads-company">
                        <Building2 size={14} />

                        <span>{lead.company}</span>
                      </div>
                    </td>

                    {/* SERVICE */}

                    <td>
                      <span className="leads-service">
                        {lead.service}
                      </span>
                    </td>

                    {/* CONTACT */}

                    <td>
                      <div className="leads-contact">
                        <a href={`tel:${lead.phone}`}>
                          <Phone size={12} />
                          <span>{lead.phone}</span>
                        </a>

                        <a href={`mailto:${lead.email}`}>
                          <Mail size={12} />
                          <span>{lead.email}</span>
                        </a>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`leads-status ${getStatusClass(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* DATE */}

                    <td>
                      <span className="leads-date">
                        {formatDate(lead.createdAt)}
                      </span>
                    </td>

                    {/* REQUIREMENT */}

                    <td>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="leads-requirement"
                      >
                        {lead.requirement}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="leads-empty">
            <Target size={42} />

            <h3>No leads yet</h3>

            <p>
              New website enquiries will appear here
              automatically.
            </p>

            <Link href="/#contact">
              Submit Test Enquiry
            </Link>
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
      <div className="leads-metric-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}