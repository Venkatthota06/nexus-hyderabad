import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  LinkIcon,
  Mail,
  Megaphone,
  Phone,
  Plus,
  Target,
  UserRound,
  Users,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./digital-marketing.css";

export const dynamic =
  "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type MarketingProspect = {
  id: string;

  companyId: string | null;
  leadId: string | null;

  companyName: string;

  contactName: string | null;
  designation: string | null;

  linkedin: string | null;
  email: string | null;
  phone: string | null;

  industry: string | null;
  source: string;

  targetService: string | null;

  outreachStatus: string;
  priority: string;

  lastContacted: string | null;
  nextFollowUp: string | null;

  converted: boolean;
  convertedDate: string | null;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   DATA
========================================================= */

async function getProspects():
  Promise<MarketingProspect[]> {
  try {
    const prospects =
      await db.orm.public.MarketingProspect
        .orderBy(
          (prospect) =>
            prospect.createdAt.desc()
        )
        .all();

    return prospects as MarketingProspect[];
  } catch (error) {
    console.error(
      "Digital marketing page error:",
      error
    );

    return [];
  }
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function statusClass(
  status: string
) {
  return status
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-");
}

function priorityClass(
  priority: string
) {
  return priority
    .toLowerCase();
}

/* =========================================================
   PAGE
========================================================= */

export default async function DigitalMarketingPage() {
  const prospects =
    await getProspects();

  const total =
    prospects.length;

  const identified =
    prospects.filter(
      (prospect) =>
        !prospect.converted &&
        prospect.outreachStatus ===
          "Identified"
    ).length;

  const contacted =
    prospects.filter(
      (prospect) =>
        !prospect.converted &&
        [
          "Contacted",
          "Follow-up",
          "Response Received",
        ].includes(
          prospect.outreachStatus
        )
    ).length;

  const responses =
    prospects.filter(
      (prospect) =>
        !prospect.converted &&
        [
          "Response Received",
          "Meeting Scheduled",
          "Qualified",
        ].includes(
          prospect.outreachStatus
        )
    ).length;

  const meetings =
    prospects.filter(
      (prospect) =>
        !prospect.converted &&
        prospect.outreachStatus ===
          "Meeting Scheduled"
    ).length;

  const converted =
    prospects.filter(
      (prospect) =>
        prospect.converted
    ).length;

  return (
    <main className="dm-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="dm-hero">

        <div className="dm-hero-content">

          <div className="dm-hero-icon">
            <Megaphone size={25} />
          </div>

          <div>
            <span>
              BUSINESS DEVELOPMENT
            </span>

            <h1>
              Digital Marketing
            </h1>

            <p>
              Track LinkedIn outreach,
              online prospecting,
              target companies and
              conversion opportunities
              for Hyderabad operations.
            </p>
          </div>

        </div>

        <Link
          href="/admin/digital-marketing/new"
          className="dm-primary-action"
        >
          <Plus size={16} />

          Add Prospect
        </Link>

      </section>

      {/* =====================================================
          METRICS
      ====================================================== */}

      <section className="dm-metrics">

        <MetricCard
          label="Prospects Identified"
          value={total}
          helper={`${identified} awaiting outreach`}
          icon={
            <Target size={19} />
          }
          type="blue"
        />

        <MetricCard
          label="Contacted"
          value={contacted}
          helper="Active outreach"
          icon={
            <Mail size={19} />
          }
          type="cyan"
        />

        <MetricCard
          label="Responses"
          value={responses}
          helper="Engaged prospects"
          icon={
            <Users size={19} />
          }
          type="purple"
        />

        <MetricCard
          label="Meetings"
          value={meetings}
          helper="Meetings scheduled"
          icon={
            <CalendarDays
              size={19}
            />
          }
          type="orange"
        />

        <MetricCard
          label="Converted"
          value={converted}
          helper="CRM leads created"
          icon={
            <CheckCircle2
              size={19}
            />
          }
          type="green"
        />

      </section>

      {/* =====================================================
          PROSPECT TABLE
      ====================================================== */}

      <section className="dm-panel">

        <div className="dm-panel-header">

          <div>
            <span>
              OUTREACH PIPELINE
            </span>

            <h2>
              Marketing Prospects
            </h2>

            <p>
              Digital prospecting,
              follow-ups and CRM
              conversion pipeline.
            </p>
          </div>

          <strong>
            {total} Records
          </strong>

        </div>

        {prospects.length === 0 ? (

          <div className="dm-empty">

            <div className="dm-empty-icon">
              <Megaphone size={30} />
            </div>

            <span>
              Digital Marketing
            </span>

            <h3>
              No marketing prospects yet
            </h3>

            <p>
              Add your first real target
              company or LinkedIn
              prospect.
            </p>

            <Link href="/admin/digital-marketing/new">
              <Plus size={15} />

              Add First Prospect
            </Link>

          </div>

        ) : (

          <div className="dm-table-wrap">

            <table className="dm-table">

              <thead>
                <tr>
                  <th>
                    Company
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Target Service
                  </th>

                  <th>
                    Source
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Next Follow-up
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {prospects.map(
                  (prospect) => (
                    <tr
                      key={
                        prospect.id
                      }
                    >

                      <td>
                        <div className="dm-company">

                          <div className="dm-company-icon">
                            <Building2
                              size={15}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                prospect.companyName
                              }
                            </strong>

                            <span>
                              {prospect.industry ||
                                "Industry not specified"}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="dm-contact-person">

                          <UserRound
                            size={14}
                          />

                          <div>
                            <strong>
                              {prospect.contactName ||
                                "Not available"}
                            </strong>

                            <span>
                              {prospect.designation ||
                                "Designation not available"}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="dm-service">
                          {prospect.targetService ||
                            "Not specified"}
                        </span>
                      </td>

                      <td>
                        <span className="dm-source">
                          {
                            prospect.source
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`dm-status ${statusClass(
                            prospect.converted
                              ? "Converted"
                              : prospect.outreachStatus
                          )}`}
                        >
                          {prospect.converted
                            ? "Converted"
                            : prospect.outreachStatus}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`dm-priority ${priorityClass(
                            prospect.priority
                          )}`}
                        >
                          {
                            prospect.priority
                          }
                        </span>
                      </td>

                      <td>
                        <div className="dm-followup">

                          <CalendarDays
                            size={13}
                          />

                          <span>
                            {formatDate(
                              prospect.nextFollowUp
                            )}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="dm-links">

                          {prospect.linkedin && (
                            <a
                              href={
                                prospect.linkedin
                              }
                              target="_blank"
                              rel="noreferrer"
                              title="Open LinkedIn"
                            >
                              <LinkIcon
                                size={14}
                              />
                            </a>
                          )}

                          {prospect.email && (
                            <a
                              href={`mailto:${prospect.email}`}
                              title={
                                prospect.email
                              }
                            >
                              <Mail
                                size={14}
                              />
                            </a>
                          )}

                          {prospect.phone && (
                            <a
                              href={`tel:${prospect.phone}`}
                              title={
                                prospect.phone
                              }
                            >
                              <Phone
                                size={14}
                              />
                            </a>
                          )}

                        </div>
                      </td>

                      <td>
                        <Link
                          href={`/admin/digital-marketing/${prospect.id}`}
                          className="dm-open-prospect"
                        >
                          {prospect.converted
                            ? "View"
                            : "Open"}

                          <ArrowRight
                            size={12}
                          />
                        </Link>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </main>
  );
}

/* =========================================================
   METRIC
========================================================= */

function MetricCard({
  label,
  value,
  helper,
  icon,
  type,
}: {
  label: string;
  value: number;
  helper: string;
  icon:
    React.ReactNode;

  type:
    | "blue"
    | "cyan"
    | "purple"
    | "orange"
    | "green";
}) {
  return (
    <article
      className={`dm-metric ${type}`}
    >

      <div className="dm-metric-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {helper}
        </small>
      </div>

    </article>
  );
}