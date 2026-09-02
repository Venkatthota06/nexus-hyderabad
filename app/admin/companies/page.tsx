import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Plus,
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

async function getCompanies(): Promise<Company[]> {
  try {
    const companies = await db.orm.public.Company
      .orderBy((company) => company.createdAt.desc())
      .all();

    return companies as Company[];
  } catch (error) {
    console.error(
      "Companies getCompanies error:",
      error
    );

    return [];
  }
}

function getStatusClass(status: string) {
  return status
    .toLowerCase()
    .replaceAll(" ", "-");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  const prospects = companies.filter(
    (company) =>
      company.status === "Prospect"
  ).length;

  const clients = companies.filter(
    (company) =>
      company.status === "Client"
  ).length;

  return (
    <div className="companies-crm-page">

      {/* HEADER */}

      <header className="companies-crm-header">

        <div>
          <span>
            Business Database
          </span>

          <h1>
            Companies
          </h1>

          <p>
            Manage prospects, clients and organisations
            across Hyderabad, Telangana and Andhra Pradesh.
          </p>
        </div>

        <Link
          href="/admin/companies/new"
          className="companies-crm-add-button"
        >
          <Plus size={18} />

          Add Company
        </Link>

      </header>

      {/* METRICS */}

      <section className="companies-crm-metrics">

        <CompanyMetric
          title="Total Companies"
          value={companies.length}
          icon={<Building2 size={22} />}
          type="total"
        />

        <CompanyMetric
          title="Prospects"
          value={prospects}
          icon={<UsersRound size={22} />}
          type="prospect"
        />

        <CompanyMetric
          title="Clients"
          value={clients}
          icon={<Building2 size={22} />}
          type="client"
        />

      </section>

      {/* DATABASE */}

      <section className="companies-crm-panel">

        <div className="companies-crm-panel-header">

          <div className="companies-crm-panel-title">

            <div className="companies-crm-panel-icon">
              <Building2 size={20} />
            </div>

            <div>
              <h2>
                Company Database
              </h2>

              <p>
                Organisations currently stored
                in your CRM.
              </p>
            </div>

          </div>

          <div className="companies-crm-count">
            {companies.length} Companies
          </div>

        </div>

        {companies.length > 0 ? (

          <div className="companies-crm-grid">

            {companies.map((company) => (

              <article
                key={company.id}
                className="companies-crm-card"
              >

                {/* CARD HEADER */}

                <div className="companies-crm-card-top">

                  <div className="companies-crm-icon">
                    <Building2 size={23} />
                  </div>

                  <div className="companies-crm-title">

                    <Link
                      href={`/admin/companies/${company.id}`}
                    >
                      {company.name}
                    </Link>

                    <span>
                      {company.industry ||
                        "Industry not specified"}
                    </span>

                  </div>

                  <span
                    className={`companies-crm-status ${getStatusClass(
                      company.status
                    )}`}
                  >
                    {company.status}
                  </span>

                </div>

                {/* DETAILS */}

                <div className="companies-crm-details">

                  {(company.address ||
                    company.city ||
                    company.state) && (

                    <CompanyDetail
                      label="Address"
                      icon={<MapPin size={17} />}
                    >
                      {company.address ||
                        [
                          company.city,
                          company.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                    </CompanyDetail>

                  )}

                  {company.phone && (

                    <CompanyDetail
                      label="Phone"
                      icon={<Phone size={17} />}
                    >
                      <a
                        href={`tel:${company.phone}`}
                      >
                        {company.phone}
                      </a>
                    </CompanyDetail>

                  )}

                  {company.email && (

                    <CompanyDetail
                      label="Email"
                      icon={<Mail size={17} />}
                    >
                      <a
                        href={`mailto:${company.email}`}
                      >
                        {company.email}
                      </a>
                    </CompanyDetail>

                  )}

                  {company.website && (

                    <CompanyDetail
                      label="Website"
                      icon={<Globe2 size={17} />}
                    >
                      <span>
                        {company.website}
                      </span>
                    </CompanyDetail>

                  )}

                </div>

                {/* FOOTER */}

                <div className="companies-crm-card-footer">

                  <div className="companies-crm-created">

                    <CalendarDays size={14} />

                    <span>
                      Added on{" "}
                      {formatDate(
                        company.createdAt
                      )}
                    </span>

                  </div>

                  <Link
                    href={`/admin/companies/${company.id}`}
                    className="companies-crm-view"
                  >
                    View Company

                    <ArrowRight size={16} />
                  </Link>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="companies-crm-empty">

            <div>
              <Building2 size={28} />
            </div>

            <h3>
              No companies yet
            </h3>

            <p>
              Add your first prospect or client
              to start building the Nexus Hyderabad
              company database.
            </p>

            <Link href="/admin/companies/new">
              <Plus size={15} />

              Add First Company
            </Link>

          </div>

        )}

      </section>

    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function CompanyMetric({
  title,
  value,
  icon,
  type,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  type:
    | "total"
    | "prospect"
    | "client";
}) {
  return (
    <div
      className={`companies-crm-metric ${type}`}
    >

      <div className="companies-crm-metric-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function CompanyDetail({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="companies-crm-detail">

      <div className="companies-crm-detail-icon">
        {icon}
      </div>

      <div className="companies-crm-detail-content">

        <strong>
          {label}
        </strong>

        <div>
          {children}
        </div>

      </div>

    </div>
  );
}