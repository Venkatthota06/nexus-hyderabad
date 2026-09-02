"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Hash,
  IndianRupee,
  Loader2,
  NotebookPen,
  Percent,
  Save,
  Sparkles,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  status: string;
};

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  description: string | null;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  quotationDate: string;
  sentDate: string | null;
  nextFollowUp: string | null;
  notes: string | null;
};

const quotationStatuses = [
  "Draft",
  "Sent",
  "Under Review",
  "Revised",
  "Accepted",
  "Rejected",
  "Expired",
];

function dateInputValue(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const quotationId =
    params.id as string;

  const [
    companies,
    setCompanies,
  ] = useState<Company[]>([]);

  const [
    quotation,
    setQuotation,
  ] = useState<Quotation | null>(
    null
  );

  const [
    companyId,
    setCompanyId,
  ] = useState("");

  const [
    quotationNumber,
    setQuotationNumber,
  ] = useState("");

  const [
    service,
    setService,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    gstPercent,
    setGstPercent,
  ] = useState("18");

  const [
    status,
    setStatus,
  ] = useState("Draft");

  const [
    quotationDate,
    setQuotationDate,
  ] = useState("");

  const [
    sentDate,
    setSentDate,
  ] = useState("");

  const [
    nextFollowUp,
    setNextFollowUp,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =========================================================
     LOAD QUOTATION + COMPANIES
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          quotationResponse,
          companyResponse,
        ] = await Promise.all([
          fetch(
            "/api/quotations",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/companies",
            {
              cache: "no-store",
            }
          ),
        ]);

        const quotationData =
          await quotationResponse.json();

        const companyData =
          await companyResponse.json();

        if (!quotationResponse.ok) {
          throw new Error(
            quotationData.error ||
              quotationData.message ||
              "Unable to load quotations."
          );
        }

        if (!companyResponse.ok) {
          throw new Error(
            companyData.error ||
              companyData.message ||
              "Unable to load companies."
          );
        }

        if (
          !Array.isArray(
            quotationData
          )
        ) {
          throw new Error(
            "Invalid quotation data received."
          );
        }

        if (
          !Array.isArray(companyData)
        ) {
          throw new Error(
            "Invalid company data received."
          );
        }

        const selectedQuotation =
          quotationData.find(
            (
              item: Quotation
            ) =>
              item.id ===
              quotationId
          );

        if (
          !selectedQuotation
        ) {
          throw new Error(
            "Quotation not found."
          );
        }

        setCompanies(
          companyData
        );

        setQuotation(
          selectedQuotation
        );

        setCompanyId(
          selectedQuotation.companyId
        );

        setQuotationNumber(
          selectedQuotation.quotationNumber
        );

        setService(
          selectedQuotation.service
        );

        setDescription(
          selectedQuotation.description ||
            ""
        );

        setAmount(
          String(
            selectedQuotation.amount
          )
        );

        setGstPercent(
          String(
            selectedQuotation.gstPercent
          )
        );

        setStatus(
          selectedQuotation.status
        );

        setQuotationDate(
          dateInputValue(
            selectedQuotation.quotationDate
          )
        );

        setSentDate(
          dateInputValue(
            selectedQuotation.sentDate
          )
        );

        setNextFollowUp(
          dateInputValue(
            selectedQuotation.nextFollowUp
          )
        );

        setNotes(
          selectedQuotation.notes ||
            ""
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );

        setQuotation(null);
      } finally {
        setLoading(false);
      }
    }

    if (quotationId) {
      loadData();
    }
  }, [quotationId]);

  /* =========================================================
     LIVE AMOUNT CALCULATION
  ========================================================= */

  const calculatedValues =
    useMemo(() => {
      const baseAmount =
        Number(amount || 0);

      const gst =
        Number(
          gstPercent || 0
        );

      const gstAmount =
        (baseAmount * gst) /
        100;

      const totalAmount =
        baseAmount +
        gstAmount;

      return {
        baseAmount,
        gstAmount,
        totalAmount,
      };
    }, [
      amount,
      gstPercent,
    ]);

  function formatCurrency(
    value: number
  ) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits:
          2,
      }
    ).format(value);
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function handleStatusChange(
    newStatus: string
  ) {
    setStatus(newStatus);

    if (
      newStatus === "Accepted" ||
      newStatus === "Rejected" ||
      newStatus === "Expired"
    ) {
      setNextFollowUp("");
    }
  }

  const followUpDisabled =
    status === "Accepted" ||
    status === "Rejected" ||
    status === "Expired";

  /* =========================================================
     UPDATE
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/quotations",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                id: quotationId,
                companyId,
                quotationNumber,
                service,
                description,

                amount:
                  Number(
                    amount
                  ),

                gstPercent:
                  Number(
                    gstPercent
                  ),

                status,
                quotationDate,
                sentDate,
                nextFollowUp,
                notes,
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to update quotation."
        );
      }

      const updatedQuotation =
        data as Quotation;

      if (
        !updatedQuotation ||
        !updatedQuotation.id
      ) {
        throw new Error(
          "Updated quotation data was not returned correctly."
        );
      }

      setQuotation(
        updatedQuotation
      );

      setCompanyId(
        updatedQuotation.companyId
      );

      setQuotationNumber(
        updatedQuotation.quotationNumber
      );

      setService(
        updatedQuotation.service
      );

      setDescription(
        updatedQuotation.description ||
          ""
      );

      setAmount(
        String(
          updatedQuotation.amount
        )
      );

      setGstPercent(
        String(
          updatedQuotation.gstPercent
        )
      );

      setStatus(
        updatedQuotation.status
      );

      setQuotationDate(
        dateInputValue(
          updatedQuotation.quotationDate
        )
      );

      setSentDate(
        dateInputValue(
          updatedQuotation.sentDate
        )
      );

      setNextFollowUp(
        dateInputValue(
          updatedQuotation.nextFollowUp
        )
      );

      setNotes(
        updatedQuotation.notes ||
          ""
      );

      setSuccess(
        "Quotation updated successfully."
      );

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="quotation-edit-loading">
        <div>
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            <strong>
              Loading Quotation
            </strong>

            Preparing quotation details...
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!quotation) {
    return (
      <div className="quotation-edit-not-found">
        <div>
          <FileText size={30} />

          <h1>
            Quotation Not Found
          </h1>

          <p>
            {error ||
              "This quotation could not be loaded."}
          </p>

          <Link
            href="/admin/quotations"
          >
            <ArrowLeft size={15} />
            Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="quotation-edit-page">
      {/* HEADER */}

      <header className="quotation-edit-header">
        <div>
          <Link
            href="/admin/quotations"
            className="quotation-edit-back"
          >
            <ArrowLeft size={14} />
            Back to Quotations
          </Link>

          <div className="quotation-edit-eyebrow">
            <Sparkles size={12} />
            Commercial Management
          </div>

          <h1>Edit Quotation</h1>

          <p>
            Update quotation pricing,
            client status, commercial
            information and follow-up
            activity.
          </p>
        </div>

        <div className="quotation-edit-header-side">
          <span>
            Quotation Reference
          </span>

          <strong>
            {quotationNumber}
          </strong>

          <small>
            Current status: {status}
          </small>
        </div>
      </header>

      {error && (
        <div className="quotation-edit-message error">
          <FileText size={16} />

          <div>
            <strong>
              Unable to update quotation
            </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="quotation-edit-message success">
          <CheckCircle2 size={16} />

          <div>
            <strong>
              Quotation Updated
            </strong>
            <span>{success}</span>
          </div>
        </div>
      )}

      <div className="quotation-edit-layout">
        <form
          onSubmit={handleSubmit}
          className="quotation-edit-main"
        >
          {/* CLIENT */}

          <QuotationEditSection
            icon={<Building2 size={18} />}
            eyebrow="Client"
            title="Company & Quotation"
            description="Manage the client and quotation reference information."
            type="blue"
          >
            <div className="quotation-edit-grid two">
              <QuotationEditField
                label="Company"
                required
                icon={<Building2 size={14} />}
              >
                <select
                  value={companyId}
                  onChange={(e) =>
                    setCompanyId(
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select company
                  </option>

                  {companies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name} —{" "}
                        {company.status}
                      </option>
                    )
                  )}
                </select>
              </QuotationEditField>

              <QuotationEditField
                label="Quotation Number"
                required
                icon={<Hash size={14} />}
              >
                <input
                  type="text"
                  value={
                    quotationNumber
                  }
                  onChange={(e) =>
                    setQuotationNumber(
                      e.target.value
                    )
                  }
                  required
                />
              </QuotationEditField>
            </div>
          </QuotationEditSection>

          {/* SCOPE */}

          <QuotationEditSection
            icon={<FileText size={18} />}
            eyebrow="Scope"
            title="Service Details"
            description="Update the requested testing service and quotation scope."
            type="purple"
          >
            <QuotationEditField
              label="Service"
              required
              icon={<FileCheck2 size={14} />}
            >
              <input
                type="text"
                value={service}
                onChange={(e) =>
                  setService(
                    e.target.value
                  )
                }
                placeholder="Water Testing, Food Testing, IAQ..."
                required
              />
            </QuotationEditField>

            <QuotationEditField
              label="Description"
              icon={<NotebookPen size={14} />}
            >
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Testing scope, parameters, sample requirements or commercial description..."
              />
            </QuotationEditField>
          </QuotationEditSection>

          {/* COMMERCIAL */}

          <QuotationEditSection
            icon={<CircleDollarSign size={18} />}
            eyebrow="Commercial"
            title="Pricing & GST"
            description="Update the commercial value and applicable GST percentage."
            type="green"
          >
            <div className="quotation-edit-grid two">
              <QuotationEditField
                label="Base Amount"
                required
                icon={<IndianRupee size={14} />}
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  required
                />
              </QuotationEditField>

              <QuotationEditField
                label="GST Percentage"
                icon={<Percent size={14} />}
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gstPercent}
                  onChange={(e) =>
                    setGstPercent(
                      e.target.value
                    )
                  }
                />
              </QuotationEditField>
            </div>

            <div className="quotation-edit-live-total">
              <div>
                <span>Base Amount</span>
                <strong>
                  {formatCurrency(
                    calculatedValues.baseAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  GST (
                  {Number(
                    gstPercent || 0
                  )}
                  %)
                </span>

                <strong>
                  {formatCurrency(
                    calculatedValues.gstAmount
                  )}
                </strong>
              </div>

              <div className="total">
                <span>
                  Final Quotation Value
                </span>

                <strong>
                  {formatCurrency(
                    calculatedValues.totalAmount
                  )}
                </strong>
              </div>
            </div>
          </QuotationEditSection>

          {/* STATUS */}

          <QuotationEditSection
            icon={<FileCheck2 size={18} />}
            eyebrow="Pipeline"
            title="Quotation Status"
            description="Track the current client decision and quotation progress."
            type="cyan"
          >
            <QuotationEditField
              label="Current Status"
              required
              icon={<FileCheck2 size={14} />}
            >
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value
                  )
                }
                required
              >
                {quotationStatuses.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </QuotationEditField>

            <QuotationStatusFlow
              currentStatus={status}
            />
          </QuotationEditSection>

          {/* TIMELINE */}

          <QuotationEditSection
            icon={<CalendarDays size={18} />}
            eyebrow="Timeline"
            title="Dates & Follow-up"
            description="Manage quotation dates and the next commercial follow-up."
            type="orange"
          >
            <div className="quotation-edit-grid three">
              <QuotationEditField
                label="Quotation Date"
                required
                icon={<CalendarDays size={14} />}
              >
                <input
                  type="date"
                  value={
                    quotationDate
                  }
                  onChange={(e) =>
                    setQuotationDate(
                      e.target.value
                    )
                  }
                  required
                />
              </QuotationEditField>

              <QuotationEditField
                label="Sent Date"
                icon={<CalendarDays size={14} />}
              >
                <input
                  type="date"
                  value={sentDate}
                  onChange={(e) =>
                    setSentDate(
                      e.target.value
                    )
                  }
                />
              </QuotationEditField>

              <QuotationEditField
                label="Next Follow-up"
                icon={<CalendarDays size={14} />}
              >
                <input
                  type="date"
                  value={
                    nextFollowUp
                  }
                  onChange={(e) =>
                    setNextFollowUp(
                      e.target.value
                    )
                  }
                  disabled={
                    followUpDisabled
                  }
                />

                {followUpDisabled && (
                  <small className="quotation-edit-help">
                    Follow-up is cleared
                    for {status} quotations.
                  </small>
                )}
              </QuotationEditField>
            </div>
          </QuotationEditSection>

          {/* NOTES */}

          <QuotationEditSection
            icon={<NotebookPen size={18} />}
            eyebrow="Internal"
            title="Quotation Notes"
            description="Keep pricing discussions, client feedback and internal commercial notes."
            type="navy"
          >
            <QuotationEditField
              label="Notes"
              icon={<NotebookPen size={14} />}
            >
              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Client response, pricing discussion or internal notes..."
              />
            </QuotationEditField>
          </QuotationEditSection>

          {/* SAVE */}

          <div className="quotation-edit-submit-wrap">
            <div className="quotation-edit-submit-info">
              <div>
                <Save size={17} />
              </div>

              <span>
                <strong>
                  Update this quotation
                </strong>

                <small>
                  Changes will be saved
                  to the existing quotation.
                </small>
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="quotation-edit-submit"
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
                  ? "Saving Changes..."
                  : "Save Changes"}
              </span>

              {!saving && (
                <ArrowRight size={15} />
              )}
            </button>
          </div>
        </form>

        {/* SUMMARY */}

        <aside className="quotation-edit-summary">
          <div className="quotation-edit-summary-card amount">
            <div className="quotation-edit-summary-head">
              <div>
                <Calculator size={18} />
              </div>

              <span>
                <small>
                  Commercial
                </small>

                <strong>
                  Amount Summary
                </strong>
              </span>
            </div>

            <div className="quotation-edit-summary-body">
              <div className="quotation-edit-summary-row">
                <span>
                  Base Amount
                </span>

                <strong>
                  {formatCurrency(
                    calculatedValues.baseAmount
                  )}
                </strong>
              </div>

              <div className="quotation-edit-summary-row">
                <span>
                  GST (
                  {Number(
                    gstPercent || 0
                  )}
                  %)
                </span>

                <strong>
                  {formatCurrency(
                    calculatedValues.gstAmount
                  )}
                </strong>
              </div>

              <div className="quotation-edit-summary-total">
                <span>
                  Total Amount
                </span>

                <strong>
                  {formatCurrency(
                    calculatedValues.totalAmount
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className={`quotation-edit-summary-card status ${status.toLowerCase().replaceAll(" ", "-")}`}>
            <span className="quotation-edit-status-label">
              Current Status
            </span>

            <strong className="quotation-edit-status-value">
              {status}
            </strong>

            <p>
              Update this whenever the
              client reviews, accepts,
              rejects or requests changes
              to the quotation.
            </p>
          </div>

          <div className="quotation-edit-summary-card reference">
            <span>
              Quotation
            </span>

            <strong>
              {quotationNumber ||
                "No reference"}
            </strong>

            <small>
              {service ||
                "Service not specified"}
            </small>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function QuotationEditSection({
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
  type:
    | "blue"
    | "purple"
    | "green"
    | "cyan"
    | "orange"
    | "navy";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`quotation-edit-section ${type}`}
    >
      <div className="quotation-edit-section-head">
        <div className="quotation-edit-section-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="quotation-edit-section-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function QuotationEditField({
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
    <label className="quotation-edit-field">
      <span className="quotation-edit-label">
        {icon}
        {label}

        {required && <em>*</em>}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   STATUS FLOW
========================================================= */

function QuotationStatusFlow({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const stages = [
    "Draft",
    "Sent",
    "Under Review",
    "Accepted",
  ];

  let activeIndex =
    stages.indexOf(currentStatus);

  if (currentStatus === "Revised") {
    activeIndex = 2;
  }

  const isClosedNegative =
    currentStatus === "Rejected" ||
    currentStatus === "Expired";

  return (
    <div className="quotation-edit-status-flow">
      <div className="quotation-edit-status-flow-title">
        <span>
          Quotation Progress
        </span>

        <strong>
          {currentStatus}
        </strong>
      </div>

      <div className="quotation-edit-status-track">
        {stages.map(
          (stage, index) => (
            <div
              key={stage}
              className={`quotation-edit-status-stage ${
                !isClosedNegative &&
                index <= activeIndex
                  ? "active"
                  : ""
              } ${
                !isClosedNegative &&
                index === activeIndex
                  ? "current"
                  : ""
              }`}
            >
              <div>
                {!isClosedNegative &&
                index < activeIndex ? (
                  <CheckCircle2
                    size={12}
                  />
                ) : (
                  <span>
                    {index + 1}
                  </span>
                )}
              </div>

              <small>
                {stage}
              </small>
            </div>
          )
        )}
      </div>

      {isClosedNegative && (
        <div className="quotation-edit-closed-state">
          <FileCheck2 size={15} />

          <span>
            This quotation is currently{" "}
            <strong>{currentStatus}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}