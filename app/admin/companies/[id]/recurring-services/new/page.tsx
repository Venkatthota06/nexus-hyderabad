"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FlaskConical,
  MapPin,
  Repeat2,
  Save,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import "../../operations-form.css";

type Location = {
  id: string;
  companyId: string;
  name: string;
  city: string | null;
  state: string | null;
  status: string;
};

export default function NewRecurringServicePage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();

  const companyId = params.id;

  const [locations, setLocations] =
    useState<Location[]>([]);

  const [locationId, setLocationId] =
    useState("");

  const [service, setService] =
    useState("");

  const [sampleType, setSampleType] =
    useState("");

  const [
    samplesPerMonth,
    setSamplesPerMonth,
  ] = useState("1");

  const [frequency, setFrequency] =
    useState("Monthly");

  const [status, setStatus] =
    useState("Active");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =========================================================
     LOAD THIS CLIENT'S LOCATIONS
  ========================================================= */

  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/locations?companyId=${encodeURIComponent(
            companyId
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load client locations."
          );
        }

        setLocations(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load locations."
        );
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      loadLocations();
    }
  }, [companyId]);

  /* =========================================================
     SAVE
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/recurring-services",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            companyId,
            locationId,
            service,
            sampleType,
            samplesPerMonth:
              Number(samplesPerMonth),
            frequency,
            status,
            startDate,
            endDate,
            notes,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create recurring service."
        );
      }

      setSuccess(
        "Recurring service created successfully."
      );

      setTimeout(() => {
        router.push(
          `/admin/companies/${companyId}`
        );

        router.refresh();
      }, 500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="operations-form-page">
      <header className="operations-form-topbar">
        <Link
          href={`/admin/companies/${companyId}`}
        >
          <ArrowLeft size={16} />
          Back to Client
        </Link>

        <span>
          Nexus Hyderabad Operations
        </span>
      </header>

      <section className="operations-form-hero">
        <div className="operations-form-hero-icon">
          <Repeat2 size={24} />
        </div>

        <div>
          <span>
            RECURRING OPERATIONS
          </span>

          <h1>
            Add Recurring Service
          </h1>

          <p>
            Configure the client's real
            recurring testing requirement
            and monthly sample commitment.
          </p>
        </div>
      </section>

      <form
        className="operations-form-card"
        onSubmit={handleSubmit}
      >
        {/* SERVICE */}

        <div className="operations-form-section">
          <div className="operations-form-section-heading">
            <div>
              <FlaskConical size={18} />

              <div>
                <h2>
                  Testing Requirement
                </h2>

                <p>
                  Define the actual recurring
                  service and sample volume.
                </p>
              </div>
            </div>
          </div>

          <div className="operations-form-grid">
            <div className="operations-field full">
              <label htmlFor="location">
                Client Location
              </label>

              <select
                id="location"
                value={locationId}
                disabled={loading}
                onChange={(event) =>
                  setLocationId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  No specific location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                      {location.city
                        ? ` - ${location.city}`
                        : ""}
                    </option>
                  )
                )}
              </select>

              {!loading &&
                locations.length === 0 && (
                  <small className="operations-field-help">
                    No client locations
                    available. You can still
                    create the recurring
                    service without a specific
                    location.
                  </small>
                )}
            </div>

            <div className="operations-field">
              <label htmlFor="service">
                Service *
              </label>

              <select
                id="service"
                required
                value={service}
                onChange={(event) =>
                  setService(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select service
                </option>

                <option value="Water Testing">
                  Water Testing
                </option>

                <option value="Food Testing">
                  Food Testing
                </option>

                <option value="Indoor Air Quality">
                  Indoor Air Quality
                </option>

                <option value="Ambient Air Quality">
                  Ambient Air Quality
                </option>

                <option value="Swab Testing">
                  Swab Testing
                </option>

                <option value="Environmental Monitoring">
                  Environmental Monitoring
                </option>

                <option value="Workplace Monitoring">
                  Workplace Monitoring
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="operations-field">
              <label htmlFor="sample-type">
                Sample Type *
              </label>

              <input
                id="sample-type"
                required
                value={sampleType}
                onChange={(event) =>
                  setSampleType(
                    event.target.value
                  )
                }
                placeholder="Example: RO Water"
              />
            </div>

            <div className="operations-field">
              <label htmlFor="samples-per-month">
                Samples / Month *
              </label>

              <input
                id="samples-per-month"
                required
                type="number"
                min="1"
                step="1"
                value={samplesPerMonth}
                onChange={(event) =>
                  setSamplesPerMonth(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field">
              <label htmlFor="frequency">
                Frequency
              </label>

              <select
                id="frequency"
                value={frequency}
                onChange={(event) =>
                  setFrequency(
                    event.target.value
                  )
                }
              >
                <option value="Monthly">
                  Monthly
                </option>

                <option value="Weekly">
                  Weekly
                </option>

                <option value="Fortnightly">
                  Fortnightly
                </option>

                <option value="Quarterly">
                  Quarterly
                </option>

                <option value="Half-Yearly">
                  Half-Yearly
                </option>

                <option value="Yearly">
                  Yearly
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* SCHEDULE */}

        <div className="operations-form-section">
          <div className="operations-form-section-heading">
            <div>
              <CalendarDays size={18} />

              <div>
                <h2>
                  Service Schedule
                </h2>

                <p>
                  Lifecycle and activation
                  dates for this recurring
                  requirement.
                </p>
              </div>
            </div>
          </div>

          <div className="operations-form-grid">
            <div className="operations-field">
              <label htmlFor="start-date">
                Start Date
              </label>

              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field">
              <label htmlFor="end-date">
                End Date
              </label>

              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

                <option value="On Hold">
                  On Hold
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>

            <div className="operations-field full">
              <label htmlFor="notes">
                Notes
              </label>

              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                placeholder="PO details, monthly schedule, special collection instructions, parameters or client requirements."
              />
            </div>
          </div>
        </div>

        {success && (
          <div className="operations-success">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {error && (
          <div className="operations-error">
            {error}
          </div>
        )}

        <div className="operations-form-actions">
          <Link
            href={`/admin/companies/${companyId}`}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
          >
            <Save size={16} />

            {saving
              ? "Saving Service..."
              : "Save Recurring Service"}
          </button>
        </div>
      </form>
    </main>
  );
}