"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CalendarDays,
  FileText,
  IndianRupee,
  Loader2,
  NotebookPen,
  Percent,
  Save,
  Send,
  Sparkles,
  TestTube2,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  status: string;
};

const statuses = [
  "Draft",
  "Sent",
  "Under Review",
  "Revised",
  "Accepted",
  "Rejected",
  "Expired",
];

export default function NewQuotationPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [companyId, setCompanyId] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");

  const [amount, setAmount] = useState("");
  const [gstPercent, setGstPercent] = useState("18");

  const [status, setStatus] = useState("Draft");

  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [sentDate, setSentDate] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD COMPANIES
  ========================================================= */

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/companies", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load companies."
          );
        }

        setCompanies(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load companies."
        );
      } finally {
        setLoadingCompanies(false);
      }
    }

    loadCompanies();
  }, []);

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const values = useMemo(() => {
    const base = Number(amount || 0);
    const gst = Number(gstPercent || 0);

    const gstAmount = (base * gst) / 100;
    const total = base + gstAmount;

    return {
      base,
      gstAmount,
      total,
    };
  }, [amount, gstPercent]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          quotationNumber,
          service,
          description,
          amount: Number(amount),
          gstPercent: Number(gstPercent),
          status,
          quotationDate,
          sentDate,
          nextFollowUp,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save quotation."
        );
      }

      router.push("/admin/quotations");
      router.refresh();
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
    <div className="quotation-form-page">
      {/* HEADER */}

      <header className="quotation-form-header">
        <div>
          <Link
            href="/admin/quotations"
            className="quotation-form-back"
          >
            <ArrowLeft size={14} />
            Back to Quotations
          </Link>

          <div className="quotation-form-eyebrow">
            <Sparkles size={12} />
            Business Proposal
          </div>

          <h1>Create Quotation</h1>

          <p>
            Prepare a professional service quotation for an
            existing company and track it through the sales
            pipeline.
          </p>
        </div>

        <div className="quotation-form-header-icon">
          <FileText size={25} />
        </div>
      </header>

      {error && (
        <div className="quotation-form-error">
          <FileText size={16} />

          <div>
            <strong>Quotation could not be processed</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="quotation-form-layout">
        {/* ===================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="quotation-form-main"
        >
          {/* CLIENT */}

          <FormSection
            icon={<Building2 size={18} />}
            eyebrow="Client"
            title="Company & Quotation"
            description="Select the client and define the quotation reference."
            type="blue"
          >
            <div className="quotation-form-grid two">
              <FormField
                label="Company"
                required
                icon={<Building2 size={14} />}
              >
                <select
                  value={companyId}
                  onChange={(e) =>
                    setCompanyId(e.target.value)
                  }
                  required
                  disabled={loadingCompanies}
                >
                  <option value="">
                    {loadingCompanies
                      ? "Loading companies..."
                      : "Select company"}
                  </option>

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name} — {company.status}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Quotation Number"
                required
                icon={<FileText size={14} />}
              >
                <input
                  type="text"
                  value={quotationNumber}
                  onChange={(e) =>
                    setQuotationNumber(e.target.value)
                  }
                  placeholder="NTL/HYD/2026/001"
                  required
                />
              </FormField>
            </div>

            <FormField
              label="Quotation Status"
              required
              icon={<Send size={14} />}
            >
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>
          </FormSection>

          {/* SERVICE */}

          <FormSection
            icon={<TestTube2 size={18} />}
            eyebrow="Scope"
            title="Service Details"
            description="Specify the testing service and quotation scope."
            type="purple"
          >
            <FormField
              label="Service"
              required
              icon={<TestTube2 size={14} />}
            >
              <input
                type="text"
                value={service}
                onChange={(e) =>
                  setService(e.target.value)
                }
                placeholder="Example: Water Testing"
                required
              />
            </FormField>

            <FormField
              label="Description"
              icon={<NotebookPen size={14} />}
            >
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={4}
                placeholder="Enter quotation scope, parameters, service details or other client requirements..."
              />
            </FormField>
          </FormSection>

          {/* PRICING */}

          <FormSection
            icon={<IndianRupee size={18} />}
            eyebrow="Commercial"
            title="Pricing & GST"
            description="Enter the base quotation value and applicable GST."
            type="green"
          >
            <div className="quotation-form-grid two">
              <FormField
                label="Base Amount"
                required
                icon={<IndianRupee size={14} />}
              >
                <div className="quotation-form-input-icon">
                  <IndianRupee size={14} />

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    min="0"
                    step="0.01"
                    placeholder="16000"
                    required
                  />
                </div>
              </FormField>

              <FormField
                label="GST Percentage"
                icon={<Percent size={14} />}
              >
                <div className="quotation-form-input-icon">
                  <Percent size={14} />

                  <input
                    type="number"
                    value={gstPercent}
                    onChange={(e) =>
                      setGstPercent(e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </FormField>
            </div>

            <div className="quotation-form-live-total">
              <div>
                <span>Base Value</span>
                <strong>
                  {formatCurrency(values.base)}
                </strong>
              </div>

              <div>
                <span>GST</span>
                <strong>
                  {formatCurrency(values.gstAmount)}
                </strong>
              </div>

              <div className="total">
                <span>Quotation Total</span>
                <strong>
                  {formatCurrency(values.total)}
                </strong>
              </div>
            </div>
          </FormSection>

          {/* DATES */}

          <FormSection
            icon={<CalendarDays size={18} />}
            eyebrow="Timeline"
            title="Dates & Follow-up"
            description="Track quotation preparation, sending and next follow-up."
            type="orange"
          >
            <div className="quotation-form-grid three">
              <FormField
                label="Quotation Date"
                required
                icon={<CalendarDays size={14} />}
              >
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(e) =>
                    setQuotationDate(e.target.value)
                  }
                  required
                />
              </FormField>

              <FormField
                label="Sent Date"
                icon={<Send size={14} />}
              >
                <input
                  type="date"
                  value={sentDate}
                  onChange={(e) =>
                    setSentDate(e.target.value)
                  }
                />
              </FormField>

              <FormField
                label="Next Follow-up"
                icon={<CalendarDays size={14} />}
              >
                <input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) =>
                    setNextFollowUp(e.target.value)
                  }
                />
              </FormField>
            </div>
          </FormSection>

          {/* NOTES */}

          <FormSection
            icon={<NotebookPen size={18} />}
            eyebrow="Internal"
            title="Quotation Notes"
            description="Add internal context or follow-up information."
            type="navy"
          >
            <FormField
              label="Notes"
              icon={<NotebookPen size={14} />}
            >
              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows={3}
                placeholder="Internal quotation notes..."
              />
            </FormField>
          </FormSection>

          {/* SAVE */}

          <div className="quotation-form-submit-wrap">
            <div>
              <strong>Ready to create quotation?</strong>
              <span>
                Confirm the information before saving.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving || loadingCompanies}
              className="quotation-form-submit"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              <span>
                {saving
                  ? "Saving Quotation..."
                  : "Create Quotation"}
              </span>

              {!saving && <ArrowRight size={15} />}
            </button>
          </div>
        </form>

        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <aside className="quotation-form-summary">
          <div className="quotation-form-summary-head">
            <div>
              <Calculator size={19} />
            </div>

            <span>
              <small>Live Calculation</small>
              <strong>Amount Summary</strong>
            </span>
          </div>

          <div className="quotation-form-summary-body">
            <SummaryRow
              label="Base Amount"
              value={formatCurrency(values.base)}
            />

            <SummaryRow
              label={`GST (${Number(
                gstPercent || 0
              )}%)`}
              value={formatCurrency(values.gstAmount)}
            />

            <div className="quotation-form-summary-total">
              <span>Total Amount</span>

              <strong>
                {formatCurrency(values.total)}
              </strong>

              <small>Including applicable GST</small>
            </div>
          </div>

          <div className="quotation-form-summary-info">
            <FileText size={15} />

            <p>
              Amounts update automatically when the base
              amount or GST percentage changes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function FormSection({
  icon,
  eyebrow,
  title,
  description,
  type,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  type: "blue" | "purple" | "green" | "orange" | "navy";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`quotation-form-section ${type}`}
    >
      <div className="quotation-form-section-head">
        <div className="quotation-form-section-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="quotation-form-section-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function FormField({
  label,
  required = false,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="quotation-form-field">
      <span className="quotation-form-label">
        {icon}
        {label}

        {required && <em>*</em>}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="quotation-form-summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}