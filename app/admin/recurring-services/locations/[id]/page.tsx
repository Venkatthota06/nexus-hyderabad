import Link from "next/link";

import MonthSelector from "../components/MonthSelector";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Droplets,
  FileText,
  FlaskConical,
  MapPin,
  RefreshCcw,
  TestTube2,
  Utensils,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./location-details.css";

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

type Sample = {
  id: string;
  companyId: string;
  locationId: string | null;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
 collectionDate: string | null;
collectionMonth: string | null;
collectedBy: string | null;
  status: string;
  reportStatus: string;
  createdAt: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    month?: string;
  }>;
};

/* =========================================================
   DATABASE
========================================================= */

async function getCompanies(): Promise<Company[]> {
  try {
    return (await db.orm.public.Company.all()) as Company[];
  } catch (error) {
    console.error("Location details getCompanies error:", error);
    return [];
  }
}

async function getLocations(): Promise<Location[]> {
  try {
    return (await db.orm.public.Location.all()) as Location[];
  } catch (error) {
    console.error("Location details getLocations error:", error);
    return [];
  }
}

async function getRecurringServices(): Promise<RecurringService[]> {
  try {
    return (await db.orm.public.RecurringService.all()) as RecurringService[];
  } catch (error) {
    console.error(
      "Location details getRecurringServices error:",
      error,
    );

    return [];
  }
}

async function getSamples(): Promise<Sample[]> {
  try {
    return (await db.orm.public.Sample.orderBy((sample) =>
      sample.createdAt.desc(),
    ).all()) as Sample[];
  } catch (error) {
    console.error("Location details getSamples error:", error);
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
  const fromSampleType =
    getCategoryFromText(record.sampleType);

  if (fromSampleType !== "other") {
    return fromSampleType;
  }

  return getCategoryFromText(record.service);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   PAGE
========================================================= */

export default async function LocationDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;

  const query = await searchParams;

  const [
    companies,
    locations,
    recurringServices,
    samples,
  ] = await Promise.all([
    getCompanies(),
    getLocations(),
    getRecurringServices(),
    getSamples(),
  ]);

  /* =======================================================
     LOCATION
  ======================================================= */

  const location = locations.find(
    (item) => item.id === id,
  );

  if (!location) {
    notFound();
  }

  /* =======================================================
     COMPANY
  ======================================================= */

  const company = companies.find(
    (item) =>
      item.id === location.companyId,
  );

  /* =======================================================
     LOCATION RECURRING SERVICES
  ======================================================= */

  const locationServices =
    recurringServices.filter(
      (record) =>
        record.locationId === location.id &&
        normalize(record.status) === "active",
    );

  /* =======================================================
     CATEGORY RECORDS
  ======================================================= */

  const waterRecords =
    locationServices.filter(
      (record) =>
        getRecurringCategory(record) ===
        "water",
    );

  const foodRecords =
    locationServices.filter(
      (record) =>
        getRecurringCategory(record) ===
        "food",
    );

  const swabRecords =
    locationServices.filter(
      (record) =>
        getRecurringCategory(record) ===
        "swab",
    );

  /* =======================================================
     MONTHLY COMMITMENTS
  ======================================================= */

  const waterCommitment =
    waterRecords.reduce(
      (total, record) =>
        total +
        Number(
          record.samplesPerMonth || 0,
        ),
      0,
    );

  const foodCommitment =
    foodRecords.reduce(
      (total, record) =>
        total +
        Number(
          record.samplesPerMonth || 0,
        ),
      0,
    );

  const swabCommitment =
    swabRecords.reduce(
      (total, record) =>
        total +
        Number(
          record.samplesPerMonth || 0,
        ),
      0,
    );

  const totalCommitment =
    waterCommitment +
    foodCommitment +
    swabCommitment;

  /* =======================================================
     SELECTED MONTH
  ======================================================= */

  const now = new Date();

  const defaultMonth =
    `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

  const selectedMonthValue =
    typeof query.month === "string" &&
    /^\d{4}-\d{2}$/.test(query.month)
      ? query.month
      : defaultMonth;

  const [
    selectedYearText,
    selectedMonthText,
  ] = selectedMonthValue.split("-");

  const selectedYear =
    Number(selectedYearText);

  const selectedMonth =
    Number(selectedMonthText) - 1;

  /* =======================================================
     LOCATION SAMPLES
  ======================================================= */

  const locationSamples =
    samples.filter(
      (sample) =>
        sample.locationId ===
        location.id,
    );

  /* =======================================================
     SELECTED MONTH COLLECTIONS
  ======================================================= */

  const currentMonthSamples =
  locationSamples.filter((sample) => {
    /*
     * New records use collectionMonth directly.
     *
     * This is the preferred source because some
     * collections may have a confirmed month even
     * when the exact collection date is unknown.
     */
    if (
      sample.collectionMonth &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(
        sample.collectionMonth
      )
    ) {
      return (
        sample.collectionMonth ===
        selectedMonthValue
      );
    }

    /*
     * Backward compatibility:
     *
     * Older sample records created before
     * collectionMonth was introduced may only
     * contain collectionDate.
     */
    if (!sample.collectionDate) {
      return false;
    }

    const date = new Date(
      sample.collectionDate
    );

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const sampleMonth =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    return sampleMonth === selectedMonthValue;
  });

  /*
   * The collection history uses the
   * exact same selected-month records
   * as the monthly performance KPIs.
   */
  const selectedMonthHistory =
    currentMonthSamples;

  /* =======================================================
     ACTUAL COLLECTION COUNTS
  ======================================================= */

  const collectedByCategory = (
    category: Category,
  ) =>
    currentMonthSamples
      .filter(
        (sample) =>
          getCategoryFromText(
            sample.sampleType,
          ) === category,
      )
      .reduce(
        (total, sample) =>
          total +
          Number(
            sample.sampleCount || 0,
          ),
        0,
      );

  const waterCollected =
    collectedByCategory("water");

  const foodCollected =
    collectedByCategory("food");

  const swabCollected =
    collectedByCategory("swab");

  const totalCollected =
    waterCollected +
    foodCollected +
    swabCollected;

  /* =======================================================
     REMAINING
  ======================================================= */

  const waterRemaining = Math.max(
    waterCommitment -
      waterCollected,
    0,
  );

  const foodRemaining = Math.max(
    foodCommitment -
      foodCollected,
    0,
  );

  const swabRemaining = Math.max(
    swabCommitment -
      swabCollected,
    0,
  );

  const totalRemaining = Math.max(
    totalCommitment -
      totalCollected,
    0,
  );

  /* =======================================================
     COMPLETION
  ======================================================= */

  const completionPercentage =
    totalCommitment > 0
      ? Math.min(
          (totalCollected /
            totalCommitment) *
            100,
          100,
        )
      : 0;

  const collectionMonthLabel =
    new Date(
      selectedYear,
      selectedMonth,
      1,
    ).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      },
    );

  /* =======================================================
     UNIQUE SERVICE INFORMATION
  ======================================================= */

  const frequencies =
    Array.from(
      new Set(
        locationServices
          .map(
            (record) =>
              record.frequency,
          )
          .filter(Boolean),
      ),
    );

  const serviceNames =
    Array.from(
      new Set(
        locationServices
          .map(
            (record) =>
              record.service,
          )
          .filter(Boolean),
      ),
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="location-details-page">

      {/* ===================================================
          BREADCRUMB
      =================================================== */}

      <div className="location-details-breadcrumb">
        <Link href="/admin/recurring-services">
          Recurring Samples
        </Link>

        <span>/</span>

        <Link href="/admin/recurring-services/locations">
          Locations
        </Link>

        <span>/</span>

        <strong>
          {location.name}
        </strong>
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="location-details-header">
        <div>
          <Link
            href="/admin/recurring-services/locations"
            className="location-details-back"
          >
            <ArrowLeft size={14} />

            All Locations
          </Link>

          <span className="location-details-eyebrow">
            RECURRING LOCATION PROFILE
          </span>

          <h1>{location.name}</h1>

          <div className="location-details-company">
            <Building2 size={14} />

            {company ? (
              <Link
                href={`/admin/companies/${company.id}`}
              >
                {company.name}
              </Link>
            ) : (
              <span>
                Unknown Company
              </span>
            )}
          </div>

          <div className="location-details-address">
            <MapPin size={13} />

            <span>
              {[
                location.city,
                location.state,
              ]
                .filter(Boolean)
                .join(", ") ||
                "Location information not available"}
            </span>
          </div>
        </div>

        <div className="location-details-status">
          <CheckCircle2 size={16} />

          <div>
            <span>
              Location Status
            </span>

            <strong>
              {location.status ||
                "Active"}
            </strong>
          </div>
        </div>
      </header>

      {/* ===================================================
          KPI CARDS
      =================================================== */}

      <section className="location-details-kpis">
        <DetailKpi
          title="Monthly Commitment"
          value={totalCommitment}
          note="Total samples / month"
          icon={
            <RefreshCcw
              size={22}
            />
          }
          tone="navy"
        />

        <DetailKpi
          title="Water"
          value={waterCommitment}
          note="Monthly samples"
          icon={
            <Droplets
              size={22}
            />
          }
          tone="water"
        />

        <DetailKpi
          title="Food"
          value={foodCommitment}
          note="Monthly samples"
          icon={
            <Utensils
              size={22}
            />
          }
          tone="food"
        />

        <DetailKpi
          title="Swabs"
          value={swabCommitment}
          note="Monthly samples"
          icon={
            <TestTube2
              size={22}
            />
          }
          tone="swab"
        />

        <DetailKpi
          title="Active Services"
          value={
            locationServices.length
          }
          note="Recurring service records"
          icon={
            <FlaskConical
              size={22}
            />
          }
          tone="purple"
        />
      </section>

      {/* ===================================================
          MONTHLY COLLECTION PERFORMANCE
      =================================================== */}

      <section className="location-details-section location-monthly-performance">

        <div className="location-details-section-heading location-performance-heading">

          <div className="location-month-header">

            <div className="location-month-title">
              <span>
                MONTHLY PERFORMANCE
              </span>

              <h2>
                Commitment vs Collection
              </h2>

              <p>
                Actual samples
                collected at this
                location during{" "}
                <strong>
                  {
                    collectionMonthLabel
                  }
                </strong>
                .
              </p>
            </div>

            <MonthSelector
              selectedMonth={
                selectedMonthValue
              }
            />

          </div>

          <div className="location-completion-badge">
            <span className="location-completion-dot" />

            {completionPercentage.toFixed(
              1,
            )}
            % complete
          </div>

        </div>

        {/* PERFORMANCE KPI CARDS */}

        <div className="location-performance-summary">

          <div className="location-performance-card">
            <div className="location-performance-card-icon commitment">
              📋
            </div>

            <PerformanceMetric
              label="Monthly Commitment"
              value={
                totalCommitment
              }
            />
          </div>

          <div className="location-performance-card">
            <div className="location-performance-card-icon collected">
              ✓
            </div>

            <PerformanceMetric
              label="Collected This Month"
              value={
                totalCollected
              }
            />
          </div>

          <div className="location-performance-card">
            <div className="location-performance-card-icon remaining">
              ◷
            </div>

            <PerformanceMetric
              label="Remaining"
              value={
                totalRemaining
              }
            />
          </div>

          <div className="location-performance-card">
            <div className="location-performance-card-icon completion">
              %
            </div>

            <PerformanceMetric
              label="Completion"
              value={`${completionPercentage.toFixed(
                1,
              )}%`}
            />
          </div>

        </div>

        {/* SERVICE BREAKDOWN */}

        <div className="location-performance-breakdown">

          <div className="location-performance-breakdown-heading">
            <div>
              <span>
                SERVICE BREAKDOWN
              </span>

              <h3>
                Collection Progress by
                Category
              </h3>
            </div>

            <p>
              {collectionMonthLabel}
            </p>
          </div>

          <div className="location-service-table-wrap">
            <table className="location-service-table">
              <thead>
                <tr>
                  <th>
                    Category
                  </th>

                  <th className="number">
                    Planned
                  </th>

                  <th className="number">
                    Collected
                  </th>

                  <th className="number">
                    Remaining
                  </th>
                </tr>
              </thead>

              <tbody>
                <PerformanceRow
                  label="Water"
                  planned={
                    waterCommitment
                  }
                  collected={
                    waterCollected
                  }
                  remaining={
                    waterRemaining
                  }
                  category="water"
                />

                <PerformanceRow
                  label="Food"
                  planned={
                    foodCommitment
                  }
                  collected={
                    foodCollected
                  }
                  remaining={
                    foodRemaining
                  }
                  category="food"
                />

                <PerformanceRow
                  label="Swabs"
                  planned={
                    swabCommitment
                  }
                  collected={
                    swabCollected
                  }
                  remaining={
                    swabRemaining
                  }
                  category="swab"
                />
              </tbody>
            </table>
          </div>

        </div>

      </section>

      {/* ===================================================
          WORKLOAD BREAKDOWN
      =================================================== */}

      <section className="location-details-section">

        <div className="location-details-section-heading">
          <div>
            <span>
              MONTHLY WORKLOAD
            </span>

            <h2>
              Sample Commitment
            </h2>

            <p>
              Recurring testing workload
              assigned specifically to
              this location.
            </p>
          </div>
        </div>

        <div className="location-workload-breakdown">

          <WorkloadCard
            title="Water"
            value={
              waterCommitment
            }
            total={
              totalCommitment
            }
            icon={
              <Droplets
                size={20}
              />
            }
            tone="water"
          />

          <WorkloadCard
            title="Food"
            value={
              foodCommitment
            }
            total={
              totalCommitment
            }
            icon={
              <Utensils
                size={20}
              />
            }
            tone="food"
          />

          <WorkloadCard
            title="Swabs"
            value={
              swabCommitment
            }
            total={
              totalCommitment
            }
            icon={
              <TestTube2
                size={20}
              />
            }
            tone="swab"
          />

        </div>

      </section>

      {/* ===================================================
          LOCATION INFORMATION
      =================================================== */}

      <section className="location-details-grid">

        <article className="location-info-card">

          <div className="location-info-heading">
            <MapPin size={17} />

            <div>
              <span>
                LOCATION
              </span>

              <h2>
                Location Information
              </h2>
            </div>
          </div>

          <InfoRow
            label="Location Name"
            value={
              location.name
            }
          />

          <InfoRow
            label="City"
            value={
              location.city ||
              "—"
            }
          />

          <InfoRow
            label="State"
            value={
              location.state ||
              "—"
            }
          />

          <InfoRow
            label="Status"
            value={
              location.status ||
              "Active"
            }
          />

          <InfoRow
            label="Recurring Records"
            value={String(
              locationServices.length,
            )}
          />

        </article>

        <article className="location-info-card">

          <div className="location-info-heading">
            <Building2 size={17} />

            <div>
              <span>
                CLIENT
              </span>

              <h2>
                Company Information
              </h2>
            </div>
          </div>

          <InfoRow
            label="Company"
            value={
              company?.name ||
              "Unknown Company"
            }
          />

          <InfoRow
            label="Company Status"
            value={
              company?.status ||
              "—"
            }
          />

          <InfoRow
            label="Frequency"
            value={
              frequencies.length >
              0
                ? frequencies.join(
                    ", ",
                  )
                : "—"
            }
          />

          <InfoRow
            label="Services"
            value={
              serviceNames.length >
              0
                ? serviceNames.join(
                    ", ",
                  )
                : "—"
            }
          />

          {company && (
            <Link
              href={`/admin/companies/${company.id}`}
              className="location-company-button"
            >
              Open Company Profile

              <ArrowRight
                size={13}
              />
            </Link>
          )}

        </article>

      </section>

      {/* ===================================================
          RECURRING SERVICE RECORDS
      =================================================== */}

      <section className="location-details-section">

        <div className="location-details-section-heading">

          <div>
            <span>
              SERVICE CONFIGURATION
            </span>

            <h2>
              Recurring Services
            </h2>

            <p>
              All active recurring
              services configured for
              this location.
            </p>
          </div>

          <div className="location-record-count">
            {locationServices.length}{" "}
            records
          </div>

        </div>

        {locationServices.length ===
        0 ? (
          <div className="location-details-empty">

            <FlaskConical
              size={30}
            />

            <h3>
              No recurring services
            </h3>

            <p>
              There are currently no
              active recurring services
              mapped to this location.
            </p>

          </div>
        ) : (
          <div className="location-service-table-wrap">

            <table className="location-service-table">

              <thead>
                <tr>
                  <th>
                    Sample Type
                  </th>

                  <th>
                    Service
                  </th>

                  <th>
                    Category
                  </th>

                  <th className="number">
                    Samples / Month
                  </th>

                  <th>
                    Frequency
                  </th>

                  <th>
                    Start Date
                  </th>

                  <th>
                    End Date
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {locationServices.map(
                  (record) => {
                    const category =
                      getRecurringCategory(
                        record,
                      );

                    return (
                      <tr
                        key={
                          record.id
                        }
                      >
                        <td>
                          <strong>
                            {record.sampleType ||
                              "—"}
                          </strong>
                        </td>

                        <td>
                          {record.service ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`location-category ${category}`}
                          >
                            {category ===
                            "water"
                              ? "Water"
                              : category ===
                                  "food"
                                ? "Food"
                                : category ===
                                    "swab"
                                  ? "Swab"
                                  : "Other"}
                          </span>
                        </td>

                        <td className="number">
                          <strong className="monthly-count">
                            {
                              record.samplesPerMonth
                            }
                          </strong>
                        </td>

                        <td>
                          <span className="location-frequency">
                            {record.frequency ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            record.startDate,
                          )}
                        </td>

                        <td>
                          {formatDate(
                            record.endDate,
                          )}
                        </td>

                        <td>
                          <span className="location-active-status">
                            <CheckCircle2
                              size={
                                10
                              }
                            />

                            {
                              record.status
                            }
                          </span>
                        </td>

                      </tr>
                    );
                  },
                )}
              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ===================================================
          NOTES
      =================================================== */}

      {locationServices.some(
        (record) =>
          Boolean(record.notes),
      ) && (
        <section className="location-details-section">

          <div className="location-details-section-heading">
            <div>
              <span>
                OPERATIONAL NOTES
              </span>

              <h2>
                Service Notes
              </h2>
            </div>
          </div>

          <div className="location-notes-grid">

            {locationServices
              .filter(
                (record) =>
                  Boolean(
                    record.notes,
                  ),
              )
              .map((record) => (
                <article
                  key={record.id}
                  className="location-note"
                >
                  <FileText
                    size={15}
                  />

                  <div>
                    <strong>
                      {record.sampleType ||
                        record.service}
                    </strong>

                    <p>
                      {record.notes}
                    </p>
                  </div>
                </article>
              ))}

          </div>

        </section>
      )}

      {/* ===================================================
          ACTUAL COLLECTION HISTORY — SELECTED MONTH
      =================================================== */}

      <section className="location-details-section">

        <div className="location-details-section-heading">

          <div>
            <span>
              ACTUAL COLLECTION HISTORY
            </span>

            <h2>
              Collected Samples
            </h2>

            <p>
              Samples collected at this
              location during{" "}
              <strong>
                {
                  collectionMonthLabel
                }
              </strong>
              .
            </p>
          </div>

          <div className="location-record-count">
            {
              selectedMonthHistory.length
            }{" "}
            {selectedMonthHistory.length ===
            1
              ? "record"
              : "records"}
          </div>

        </div>

        {selectedMonthHistory.length ===
        0 ? (
          <div className="location-details-empty">

            <CalendarDays
              size={30}
            />

            <h3>
              No collections in{" "}
              {
                collectionMonthLabel
              }
            </h3>

            <p>
              No samples were collected
              at this location during{" "}
              {
                collectionMonthLabel
              }
              .
            </p>

          </div>
        ) : (
          <div className="location-service-table-wrap">

            <table className="location-service-table">

              <thead>
                <tr>
                  <th>
                    Collection Date
                  </th>

                  <th>
                    Sample Number
                  </th>

                  <th>
                    Sample Type
                  </th>

                  <th className="number">
                    Qty
                  </th>

                  <th>
                    Collected By
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Report
                  </th>
                </tr>
              </thead>

              <tbody>
                {selectedMonthHistory.map(
                  (sample) => {
                    const category =
                      getCategoryFromText(
                        sample.sampleType,
                      );

                    return (
                      <tr
                        key={
                          sample.id
                        }
                      >
                        <td>
                          {formatDate(
                            sample.collectionDate,
                          )}
                        </td>

                        <td>
                          <strong>
                            {
                              sample.sampleNumber
                            }
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`location-category ${category}`}
                          >
                            {sample.sampleType ||
                              "—"}
                          </span>
                        </td>

                        <td className="number">
                          <strong className="monthly-count">
                            {
                              sample.sampleCount
                            }
                          </strong>
                        </td>

                        <td>
                          {sample.collectedBy ||
                            "—"}
                        </td>

                        <td>
                          <span className="location-frequency">
                            {sample.status ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {sample.reportStatus ||
                            "—"}
                        </td>

                      </tr>
                    );
                  },
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
   KPI COMPONENT
========================================================= */

function DetailKpi({
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
    | "navy"
    | "water"
    | "food"
    | "swab"
    | "purple";
}) {
  return (
    <article
      className={`location-detail-kpi ${tone}`}
    >
      <div className="location-detail-kpi-icon">
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
   WORKLOAD CARD
========================================================= */

function WorkloadCard({
  title,
  value,
  total,
  icon,
  tone,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  tone:
    | "water"
    | "food"
    | "swab";
}) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <article
      className={`location-workload-card ${tone}`}
    >
      <div className="location-workload-icon">
        {icon}
      </div>

      <div className="location-workload-content">

        <div className="location-workload-title">
          <span>
            {title}
          </span>

          <strong>
            {value}
          </strong>
        </div>

        <small>
          {percentage.toFixed(1)}% of
          location workload
        </small>

        <div className="location-workload-progress">
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
    </article>
  );
}

/* =========================================================
   PERFORMANCE METRIC
========================================================= */

function PerformanceMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <article className="location-performance-metric">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </article>
  );
}

/* =========================================================
   PERFORMANCE ROW
========================================================= */

function PerformanceRow({
  label,
  planned,
  collected,
  remaining,
  category,
}: {
  label: string;
  planned: number;
  collected: number;
  remaining: number;
  category: Category;
}) {
  return (
    <tr>
      <td>
        <span
          className={`location-category ${category}`}
        >
          {label}
        </span>
      </td>

      <td className="number">
        <strong>
          {planned}
        </strong>
      </td>

      <td className="number">
        <strong>
          {collected}
        </strong>
      </td>

      <td className="number">
        <strong>
          {remaining}
        </strong>
      </td>
    </tr>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="location-info-row">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}