import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Droplets,
  FlaskConical,
  MapPin,
  Repeat2,
  Utensils,
  Waves,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./recurring-services.css";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
   ========================================================= */

type Company = {
  id: string;
  name: string;
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

type PageProps = {
  searchParams?: Promise<{
    type?: string | string[];
    view?: string | string[];
  }>;
};

/* =========================================================
   DATABASE
   ========================================================= */

async function getCompanies(): Promise<Company[]> {
  try {
    return (await db.orm.public.Company.all()) as Company[];
  } catch (error) {
    console.error("Recurring services getCompanies error:", error);

    return [];
  }
}

async function getLocations(): Promise<Location[]> {
  try {
    return (await db.orm.public.Location.all()) as Location[];
  } catch (error) {
    console.error("Recurring services getLocations error:", error);

    return [];
  }
}

async function getRecurringServices(): Promise<RecurringService[]> {
  try {
    return (await db.orm.public.RecurringService.all()) as RecurringService[];
  } catch (error) {
    console.error("Recurring services getRecurringServices error:", error);

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

function isActive(status: string) {
  return normalize(status) === "active";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusClass(status: string) {
  return (
    normalize(status).replaceAll(" ", "-").replaceAll("/", "-") || "unknown"
  );
}

/* =========================================================
   SAMPLE CLASSIFICATION

   IMPORTANT:
   Existing imported data has records such as:

   service: "Water Testing"
   sampleType: "Food"

   service: "Water Testing"
   sampleType: "Swab"

   Therefore SAMPLE TYPE must be checked first.

   Expected current data:
   Water + RO Water = 58
   Food             = 35
   Swab             = 9
   TOTAL            = 102
   ========================================================= */

function getSampleCategory(
  recurring: RecurringService,
): "water" | "food" | "swab" | "other" {
  const sampleType = normalize(recurring.sampleType);

  const service = normalize(recurring.service);

  /* FOOD */

  if (sampleType.includes("food")) {
    return "food";
  }

  /* SWAB */

  if (sampleType.includes("swab")) {
    return "swab";
  }

  /* WATER + RO WATER */

  if (sampleType.includes("water") || sampleType === "ro") {
    return "water";
  }

  /*
    FALLBACK FOR FUTURE / LEGACY RECORDS

    Only use service when sampleType did not
    provide a usable classification.
  */

  if (service.includes("food")) {
    return "food";
  }

  if (service.includes("swab")) {
    return "swab";
  }

  if (service.includes("water")) {
    return "water";
  }

  return "other";
}

/* =========================================================
   PAGE
   ========================================================= */

export default async function RecurringServicesPage({
  searchParams,
}: PageProps) {
  const params = searchParams ? await searchParams : {};

  const rawType = params.type;
  const rawView = params.view;

  const requestedType = Array.isArray(rawType) ? rawType[0] : rawType;

  const requestedView = Array.isArray(rawView) ? rawView[0] : rawView;

  const typeFilter =
    requestedType === "water" ||
    requestedType === "food" ||
    requestedType === "swab"
      ? requestedType
      : null;

  const locationsView = requestedView === "locations";

  const clientsView = requestedView === "clients";

  const [companies, locations, recurringServices] = await Promise.all([
    getCompanies(),
    getLocations(),
    getRecurringServices(),
  ]);

  /* =======================================================
     LOOKUP MAPS
     ======================================================= */

  const companyMap = new Map(companies.map((company) => [company.id, company]));

  const locationMap = new Map(
    locations.map((location) => [location.id, location]),
  );

  /* =======================================================
     ACTIVE RECURRING SERVICES
     ======================================================= */

  const activeServices = recurringServices.filter((service) =>
    isActive(service.status),
  );

  /* =======================================================
     CATEGORY GROUPS

     Each recurring record belongs to ONE category.
     ======================================================= */

  const waterServices = activeServices.filter(
    (service) => getSampleCategory(service) === "water",
  );

  const foodServices = activeServices.filter(
    (service) => getSampleCategory(service) === "food",
  );

  const swabServices = activeServices.filter(
    (service) => getSampleCategory(service) === "swab",
  );

  const otherServices = activeServices.filter(
    (service) => getSampleCategory(service) === "other",
  );

  /* =======================================================
     SAMPLE TOTALS
     ======================================================= */

  const totalSamplesPerMonth = activeServices.reduce(
    (sum, service) => sum + Number(service.samplesPerMonth || 0),
    0,
  );

  const waterSamples = waterServices.reduce(
    (sum, service) => sum + Number(service.samplesPerMonth || 0),
    0,
  );

  const foodSamples = foodServices.reduce(
    (sum, service) => sum + Number(service.samplesPerMonth || 0),
    0,
  );

  const swabSamples = swabServices.reduce(
    (sum, service) => sum + Number(service.samplesPerMonth || 0),
    0,
  );

  const otherSamples = otherServices.reduce(
    (sum, service) => sum + Number(service.samplesPerMonth || 0),
    0,
  );

  /* =======================================================
     ACTIVE LOCATIONS / CLIENTS
     ======================================================= */

  const activeLocationIds = new Set(
    activeServices
      .map((service) => service.locationId)
      .filter((value): value is string => Boolean(value)),
  );

  const activeCompanies = new Set(
    activeServices.map((service) => service.companyId),
  );

  /* =======================================================
     FILTERED REGISTER
     ======================================================= */

  let visibleServices = activeServices;

  if (typeFilter) {
    visibleServices = activeServices.filter(
      (service) => getSampleCategory(service) === typeFilter,
    );
  }

  if (locationsView) {
    visibleServices = activeServices.filter((service) =>
      Boolean(service.locationId),
    );
  }

  if (clientsView) {
    visibleServices = activeServices;
  }

  const register = [...visibleServices].sort(
    (a, b) => Number(b.samplesPerMonth || 0) - Number(a.samplesPerMonth || 0),
  );

  /* =======================================================
     CURRENT VIEW
     ======================================================= */

  let registerTitle = "Monthly Recurring Schedule";

  let registerDescription =
    "Client, location, testing requirement and monthly sample commitment";

  if (typeFilter === "water") {
    registerTitle = "Recurring Water Samples";

    registerDescription =
      "Water and RO Water recurring commitments by client and location";
  }

  if (typeFilter === "food") {
    registerTitle = "Recurring Food Samples";

    registerDescription =
      "Food sample recurring commitments by client and location";
  }

  if (typeFilter === "swab") {
    registerTitle = "Recurring Swab Samples";

    registerDescription =
      "Swab sample recurring commitments by client and location";
  }

  if (locationsView) {
    registerTitle = "Active Recurring Locations";

    registerDescription = "Location-wise recurring sample commitments";
  }

  if (clientsView) {
    registerTitle = "Active Recurring Clients";

    registerDescription =
      "Active clients with recurring sample commitments and their locations";
  }

  const filteredSampleTotal = register.reduce(
    (sum, service) => sum + Number(service.samplesPerMonth || 0),
    0,
  );

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main className="recurring-page">
      {/* HEADER */}

      <header className="recurring-header">
        <div>
          <span className="recurring-eyebrow">HYDERABAD OPERATIONS</span>

          <h1>Recurring Sample Commitments</h1>

          <p>
            Client-wise recurring testing requirements and expected monthly
            sample workload.
          </p>
        </div>

        <Link href="/admin" className="recurring-dashboard-btn">
          Dashboard
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* ===================================================
          CLICKABLE KPI CARDS
          =================================================== */}

      <section className="recurring-kpis">
        <RecurringMetric
          title="Recurring Samples / Month"
          value={String(totalSamplesPerMonth)}
          note="Active monthly commitment"
          icon={<FlaskConical size={24} />}
          tone="blue"
         href="/admin/recurring-services"
          active={!typeFilter && !locationsView && !clientsView}
        />

        <RecurringMetric
          title="Active Locations"
          value={String(activeLocationIds.size)}
          note={`${activeCompanies.size} active clients`}
          icon={<MapPin size={24} />}
          tone="purple"
          href="/admin/recurring-services?view=locations"
          active={locationsView}
        />

        <RecurringMetric
          title="Water Samples"
          value={String(waterSamples)}
          note="Monthly recurring volume"
          icon={<Droplets size={24} />}
          tone="cyan"
          href="/admin/recurring-services?type=water"
          active={typeFilter === "water"}
        />

        <RecurringMetric
          title="Food Samples"
          value={String(foodSamples)}
          note="Monthly recurring volume"
          icon={<Utensils size={24} />}
          tone="green"
          href="/admin/recurring-services?type=food"
          active={typeFilter === "food"}
        />

        <RecurringMetric
          title="Swab Samples"
          value={String(swabSamples)}
          note="Monthly recurring volume"
          icon={<Waves size={24} />}
          tone="amber"
          href="/admin/recurring-services?type=swab"
          active={typeFilter === "swab"}
        />

        <RecurringMetric
          title="Active Clients"
          value={String(activeCompanies.size)}
          note="Clients with recurring services"
          icon={<Building2 size={24} />}
          tone="blue"
          href="/admin/recurring-services?view=clients"
          active={clientsView}
        />
      </section>

      {/* ===================================================
          FILTER INFORMATION
          =================================================== */}

      {(typeFilter || locationsView || clientsView) && (
        <section className="recurring-filter-banner">
          <div>
            <span>FILTERED VIEW</span>

            <strong>{registerTitle}</strong>

            <small>
              {register.length} recurring{" "}
              {register.length === 1 ? "service" : "services"} ·{" "}
              {filteredSampleTotal} samples / month
            </small>
          </div>

          <Link href="/admin/recurring-services">
            <ArrowLeft size={14} />
            Show All
          </Link>
        </section>
      )}

      {/* ===================================================
          MONTHLY SAMPLE MIX
          =================================================== */}

      <section className="recurring-mix">
        <div className="recurring-mix-main">
          <div className="recurring-mix-heading">
            <span>MONTHLY SAMPLE MIX</span>

            <h2>{totalSamplesPerMonth} Samples</h2>

            <p>Expected workload from active recurring client commitments.</p>
          </div>

          <div className="recurring-mix-items">
            <MixItem
              label="Water"
              value={waterSamples}
              total={totalSamplesPerMonth}
            />

            <MixItem
              label="Food"
              value={foodSamples}
              total={totalSamplesPerMonth}
            />

            <MixItem
              label="Swabs"
              value={swabSamples}
              total={totalSamplesPerMonth}
            />

            {otherSamples > 0 && (
              <MixItem
                label="Other"
                value={otherSamples}
                total={totalSamplesPerMonth}
              />
            )}
          </div>
        </div>

        <div className="recurring-mix-total">
          <Repeat2 size={26} />

          <span>ACTIVE SERVICES</span>

          <strong>{activeServices.length}</strong>

          <small>Recurring service records</small>
        </div>
      </section>

      {/* ===================================================
          DATA REGISTER
          =================================================== */}

      <section className="recurring-panel">
        <div className="recurring-panel-header">
          <div className="recurring-panel-heading">
            <div className="recurring-panel-icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>OPERATIONS REGISTER</span>

              <h2>{registerTitle}</h2>

              <p>{registerDescription}</p>
            </div>
          </div>

          <div className="recurring-count">
            {register.length} {register.length === 1 ? "Service" : "Services"}
          </div>
        </div>

        {/* EMPTY */}

        {register.length === 0 ? (
          <div className="recurring-empty">
            <div className="recurring-empty-icon">
              <Repeat2 size={30} />
            </div>

            <h3>No recurring services found</h3>

            <p>There are no active recurring records matching this view.</p>

            <Link href="/admin/recurring-services">
              Show All Services
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* TABLE */

          <div className="recurring-table-wrap">
            <table className="recurring-table">
              <thead>
                <tr>
                  <th>Client</th>

                  <th>Location</th>

                  <th>Service</th>

                  <th>Sample Type</th>

                  <th className="number">Samples / Month</th>

                  <th>Frequency</th>

                  <th>Start</th>

                  <th>End</th>

                  <th>Status</th>

                  <th>View</th>
                </tr>
              </thead>

              <tbody>
                {register.map((service) => {
                  const company = companyMap.get(service.companyId);

                  const location = service.locationId
                    ? locationMap.get(service.locationId)
                    : undefined;

                  return (
                    <tr key={service.id}>
                      {/* CLIENT */}

                      <td>
                        {company ? (
                          <Link
                            href={`/admin/companies/${company.id}`}
                            className="recurring-client"
                          >
                            <span className="recurring-client-icon">
                              <Building2 size={14} />
                            </span>

                            <span>{company.name}</span>
                          </Link>
                        ) : (
                          <span className="recurring-muted">
                            Company unavailable
                          </span>
                        )}
                      </td>

                      {/* LOCATION */}

                      <td>
                        {location ? (
                          <div className="recurring-location">
                            <strong>{location.name}</strong>

                            <small>
                              {[location.city, location.state]
                                .filter(Boolean)
                                .join(", ") || "Location"}
                            </small>
                          </div>
                        ) : (
                          <span className="recurring-client-level">
                            Client Level
                          </span>
                        )}
                      </td>

                      {/* SERVICE */}

                      <td>
                        <span className="recurring-service-name">
                          {service.service || "—"}
                        </span>
                      </td>

                      {/* SAMPLE TYPE */}

                      <td>
                        <SampleTypeBadge
                          sampleType={service.sampleType}
                          category={getSampleCategory(service)}
                        />
                      </td>

                      {/* MONTHLY VOLUME */}

                      <td className="number">
                        <strong className="recurring-volume">
                          {Number(service.samplesPerMonth || 0)}
                        </strong>
                      </td>

                      {/* FREQUENCY */}

                      <td>
                        <span className="recurring-frequency">
                          {service.frequency || "—"}
                        </span>
                      </td>

                      {/* START DATE */}

                      <td>{formatDate(service.startDate)}</td>

                      {/* END DATE */}

                      <td>{formatDate(service.endDate)}</td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`recurring-status ${statusClass(
                            service.status,
                          )}`}
                        >
                          {service.status || "Active"}
                        </span>
                      </td>

                      {/* VIEW COMPANY */}

                      <td>
                        {company ? (
                          <Link
                            href={`/admin/companies/${company.id}`}
                            className="recurring-view"
                          >
                            View
                            <ArrowRight size={13} />
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===================================================
          DATA INFORMATION
          =================================================== */}

      <div className="recurring-note">
        <Repeat2 size={17} />

        <div>
          <strong>Live recurring operations data</strong>

          <span>
            Monthly workload is calculated from active recurring-service records
            and their Samples / Month values. Sample Type is used to classify
            Water, Food and Swab recurring volumes.
          </span>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CLICKABLE KPI
   ========================================================= */

function RecurringMetric({
  title,
  value,
  note,
  icon,
  tone,
  href,
  active = false,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  tone: "blue" | "purple" | "cyan" | "green" | "amber";
  href?: string;
  active?: boolean;
}) {
  const content = (
    <>
      <div className="recurring-kpi-icon">{icon}</div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{note}</small>
      </div>

      {href && (
        <div className="recurring-kpi-arrow" aria-hidden="true">
          →
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`recurring-kpi ${tone} recurring-kpi-clickable ${
          active ? "recurring-kpi-active" : ""
        }`}
        aria-label={`View ${title}`}
      >
        {content}
      </Link>
    );
  }

  return <article className={`recurring-kpi ${tone}`}>{content}</article>;
}

/* =========================================================
   SAMPLE TYPE BADGE
   ========================================================= */

function SampleTypeBadge({
  sampleType,
  category,
}: {
  sampleType: string;
  category: "water" | "food" | "swab" | "other";
}) {
  return (
    <span className={`recurring-sample-badge recurring-sample-${category}`}>
      {sampleType || "Other"}
    </span>
  );
}

/* =========================================================
   MIX ITEM
   ========================================================= */

function MixItem({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="recurring-mix-item">
      <div className="recurring-mix-label">
        <span>{label}</span>

        <strong>{value}</strong>
      </div>

      <div className="recurring-progress">
        <span
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      <small>{percentage.toFixed(1)}% of monthly workload</small>
    </div>
  );
}
