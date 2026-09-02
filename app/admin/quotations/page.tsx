import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileEdit,
  FileText,
  IndianRupee,
  Plus,
  ReceiptText,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

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
  createdAt: string;
  updatedAt: string;
};

type Company = {
  id: string;
  name: string;
  status: string;
};

/* =========================================================
   DATA
========================================================= */

async function getQuotations(): Promise<Quotation[]> {
  try {
    const quotations = await db.orm.public.Quotation
      .orderBy((quotation) => quotation.quotationDate.desc())
      .all();

    return quotations as Quotation[];
  } catch (error) {
    console.error("Quotations page error:", error);
    return [];
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    const companies = await db.orm.public.Company.all();
    return companies as Company[];
  } catch (error) {
    console.error("Quotation companies error:", error);
    return [];
  }
}

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const raw = value.slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function statusSlug(status: string) {
  return status.toLowerCase().replaceAll(" ", "-");
}

/* =========================================================
   PAGE
========================================================= */

export default async function QuotationsPage() {
  const [quotations, companies] = await Promise.all([
    getQuotations(),
    getCompanies(),
  ]);

  const companyMap = new Map(
    companies.map((company) => [company.id, company.name])
  );

  const totalQuotedValue = quotations.reduce(
    (total, quotation) => total + Number(quotation.totalAmount || 0),
    0
  );

  const sentCount = quotations.filter(
    (quotation) => quotation.status === "Sent"
  ).length;

  const acceptedQuotations = quotations.filter(
    (quotation) => quotation.status === "Accepted"
  );

  const acceptedCount = acceptedQuotations.length;

  const acceptedValue = acceptedQuotations.reduce(
    (total, quotation) => total + Number(quotation.totalAmount || 0),
    0
  );

  const underReviewCount = quotations.filter(
    (quotation) => quotation.status === "Under Review"
  ).length;

  const revisedCount = quotations.filter(
    (quotation) => quotation.status === "Revised"
  ).length;

  const conversionRate =
    quotations.length > 0
      ? Math.round((acceptedCount / quotations.length) * 100)
      : 0;

  return (
    <div className="quotation-premium-page">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="quotation-premium-header">
        <div>
          <div className="quotation-premium-eyebrow">
            <span className="quotation-premium-eyebrow-icon">
              <Sparkles size={12} />
            </span>

            Sales & Revenue
          </div>

          <h1>Quotations</h1>

          <p>
            Manage commercial proposals, pricing, GST, client
            decisions and follow-up activity.
          </p>
        </div>

        <Link
          href="/admin/quotations/new"
          className="quotation-premium-add"
        >
          <Plus size={17} />
          <span>Add Quotation</span>
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* =====================================================
          BUSINESS METRICS
      ====================================================== */}

      <section className="quotation-premium-metrics">
        <QuotationMetric
          label="Total Quotations"
          value={String(quotations.length)}
          helper="Commercial proposals"
          icon={<FileText size={21} />}
          type="blue"
        />

        <QuotationMetric
          label="Sent to Clients"
          value={String(sentCount)}
          helper="Awaiting client action"
          icon={<Send size={21} />}
          type="purple"
        />

        <QuotationMetric
          label="Under Review"
          value={String(underReviewCount)}
          helper={`${revisedCount} revised`}
          icon={<Clock3 size={21} />}
          type="orange"
        />

        <QuotationMetric
          label="Accepted"
          value={String(acceptedCount)}
          helper={formatCurrency(acceptedValue)}
          icon={<CheckCircle2 size={21} />}
          type="green"
        />

        <QuotationMetric
          label="Conversion"
          value={`${conversionRate}%`}
          helper="Quotation to acceptance"
          icon={<TrendingUp size={21} />}
          type="cyan"
        />

        <QuotationMetric
          label="Quoted Value"
          value={formatCurrency(totalQuotedValue)}
          helper="Total commercial value"
          icon={<IndianRupee size={21} />}
          type="navy"
          money
        />
      </section>

      {/* =====================================================
          QUOTATIONS PANEL
      ====================================================== */}

      <section className="quotation-premium-panel">
        <div className="quotation-premium-panel-header">
          <div className="quotation-premium-panel-heading">
            <div className="quotation-premium-panel-icon">
              <ReceiptText size={20} />
            </div>

            <div>
              <span>Commercial Pipeline</span>
              <h2>Quotation Register</h2>
              <p>
                Review pricing, GST, follow-ups and client
                decisions in one place.
              </p>
            </div>
          </div>

          <div className="quotation-premium-count">
            {quotations.length}{" "}
            {quotations.length === 1 ? "Quotation" : "Quotations"}
          </div>
        </div>

        {quotations.length > 0 ? (
          <div className="quotation-premium-list">
            {quotations.map((quotation) => {
              const companyName =
                companyMap.get(quotation.companyId) ||
                "Unknown Company";

              return (
                <article
                  key={quotation.id}
                  className={`quotation-premium-card quotation-status-${statusSlug(
                    quotation.status
                  )}`}
                >
                  {/* CARD TOP */}

                  <div className="quotation-premium-card-top">
                    <div className="quotation-premium-card-identity">
                      <div className="quotation-premium-service-icon">
                        <FileText size={21} />
                      </div>

                      <div className="quotation-premium-card-title">
                        <div className="quotation-premium-card-badges">
                          <span
                            className={`quotation-premium-status ${statusSlug(
                              quotation.status
                            )}`}
                          >
                            {quotation.status}
                          </span>

                          <span className="quotation-premium-number">
                            {quotation.quotationNumber}
                          </span>
                        </div>

                        <h3>{quotation.service}</h3>

                        <Link
                          href={`/admin/companies/${quotation.companyId}`}
                          className="quotation-premium-company"
                        >
                          <Building2 size={14} />
                          {companyName}
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>

                    <div className="quotation-premium-total">
                      <span>Total Quotation</span>
                      <strong>
                        {formatCurrency(quotation.totalAmount)}
                      </strong>
                      <small>Including GST</small>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  {quotation.description && (
                    <div className="quotation-premium-description">
                      <span>Scope / Description</span>
                      <p>{quotation.description}</p>
                    </div>
                  )}

                  {/* FINANCIAL DETAILS */}

                  <div className="quotation-premium-financial-grid">
                    <QuotationValue
                      label="Base Amount"
                      value={formatCurrency(quotation.amount)}
                      icon={<IndianRupee size={15} />}
                      type="base"
                    />

                    <QuotationValue
                      label={`GST (${quotation.gstPercent}%)`}
                      value={formatCurrency(quotation.gstAmount)}
                      icon={<CircleDollarSign size={15} />}
                      type="gst"
                    />

                    <QuotationValue
                      label="Final Value"
                      value={formatCurrency(quotation.totalAmount)}
                      icon={<IndianRupee size={15} />}
                      type="total"
                    />

                    <QuotationValue
                      label="Quotation Date"
                      value={formatDate(quotation.quotationDate)}
                      icon={<CalendarDays size={15} />}
                      type="date"
                    />
                  </div>

                  {/* BOTTOM */}

                  <div className="quotation-premium-bottom">
                    <div className="quotation-premium-followup-area">
                      <div
                        className={`quotation-premium-followup-box ${
                          quotation.nextFollowUp ? "scheduled" : ""
                        }`}
                      >
                        <div className="quotation-premium-followup-icon">
                          <CalendarDays size={16} />
                        </div>

                        <div>
                          <span>Next Follow-up</span>

                          <strong>
                            {quotation.nextFollowUp
                              ? formatDate(quotation.nextFollowUp)
                              : "Not scheduled"}
                          </strong>
                        </div>
                      </div>

                      {quotation.sentDate && (
                        <div className="quotation-premium-mini-detail">
                          <Send size={14} />

                          <div>
                            <span>Sent Date</span>
                            <strong>
                              {formatDate(quotation.sentDate)}
                            </strong>
                          </div>
                        </div>
                      )}

                      {quotation.notes && (
                        <div className="quotation-premium-notes">
                          <FileText size={14} />

                          <div>
                            <span>Notes</span>
                            <p>{quotation.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/admin/quotations/${quotation.id}`}
                      className="quotation-premium-edit"
                    >
                      <FileEdit size={16} />

                      <span>View / Edit</span>

                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="quotation-premium-empty">
            <div className="quotation-premium-empty-icon">
              <FileText size={29} />
            </div>

            <span>Sales Workspace</span>
            <h3>No quotations yet</h3>

            <p>
              Create your first commercial quotation to start
              tracking pricing, GST, follow-ups and client
              decisions.
            </p>

            <Link href="/admin/quotations/new">
              <Plus size={15} />
              Create First Quotation
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function QuotationMetric({
  label,
  value,
  helper,
  icon,
  type,
  money = false,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  type:
    | "blue"
    | "purple"
    | "orange"
    | "green"
    | "cyan"
    | "navy";
  money?: boolean;
}) {
  return (
    <div className={`quotation-premium-metric ${type}`}>
      <div className="quotation-premium-metric-icon">
        {icon}
      </div>

      <div className="quotation-premium-metric-content">
        <span>{label}</span>

        <strong className={money ? "money" : ""}>
          {value}
        </strong>

        <small>{helper}</small>
      </div>
    </div>
  );
}

function QuotationValue({
  label,
  value,
  icon,
  type,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  type: "base" | "gst" | "total" | "date";
}) {
  return (
    <div className={`quotation-premium-value ${type}`}>
      <div className="quotation-premium-value-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}