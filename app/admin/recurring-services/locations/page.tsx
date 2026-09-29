import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Droplets,
  FlaskConical,
  MapPin,
  Package,
  RefreshCcw,
  TestTube2,
  Utensils,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./locations.css";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
   ========================================================= */

type Category = "water" | "food" | "swab";

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

/* =========================================================
   DATABASE
   ========================================================= */

async function getCompanies(): Promise<Company[]> {
  try {
    return (await db.orm.public.Company.all()) as Company[];
  } catch (error) {
    console.error(
      "Recurring locations getCompanies error:",
      error,
    );

    return [];
  }
}

async function getLocations(): Promise<Location[]> {
  try {
    return (await db.orm.public.Location.all()) as Location[];
  } catch (error) {
    console.error(
      "Recurring locations getLocations error:",
      error,
    );

    return [];
  }
}

async function getRecurringServices(): Promise<
  RecurringService[]
> {
  try {
    return (await db.orm.public.RecurringService.all()) as RecurringService[];
  } catch (error) {
    console.error(
      "Recurring locations getRecurringServices error:",
      error,
    );

    return [];
  }
}

/* =========================================================
   HELPERS
   ========================================================= */

function normalize(
  value: string | null | undefined,
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getCategoryFromText(
  value: string,
): Category | "other" {
  const text = normalize(value);

  if (text.includes("food")) {
    return "food";
  }

  if (text.includes("swab")) {
    return "swab";
  }

  if (
    text.includes("water") ||
    text === "ro"
  ) {
    return "water";
  }

  return "other";
}

function getRecurringCategory(
  record: RecurringService,
): Category | "other" {
  /*
    sampleType FIRST.

    This is important because imported records may contain:

    service = Water Testing
    sampleType = Food

    or

    service = Water Testing
    sampleType = Swab
  */

  const fromSampleType =
    getCategoryFromText(
      record.sampleType,
    );

  if (fromSampleType !== "other") {
    return fromSampleType;
  }

  return getCategoryFromText(
    record.service,
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default async function RecurringLocationsPage() {
  const [
    companies,
    locations,
    recurringServices,
  ] = await Promise.all([
    getCompanies(),
    getLocations(),
    getRecurringServices(),
  ]);

  /* =======================================================
     LOOKUPS
     ======================================================= */

  const companyMap = new Map(
    companies.map(
      (company) => [
        company.id,
        company,
      ],
    ),
  );

  const locationMap = new Map(
    locations.map(
      (location) => [
        location.id,
        location,
      ],
    ),
  );

  /* =======================================================
     ACTIVE RECURRING SERVICES
     ======================================================= */

  const activeRecurring =
    recurringServices.filter(
      (record) =>
        normalize(
          record.status,
        ) === "active",
    );

  /*
    Only records connected to a real Location are included
    in the location-wise operational table.

    Company-level recurring records with no locationId
    remain valid recurring work, but we should not invent
    a location for them.
  */

  const locationRecurring =
    activeRecurring.filter(
      (record) =>
        Boolean(
          record.locationId &&
            locationMap.has(
              record.locationId,
            ),
        ),
    );

  /* =======================================================
     ACTIVE LOCATION IDS
     ======================================================= */

  const activeLocationIds =
    new Set(
      locationRecurring
        .map(
          (record) =>
            record.locationId,
        )
        .filter(
          (
            id,
          ): id is string =>
            Boolean(id),
        ),
    );

  /* =======================================================
     ACTIVE COMPANY IDS
     ======================================================= */

  const activeCompanyIds =
    new Set(
      locationRecurring.map(
        (record) =>
          record.companyId,
      ),
    );

  /* =======================================================
     OVERALL MONTHLY COMMITMENT
     ======================================================= */

  const totalMonthlyCommitment =
    activeRecurring.reduce(
      (total, record) =>
        total +
        Number(
          record.samplesPerMonth ||
            0,
        ),
      0,
    );

  const waterCommitment =
    activeRecurring
      .filter(
        (record) =>
          getRecurringCategory(
            record,
          ) === "water",
      )
      .reduce(
        (total, record) =>
          total +
          Number(
            record.samplesPerMonth ||
              0,
          ),
        0,
      );

  const foodCommitment =
    activeRecurring
      .filter(
        (record) =>
          getRecurringCategory(
            record,
          ) === "food",
      )
      .reduce(
        (total, record) =>
          total +
          Number(
            record.samplesPerMonth ||
              0,
          ),
        0,
      );

  const swabCommitment =
    activeRecurring
      .filter(
        (record) =>
          getRecurringCategory(
            record,
          ) === "swab",
      )
      .reduce(
        (total, record) =>
          total +
          Number(
            record.samplesPerMonth ||
              0,
          ),
        0,
      );

  /* =======================================================
     LOCATION-WISE DATA
     ======================================================= */

  const locationRows =
    Array.from(activeLocationIds)
      .map((locationId) => {
        const location =
          locationMap.get(
            locationId,
          );

        if (!location) {
          return null;
        }

        const records =
          locationRecurring.filter(
            (record) =>
              record.locationId ===
              locationId,
          );

        const company =
          companyMap.get(
            location.companyId,
          );

        const water =
          records
            .filter(
              (record) =>
                getRecurringCategory(
                  record,
                ) === "water",
            )
            .reduce(
              (total, record) =>
                total +
                Number(
                  record.samplesPerMonth ||
                    0,
                ),
              0,
            );

        const food =
          records
            .filter(
              (record) =>
                getRecurringCategory(
                  record,
                ) === "food",
            )
            .reduce(
              (total, record) =>
                total +
                Number(
                  record.samplesPerMonth ||
                    0,
                ),
              0,
            );

        const swab =
          records
            .filter(
              (record) =>
                getRecurringCategory(
                  record,
                ) === "swab",
            )
            .reduce(
              (total, record) =>
                total +
                Number(
                  record.samplesPerMonth ||
                    0,
                ),
              0,
            );

        const total =
          water +
          food +
          swab;

        const frequencies =
          Array.from(
            new Set(
              records
                .map(
                  (record) =>
                    record.frequency,
                )
                .filter(Boolean),
            ),
          );

        const services =
          Array.from(
            new Set(
              records
                .map(
                  (record) =>
                    record.sampleType ||
                    record.service,
                )
                .filter(Boolean),
            ),
          );

        return {
          location,
          company,

          water,
          food,
          swab,
          total,

          frequencies,
          services,

          recurringRecords:
            records.length,
        };
      })
      .filter(
        (
          row,
        ): row is NonNullable<
          typeof row
        > => Boolean(row),
      )
      .sort(
        (a, b) =>
          b.total - a.total,
      );

  /* =======================================================
     UNASSIGNED RECURRING SERVICES
     ======================================================= */

  const unassignedRecurring =
    activeRecurring.filter(
      (record) =>
        !record.locationId ||
        !locationMap.has(
          record.locationId,
        ),
    );

  const unassignedCommitment =
    unassignedRecurring.reduce(
      (total, record) =>
        total +
        Number(
          record.samplesPerMonth ||
            0,
        ),
      0,
    );

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="locations-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="locations-header">

        <div>

          <Link
            href="/admin/recurring-services"
            className="locations-back"
          >
            <ArrowLeft size={15} />

            Recurring Samples
          </Link>

          <span className="locations-eyebrow">
            HYDERABAD OPERATIONS
          </span>

          <h1>
            Active Recurring Locations
          </h1>

          <p>
            Location-wise recurring testing
            commitments across active clients.
          </p>

        </div>

        <div className="locations-header-badge">

          <MapPin size={18} />

          <div>
            <span>
              Active Locations
            </span>

            <strong>
              {activeLocationIds.size}
            </strong>
          </div>

        </div>

      </header>

      {/* ===================================================
          KPI CARDS
          =================================================== */}

      <section className="locations-kpis">

        <LocationKpi
          title="Active Locations"
          value={
            activeLocationIds.size
          }
          note={`${activeCompanyIds.size} active clients`}
          icon={
            <MapPin size={23} />
          }
          tone="blue"
        />

        <LocationKpi
          title="Monthly Commitment"
          value={
            totalMonthlyCommitment
          }
          note="All recurring samples"
          icon={
            <RefreshCcw size={23} />
          }
          tone="navy"
        />

        <LocationKpi
          title="Water Samples"
          value={waterCommitment}
          note="Monthly recurring volume"
          icon={
            <Droplets size={23} />
          }
          tone="cyan"
        />

        <LocationKpi
          title="Food Samples"
          value={foodCommitment}
          note="Monthly recurring volume"
          icon={
            <Utensils size={23} />
          }
          tone="green"
        />

        <LocationKpi
          title="Swab Samples"
          value={swabCommitment}
          note="Monthly recurring volume"
          icon={
            <TestTube2 size={23} />
          }
          tone="orange"
        />

        <LocationKpi
          title="Active Clients"
          value={
            activeCompanyIds.size
          }
          note="With mapped locations"
          icon={
            <Building2 size={23} />
          }
          tone="purple"
        />

      </section>

      {/* ===================================================
          DATA QUALITY NOTICE
          =================================================== */}

      {unassignedCommitment > 0 && (
        <section className="locations-notice">

          <FlaskConical size={18} />

          <div>

            <strong>
              {unassignedCommitment} recurring
              samples are currently stored at
              company level.
            </strong>

            <p>
              They are included in the overall
              monthly commitment but are not
              assigned to a specific location,
              so they are not shown against an
              individual location below.
            </p>

          </div>

        </section>
      )}

      {/* ===================================================
          LOCATION TABLE
          =================================================== */}

      <section className="locations-section">

        <div className="locations-section-header">

          <div>

            <span>
              LOCATION PERFORMANCE
            </span>

            <h2>
              Active Recurring Locations
            </h2>

            <p>
              Complete recurring commitment
              by client location.
            </p>

          </div>

          <div className="locations-result-count">
            {locationRows.length} locations
          </div>

        </div>

        {locationRows.length === 0 ? (

          <div className="locations-empty">

            <MapPin size={34} />

            <h3>
              No mapped recurring locations
            </h3>

            <p>
              Active recurring services exist,
              but no location mapping was found.
            </p>

          </div>

        ) : (

          <div className="locations-table-wrap">

            <table className="locations-table">

              <thead>

                <tr>

                  <th>
                    Location
                  </th>

                  <th>
                    Client / Company
                  </th>

                  <th>
                    City
                  </th>

                  <th className="number">
                    Water
                  </th>

                  <th className="number">
                    Food
                  </th>

                  <th className="number">
                    Swab
                  </th>

                  <th className="number">
                    Total / Month
                  </th>

                  <th>
                    Frequency
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Details
                  </th>

                </tr>

              </thead>

              <tbody>

                {locationRows.map(
                  (row) => (

                    <tr
                      key={
                        row.location.id
                      }
                    >

                      {/* LOCATION */}

                      <td>

                        <div className="location-name">

                          <div className="location-icon">
                            <MapPin
                              size={15}
                            />
                          </div>

                          <div>

                            <strong>
                              {
                                row.location
                                  .name
                              }
                            </strong>

                            <span>
                              {row.services
                                .slice(0, 3)
                                .join(", ")}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* COMPANY */}

                      <td>

                        {row.company ? (

                          <Link
                            href={`/admin/companies/${row.company.id}`}
                            className="location-company"
                          >
                            <Building2
                              size={13}
                            />

                            {
                              row.company.name
                            }
                          </Link>

                        ) : (
                          "Unknown Company"
                        )}

                      </td>

                      {/* CITY */}

                      <td>

                        <div className="location-city">

                          <span>
                            {row.location.city ||
                              "—"}
                          </span>

                          {row.location.state && (
                            <small>
                              {
                                row.location
                                  .state
                              }
                            </small>
                          )}

                        </div>

                      </td>

                      {/* WATER */}

                      <td className="number">

                        <SampleCount
                          value={
                            row.water
                          }
                          type="water"
                        />

                      </td>

                      {/* FOOD */}

                      <td className="number">

                        <SampleCount
                          value={
                            row.food
                          }
                          type="food"
                        />

                      </td>

                      {/* SWAB */}

                      <td className="number">

                        <SampleCount
                          value={
                            row.swab
                          }
                          type="swab"
                        />

                      </td>

                      {/* TOTAL */}

                      <td className="number">

                        <strong className="location-total">
                          {row.total}
                        </strong>

                      </td>

                      {/* FREQUENCY */}

                      <td>

                        <div className="frequency-list">

                          {row.frequencies
                            .slice(0, 2)
                            .map(
                              (
                                frequency,
                              ) => (
                                <span
                                  key={
                                    frequency
                                  }
                                >
                                  {
                                    frequency
                                  }
                                </span>
                              ),
                            )}

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span className="location-status active">

                          <CheckCircle2
                            size={11}
                          />

                          Active

                        </span>

                      </td>

                      {/* DETAILS */}

                      <td>

                        {row.company ? (

                          <Link
                             href={`/admin/recurring-services/locations/${row.location.id}`}
                            className="location-view"
                          >
                            View

                            <ArrowRight
                              size={12}
                            />
                          </Link>

                        ) : (
                          "—"
                        )}

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* ===================================================
          LOCATION CARDS
          =================================================== */}

      <section className="locations-section">

        <div className="locations-section-header">

          <div>

            <span>
              OPERATIONAL VIEW
            </span>

            <h2>
              Location Workload
            </h2>

            <p>
              Quick operational overview of
              every recurring location.
            </p>

          </div>

        </div>

        <div className="location-card-grid">

          {locationRows.map(
            (row) => {

              const percentage =
                totalMonthlyCommitment >
                0
                  ? (row.total /
                      totalMonthlyCommitment) *
                    100
                  : 0;

              return (

                <article
                  key={
                    row.location.id
                  }
                  className="location-card"
                >

                  <div className="location-card-top">

                    <div className="location-card-pin">

                      <MapPin
                        size={19}
                      />

                    </div>

                    <span className="location-status active">
                      Active
                    </span>

                  </div>

                  <h3>
                    {row.location.name}
                  </h3>

                  <p>
                    {row.company?.name ||
                      "Unknown Company"}
                  </p>

                  <div className="location-address">

                    <MapPin
                      size={12}
                    />

                    <span>
                      {[
                        row.location.city,
                        row.location.state,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                        "Location details not available"}
                    </span>

                  </div>

                  <div className="location-card-total">

                    <span>
                      Monthly Commitment
                    </span>

                    <strong>
                      {row.total}
                    </strong>

                    <small>
                      samples / month
                    </small>

                  </div>

                  <div className="location-service-grid">

                    <div className="water">

                      <Droplets
                        size={14}
                      />

                      <span>
                        Water
                      </span>

                      <strong>
                        {row.water}
                      </strong>

                    </div>

                    <div className="food">

                      <Utensils
                        size={14}
                      />

                      <span>
                        Food
                      </span>

                      <strong>
                        {row.food}
                      </strong>

                    </div>

                    <div className="swab">

                      <TestTube2
                        size={14}
                      />

                      <span>
                        Swab
                      </span>

                      <strong>
                        {row.swab}
                      </strong>

                    </div>

                  </div>

                  <div className="location-workload">

                    <div>

                      <span>
                        Share of recurring
                        workload
                      </span>

                      <strong>
                        {percentage.toFixed(
                          1,
                        )}
                        %
                      </strong>

                    </div>

                    <div className="location-progress">

                      <span
                        style={{
                          width: `${Math.min(
                            percentage,
                            100,
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {row.company && (

                    <Link
                      href={`/admin/recurring-services/locations/${row.location.id}`}
                      className="location-card-link"
                    >
                      View Company Details

                      <ArrowRight
                        size={13}
                      />
                    </Link>

                  )}

                </article>

              );
            },
          )}

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   KPI
   ========================================================= */

function LocationKpi({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: number;
  note: string;
  icon: React.ReactNode;

  tone:
    | "blue"
    | "navy"
    | "cyan"
    | "green"
    | "orange"
    | "purple";
}) {
  return (
    <article
      className={`location-kpi ${tone}`}
    >

      <div className="location-kpi-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {note}
        </small>

      </div>

    </article>
  );
}

/* =========================================================
   SAMPLE COUNT
   ========================================================= */

function SampleCount({
  value,
  type,
}: {
  value: number;
  type: Category;
}) {
  return (
    <span
      className={`location-sample-count ${type}`}
    >
      {value}
    </span>
  );
}