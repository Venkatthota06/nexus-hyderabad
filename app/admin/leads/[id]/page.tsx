import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/src/prisma/db";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import LeadEditor from "@/components/LeadEditor";

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
  notes: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

async function getLead(
  id: string
): Promise<Lead | null> {
  try {
    const lead = await db.orm.public.Lead
      .where({ id })
      .first();

    if (!lead) {
      return null;
    }

    return lead as Lead;
  } catch (error) {
    console.error(
      "Lead detail getLead error:",
      error
    );

    return null;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function formatFollowUpDate(
  value: string | null
) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
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

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="lead-profile-page">
      {/* =========================================
          BACK LINK
      ========================================= */}

      <div className="lead-profile-back">
        <Link href="/admin/leads">
          <ArrowLeft size={16} />
          Back to Leads
        </Link>
      </div>

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <header className="lead-profile-header">
        <div>
          <span>Lead Profile</span>

          <h1>{lead.name}</h1>

          {lead.companyId ? (
            <Link
              href={`/admin/companies/${lead.companyId}`}
              className="lead-profile-company-link"
            >
              <Building2 size={15} />
              {lead.company}
            </Link>
          ) : (
            <div className="lead-profile-company-text">
              <Building2 size={15} />
              {lead.company}
            </div>
          )}
        </div>

        <span
          className={`lead-profile-status ${getStatusClass(
            lead.status
          )}`}
        >
          {lead.status}
        </span>
      </header>

      {/* =========================================
          MAIN GRID
      ========================================= */}

      <div className="lead-profile-grid">
        {/* =====================================
            LEFT CONTENT
        ===================================== */}

        <section className="lead-profile-content">
          {/* CONTACT INFORMATION */}

          <article className="lead-profile-card">
            <div className="lead-profile-card-header">
              <div className="lead-profile-card-icon">
                <User size={18} />
              </div>

              <div>
                <h2>Contact Information</h2>
                <p>Client and company details</p>
              </div>
            </div>

            <div className="lead-profile-info-grid">
              <InfoItem
                label="Contact Person"
                icon={<User size={15} />}
              >
                {lead.name}
              </InfoItem>

              <InfoItem
                label="Company"
                icon={<Building2 size={15} />}
              >
                {lead.companyId ? (
                  <Link
                    href={`/admin/companies/${lead.companyId}`}
                  >
                    {lead.company}
                  </Link>
                ) : (
                  lead.company
                )}
              </InfoItem>

              <InfoItem
                label="Phone"
                icon={<Phone size={15} />}
              >
                <a href={`tel:${lead.phone}`}>
                  {lead.phone}
                </a>
              </InfoItem>

              <InfoItem
                label="Email"
                icon={<Mail size={15} />}
              >
                <a href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              </InfoItem>
            </div>
          </article>

          {/* TESTING REQUIREMENT */}

          <article className="lead-profile-card">
            <div className="lead-profile-card-header">
              <div className="lead-profile-card-icon">
                <ClipboardList size={18} />
              </div>

              <div>
                <h2>Testing Requirement</h2>
                <p>Service requested by client</p>
              </div>
            </div>

            <div className="lead-profile-service">
              <span>Requested Service</span>
              <strong>{lead.service}</strong>
            </div>

            <div className="lead-profile-requirement">
              <span>Client Requirement</span>
              <p>{lead.requirement}</p>
            </div>
          </article>

          {/* LEAD INFORMATION */}

          <article className="lead-profile-card">
            <div className="lead-profile-card-header">
              <div className="lead-profile-card-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <h2>Lead Information</h2>
                <p>Tracking and activity information</p>
              </div>
            </div>

            <div className="lead-profile-info-grid">
              <InfoItem
                label="Lead Source"
                icon={<MapPin size={15} />}
              >
                {lead.source}
              </InfoItem>

              <InfoItem
                label="Created"
                icon={<CalendarDays size={15} />}
              >
                {formatDate(lead.createdAt)}
              </InfoItem>

              <InfoItem
                label="Next Follow-up"
                icon={<CalendarDays size={15} />}
              >
                {formatFollowUpDate(
                  lead.nextFollowUp
                )}
              </InfoItem>

              <InfoItem
                label="Last Updated"
                icon={<CalendarDays size={15} />}
              >
                {formatDate(lead.updatedAt)}
              </InfoItem>
            </div>
          </article>
        </section>

        {/* =====================================
            RIGHT EDITOR
        ===================================== */}

        <aside className="lead-profile-editor">
          <LeadEditor
            lead={{
              id: lead.id,
              status: lead.status,
              notes:
                lead.notes ?? undefined,
              nextFollowUp:
                lead.nextFollowUp ?? undefined,
              companyId:
                lead.companyId,
            }}
          />
        </aside>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="lead-profile-info-item">
      <span>{label}</span>

      <div>
        {icon}
        <strong>{children}</strong>
      </div>
    </div>
  );
}