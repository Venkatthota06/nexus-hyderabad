"use client";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  IndianRupee,
  Save,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import "../../operations-form.css";

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NewWorkOrderPage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();

  const companyId = params.id;

  const [
    quotations,
    setQuotations,
  ] = useState<Quotation[]>([]);

  const [
    quotationId,
    setQuotationId,
  ] = useState("");

  const [
    workOrderNumber,
    setWorkOrderNumber,
  ] = useState("");

  const [service, setService] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  const [gstPercent, setGstPercent] =
    useState("18");

  const [status, setStatus] =
    useState("Confirmed");

  const [
    confirmedDate,
    setConfirmedDate,
  ] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [
    expectedStart,
    setExpectedStart,
  ] = useState("");

  const [
    expectedEnd,
    setExpectedEnd,
  ] = useState("");

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
     LOAD QUOTATIONS
  ========================================================= */

  useEffect(() => {
    async function loadQuotations() {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/quotations",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load quotations."
          );
        }

        const clientQuotations =
          Array.isArray(data)
            ? data.filter(
                (quotation: Quotation) =>
                  quotation.companyId ===
                  companyId
              )
            : [];

        setQuotations(
          clientQuotations
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load quotations."
        );
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      loadQuotations();
    }
  }, [companyId]);

  /* =========================================================
     SELECT QUOTATION
  ========================================================= */

  function handleQuotationChange(
    value: string
  ) {
    setQuotationId(value);

    if (!value) {
      return;
    }

    const quotation =
      quotations.find(
        (item) => item.id === value
      );

    if (!quotation) {
      return;
    }

    setService(
      quotation.service || ""
    );

    setAmount(
      String(
        Number(
          quotation.amount || 0
        )
      )
    );

    setGstPercent(
      String(
        Number(
          quotation.gstPercent ?? 18
        )
      )
    );
  }

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const calculations = useMemo(() => {
    const base =
      Number(amount) || 0;

    const gst =
      Number(gstPercent) || 0;

    const gstAmount =
      base * (gst / 100);

    return {
      base,
      gstAmount,
      total:
        base + gstAmount,
    };
  }, [amount, gstPercent]);

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
        "/api/work-orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            companyId,
            quotationId,
            workOrderNumber,
            service,
            description,
            amount:
              Number(amount),
            gstPercent:
              Number(gstPercent),
            status,
            confirmedDate,
            expectedStart,
            expectedEnd,
            notes,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create work order."
        );
      }

      setSuccess(
        "Confirmed order created successfully."
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
          <BriefcaseBusiness size={24} />
        </div>

        <div>
          <span>
            CONFIRMED BUSINESS
          </span>

          <h1>
            Add Work Order
          </h1>

          <p>
            Record an approved quotation,
            purchase order or confirmed
            testing assignment.
          </p>
        </div>
      </section>

      <form
        className="operations-form-card"
        onSubmit={handleSubmit}
      >
        {/* ORDER INFORMATION */}

        <div className="operations-form-section">
          <div className="operations-form-section-heading">
            <div>
              <FileText size={18} />

              <div>
                <h2>
                  Order Information
                </h2>

                <p>
                  Link the confirmed work
                  with an existing quotation
                  where applicable.
                </p>
              </div>
            </div>
          </div>

          <div className="operations-form-grid">
            <div className="operations-field full">
              <label htmlFor="quotation">
                Linked Quotation
              </label>

              <select
                id="quotation"
                value={quotationId}
                disabled={loading}
                onChange={(event) =>
                  handleQuotationChange(
                    event.target.value
                  )
                }
              >
                <option value="">
                  No linked quotation
                </option>

                {quotations.map(
                  (quotation) => (
                    <option
                      key={quotation.id}
                      value={quotation.id}
                    >
                      {
                        quotation.quotationNumber
                      }
                      {" — "}
                      {quotation.service}
                      {" — "}
                      {money(
                        quotation.totalAmount
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="operations-field">
              <label htmlFor="order-number">
                Work Order / PO Number *
              </label>

              <input
                id="order-number"
                required
                value={workOrderNumber}
                onChange={(event) =>
                  setWorkOrderNumber(
                    event.target.value
                  )
                }
                placeholder="Enter actual PO / WO / confirmation reference"
              />
            </div>

            <div className="operations-field">
              <label htmlFor="status">
                Order Status
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
                <option value="Confirmed">
                  Confirmed
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="On Hold">
                  On Hold
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="operations-field full">
              <label htmlFor="service">
                Service *
              </label>

              <input
                id="service"
                required
                value={service}
                onChange={(event) =>
                  setService(
                    event.target.value
                  )
                }
                placeholder="Water Analysis, IAQ, Food Testing, etc."
              />
            </div>

            <div className="operations-field full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Scope of confirmed work"
              />
            </div>
          </div>
        </div>

        {/* COMMERCIALS */}

        <div className="operations-form-section">
          <div className="operations-form-section-heading">
            <div>
              <IndianRupee size={18} />

              <div>
                <h2>
                  Commercial Value
                </h2>

                <p>
                  Base value, GST and final
                  confirmed business amount.
                </p>
              </div>
            </div>
          </div>

          <div className="operations-form-grid">
            <div className="operations-field">
              <label htmlFor="amount">
                Base Amount *
              </label>

              <input
                id="amount"
                required
                min="0"
                step="0.01"
                type="number"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="0"
              />
            </div>

            <div className="operations-field">
              <label htmlFor="gst">
                GST %
              </label>

              <input
                id="gst"
                min="0"
                step="0.01"
                type="number"
                value={gstPercent}
                onChange={(event) =>
                  setGstPercent(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="operations-value-summary">
            <div>
              <span>
                Base Amount
              </span>

              <strong>
                {money(
                  calculations.base
                )}
              </strong>
            </div>

            <div>
              <span>
                GST Amount
              </span>

              <strong>
                {money(
                  calculations.gstAmount
                )}
              </strong>
            </div>

            <div className="total">
              <span>
                Confirmed Value
              </span>

              <strong>
                {money(
                  calculations.total
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* DATES */}

        <div className="operations-form-section">
          <div className="operations-form-section-heading">
            <div>
              <CalendarDays size={18} />

              <div>
                <h2>
                  Order Schedule
                </h2>

                <p>
                  Confirmation and expected
                  execution dates.
                </p>
              </div>
            </div>
          </div>

          <div className="operations-form-grid">
            <div className="operations-field">
              <label htmlFor="confirmed-date">
                Confirmed Date *
              </label>

              <input
                id="confirmed-date"
                required
                type="date"
                value={confirmedDate}
                onChange={(event) =>
                  setConfirmedDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field">
              <label htmlFor="expected-start">
                Expected Start
              </label>

              <input
                id="expected-start"
                type="date"
                value={expectedStart}
                onChange={(event) =>
                  setExpectedStart(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field">
              <label htmlFor="expected-end">
                Expected Completion
              </label>

              <input
                id="expected-end"
                type="date"
                value={expectedEnd}
                onChange={(event) =>
                  setExpectedEnd(
                    event.target.value
                  )
                }
              />
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
                placeholder="PO conditions, payment terms, collection schedule or internal notes."
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
              ? "Saving Order..."
              : "Save Confirmed Order"}
          </button>
        </div>
      </form>
    </main>
  );
}