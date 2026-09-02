import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/src/prisma/db";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  Crown,
  ExternalLink,
  FileText,
  Globe2,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserPlus,
  UsersRound,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Company = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Contact = {
  id: string;
  companyId: string;
  name: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  decisionMaker: boolean;
  createdAt: string;
  updatedAt: string;
};

type Lead = {
  id: string;
  companyId: string | null;
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

type Activity = {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string | null;
  outcome: string | null;
  activityDate: string;
  nextAction: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   DATA
========================================================= */

async function getCompany(id: string): Promise<Company | null> {
  try {
    const company = await db.orm.public.Company.where({ id }).first();
    return company ? (company as Company) : null;
  } catch (error) {
    console.error("Company detail error:", error);
    return null;
  }
}

async function getContacts(companyId: string): Promise<Contact[]> {
  try {
    const contacts = await db.orm.public.Contact
      .where({ companyId })
      .orderBy((contact) => contact.createdAt.desc())
      .all();

    return contacts as Contact[];
  } catch (error) {
    console.error("Company contacts error:", error);
    return [];
  }
}

async function getLeads(companyId: string): Promise<Lead[]> {
  try {
    const leads = await db.orm.public.Lead
      .where({ companyId })
      .orderBy((lead) => lead.createdAt.desc())
      .all();

    return leads as Lead[];
  } catch (error) {
    console.error("Company leads error:", error);
    return [];
  }
}

async function getActivities(companyId: string): Promise<Activity[]> {
  try {
    const activities = await db.orm.public.Activity
      .where({ companyId })
      .orderBy((activity) => activity.activityDate.desc())
      .all();

    return activities as Activity[];
  } catch (error) {
    console.error("Company activities error:", error);
    return [];
  }
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}

function websiteHref(value: string) {
  return value.startsWith("http") ? value : `https://${value}`;
}

/* =========================================================
   PAGE
========================================================= */

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  const [contacts, leads, activities] = await Promise.all([
    getContacts(company.id),
    getLeads(company.id),
    getActivities(company.id),
  ]);

  const decisionMakers = contacts.filter(
    (contact) => contact.decisionMaker
  ).length;

  const activeLeads = leads.filter(
    (lead) => lead.status !== "Won" && lead.status !== "Lost"
  ).length;

  const wonLeads = leads.filter(
    (lead) => lead.status === "Won"
  ).length;

  const followUps = activities.filter(
    (activity) => activity.nextFollowUp
  ).length;

  return (
    <div className="company-profile-page">
      {/* =====================================================
          TOP NAV
      ====================================================== */}

      <div className="company-profile-topbar">
        <Link href="/admin/companies" className="company-profile-back">
          <ArrowLeft size={17} />
          <span>Back to Companies</span>
        </Link>

        <span className="company-profile-top-label">
          Nexus Hyderabad CRM
        </span>
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="company-profile-hero">
        <div className="company-profile-identity">
          <div className="company-profile-logo">
            <Building2 size={28} />
          </div>

          <div className="company-profile-name">
            <span>Company Profile</span>

            <h1>{company.name}</h1>

            <div className="company-profile-meta">
              <span>{company.industry || "Industry not specified"}</span>

              {company.source && (
                <>
                  <span className="company-profile-meta-dot" />
                  <span>{company.source}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span
          className={`company-profile-status ${statusClass(
            company.status
          )}`}
        >
          {company.status}
        </span>
      </section>

      {/* =====================================================
          METRICS
      ====================================================== */}

      <section className="company-profile-metrics">
        <ProfileMetric
          label="Contacts"
          value={contacts.length}
          icon={<UsersRound size={19} />}
          type="blue"
        />

        <ProfileMetric
          label="Decision Makers"
          value={decisionMakers}
          icon={<Crown size={19} />}
          type="gold"
        />

        <ProfileMetric
          label="Total Leads"
          value={leads.length}
          icon={<FileText size={19} />}
          type="purple"
        />

        <ProfileMetric
          label="Active Leads"
          value={activeLeads}
          icon={<Clock3 size={19} />}
          type="cyan"
        />

        <ProfileMetric
          label="Won"
          value={wonLeads}
          icon={<Crown size={19} />}
          type="green"
        />

        <ProfileMetric
          label="Activities"
          value={activities.length}
          icon={<CalendarDays size={19} />}
          type="slate"
        />

        <ProfileMetric
          label="Follow-ups"
          value={followUps}
          icon={<Clock3 size={19} />}
          type="orange"
        />
      </section>

      {/* =====================================================
          COMPANY INFO + LOCATION
      ====================================================== */}

      <section className="company-profile-overview">
        <article className="company-profile-card company-profile-info-card">
          <div className="company-profile-card-header">
            <div>
              <span>Business Details</span>
              <h2>Company Information</h2>
              <p>Contact and organisation details.</p>
            </div>
          </div>

          <div className="company-profile-info-list">
            <ProfileInfo
              icon={<Building2 size={17} />}
              label="Industry"
              value={company.industry || "Not specified"}
            />

            <ProfileInfo
              icon={<FileText size={17} />}
              label="Source"
              value={company.source || "Not specified"}
            />

            <ProfileInfo
              icon={<Phone size={17} />}
              label="Phone"
              value={
                company.phone ? (
                  <a href={`tel:${company.phone}`}>{company.phone}</a>
                ) : (
                  "Not available"
                )
              }
            />

            <ProfileInfo
              icon={<Mail size={17} />}
              label="Email"
              value={
                company.email ? (
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                ) : (
                  "Not available"
                )
              }
            />

            <ProfileInfo
              icon={<Globe2 size={17} />}
              label="Website"
              value={
                company.website ? (
                  <a
                    href={websiteHref(company.website)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {company.website}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  "Not available"
                )
              }
            />
          </div>
        </article>

        <article className="company-profile-card company-profile-location-card">
          <div className="company-profile-card-header">
            <div>
              <span>Facility</span>
              <h2>Location</h2>
              <p>Office or operating location.</p>
            </div>
          </div>

          <div className="company-profile-location-content">
            <div className="company-profile-map-icon">
              <MapPin size={23} />
            </div>

            <div>
              <span>Primary Location</span>

              <h3>
                {company.city || company.state
                  ? [company.city, company.state]
                      .filter(Boolean)
                      .join(", ")
                  : "Location not specified"}
              </h3>

              <p>{company.address || "No address added yet."}</p>
            </div>
          </div>

          <div className="company-profile-created">
            <CalendarDays size={14} />
            Added on {formatDate(company.createdAt)}
          </div>
        </article>
      </section>

      {/* =====================================================
          LEADS
      ====================================================== */}

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <div>
            <span>Business Pipeline</span>
            <h2>Company Leads</h2>
            <p>
              Enquiries and opportunities linked to {company.name}.
            </p>
          </div>

          <Link
            href="/admin/leads"
            className="company-profile-secondary-action"
          >
            View All Leads
            <ArrowRight size={15} />
          </Link>
        </div>

        {leads.length > 0 ? (
          <div className="company-profile-leads-grid">
            {leads.map((lead) => (
              <article
                key={lead.id}
                className="company-profile-lead-card"
              >
                <div className="company-profile-lead-top">
                  <div className="company-profile-avatar">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="company-profile-lead-title">
                    <h3>{lead.name}</h3>
                    <p>{lead.service}</p>
                  </div>

                  <span
                    className={`company-profile-lead-status ${statusClass(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="company-profile-lead-contact">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`}>
                      <Phone size={14} />
                      {lead.phone}
                    </a>
                  )}

                  {lead.email && (
                    <a href={`mailto:${lead.email}`}>
                      <Mail size={14} />
                      {lead.email}
                    </a>
                  )}
                </div>

                {lead.requirement && (
                  <div className="company-profile-lead-requirement">
                    <span>Requirement</span>
                    <p>{lead.requirement}</p>
                  </div>
                )}

                <div className="company-profile-lead-footer">
                  <span>{formatDate(lead.createdAt)}</span>

                  <Link href={`/admin/leads/${lead.id}`}>
                    View Lead
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={28} />}
            title="No linked leads yet"
            description={`Link a lead to ${company.name} from the Lead Detail page.`}
            actionHref="/admin/leads"
            actionLabel="Go to Leads"
          />
        )}
      </section>

      {/* =====================================================
          ACTIVITIES
      ====================================================== */}

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <div>
            <span>Client Engagement</span>
            <h2>Activity History</h2>
            <p>
              Calls, meetings, field visits, LinkedIn outreach and
              follow-ups.
            </p>
          </div>

          <Link
            href={`/admin/companies/${company.id}/activities/new`}
            className="company-profile-primary-action"
          >
            <Plus size={16} />
            Add Activity
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="company-profile-activity-list">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="company-profile-activity-card"
              >
                <div className="company-profile-activity-icon">
                  <CalendarDays size={18} />
                </div>

                <div className="company-profile-activity-body">
                  <div className="company-profile-activity-heading">
                    <div>
                      <h3>{activity.title}</h3>
                      <span>{activity.type}</span>
                    </div>

                    <span className="company-profile-activity-date">
                      <CalendarDays size={13} />
                      {formatDate(activity.activityDate)}
                    </span>
                  </div>

                  <div className="company-profile-activity-details">
                    {activity.description && (
                      <ActivityDetail
                        label="Discussion"
                        value={activity.description}
                      />
                    )}

                    {activity.outcome && (
                      <ActivityDetail
                        label="Outcome"
                        value={activity.outcome}
                      />
                    )}

                    {activity.nextAction && (
                      <ActivityDetail
                        label="Next Action"
                        value={activity.nextAction}
                      />
                    )}
                  </div>

                  {activity.nextFollowUp && (
                    <div className="company-profile-followup">
                      <Clock3 size={14} />
                      Follow-up on{" "}
                      <strong>
                        {formatDate(activity.nextFollowUp)}
                      </strong>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="No activities yet"
            description={`Record the first call, meeting or field visit for ${company.name}.`}
            actionHref={`/admin/companies/${company.id}/activities/new`}
            actionLabel="Add First Activity"
          />
        )}
      </section>

      {/* =====================================================
          CONTACTS
      ====================================================== */}

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <div>
            <span>People</span>
            <h2>Company Contacts</h2>
            <p>
              Facility, Admin, EHS, Procurement, Operations and
              other contacts.
            </p>
          </div>

          <Link
            href={`/admin/companies/${company.id}/contacts/new`}
            className="company-profile-primary-action"
          >
            <UserPlus size={16} />
            Add Contact
          </Link>
        </div>

        {contacts.length > 0 ? (
          <div className="company-profile-contacts-grid">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                className="company-profile-contact-card"
              >
                <div className="company-profile-contact-top">
                  <div className="company-profile-avatar">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="company-profile-contact-name">
                    <div>
                      <h3>{contact.name}</h3>

                      {contact.decisionMaker && (
                        <span className="company-profile-decision-badge">
                          <Crown size={11} />
                          Decision Maker
                        </span>
                      )}
                    </div>

                    <p>
                      {contact.designation ||
                        "Designation not specified"}
                    </p>
                  </div>
                </div>

                <div className="company-profile-contact-links">
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`}>
                      <Phone size={15} />
                      <div>
                        <span>Phone</span>
                        <strong>{contact.phone}</strong>
                      </div>
                    </a>
                  )}

                  {contact.email && (
                    <a href={`mailto:${contact.email}`}>
                      <Mail size={15} />
                      <div>
                        <span>Email</span>
                        <strong>{contact.email}</strong>
                      </div>
                    </a>
                  )}

                  {contact.linkedin && (
                    <a
                      href={websiteHref(contact.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Link2 size={15} />

                      <div>
                        <span>Professional Profile</span>
                        <strong>
                          LinkedIn
                          <ExternalLink size={11} />
                        </strong>
                      </div>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<UsersRound size={28} />}
            title="No contacts yet"
            description={`Add the first contact person for ${company.name}.`}
            actionHref={`/admin/companies/${company.id}/contacts/new`}
            actionLabel="Add First Contact"
          />
        )}
      </section>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function ProfileMetric({
  label,
  value,
  icon,
  type,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  type:
    | "blue"
    | "gold"
    | "purple"
    | "cyan"
    | "green"
    | "slate"
    | "orange";
}) {
  return (
    <div className={`company-profile-metric ${type}`}>
      <div className="company-profile-metric-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="company-profile-info-row">
      <div className="company-profile-info-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ActivityDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="company-profile-activity-detail">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="company-profile-empty">
      <div>{icon}</div>

      <h3>{title}</h3>
      <p>{description}</p>

      <Link href={actionHref}>
        {actionLabel}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}