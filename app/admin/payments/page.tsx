import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  IndianRupee,
  Landmark,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./payments.css";

export const dynamic = "force-dynamic";

type Payment = {
  id: string;
  companyId: string;
  quotationId: string | null;
  workOrderId: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
  reference: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

type Company = {
  id: string;
  name: string;
};

type WorkOrder = {
  id: string;
  companyId: string;
  workOrderNumber: string;
  service: string;
  totalAmount: number;
  status: string;
};

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  totalAmount: number;
  status: string;
};

async function getPayments(): Promise<Payment[]> {
  try {
    const rows = await db.orm.public.Payment
      .orderBy((payment) => payment.paymentDate.desc())
      .all();

    return rows as Payment[];
  } catch (error) {
    console.error("Payments page getPayments error:", error);
    return [];
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    return (await db.orm.public.Company.all()) as Company[];
  } catch (error) {
    console.error("Payments page getCompanies error:", error);
    return [];
  }
}

async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    return (await db.orm.public.WorkOrder.all()) as WorkOrder[];
  } catch (error) {
    console.error("Payments page getWorkOrders error:", error);
    return [];
  }
}

async function getQuotations(): Promise<Quotation[]> {
  try {
    return (await db.orm.public.Quotation.all()) as Quotation[];
  } catch (error) {
    console.error("Payments page getQuotations error:", error);
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(value: string) {
  return value.toLowerCase().trim();
}

function isReceivedPayment(status: string) {
  return ["received", "paid", "collected", "completed"].includes(
    normalizeStatus(status),
  );
}

function paymentStatusClass(status: string) {
  return normalizeStatus(status)
    .replaceAll(" ", "-")
    .replaceAll("/", "-");
}

export default async function PaymentsPage() {
  const [payments, companies, workOrders, quotations] =
    await Promise.all([
      getPayments(),
      getCompanies(),
      getWorkOrders(),
      getQuotations(),
    ]);

  const companyMap = new Map(
    companies.map((company) => [company.id, company]),
  );

  const workOrderMap = new Map(
    workOrders.map((workOrder) => [workOrder.id, workOrder]),
  );

  const quotationMap = new Map(
    quotations.map((quotation) => [quotation.id, quotation]),
  );

  const receivedPayments = payments.filter((payment) =>
    isReceivedPayment(payment.status),
  );

  const collectedAmount = receivedPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const pendingVerification = payments.filter(
    (payment) =>
      normalizeStatus(payment.status) === "pending verification",
  ).length;

  const failedPayments = payments.filter(
    (payment) => normalizeStatus(payment.status) === "failed",
  ).length;

  const receivedCount = receivedPayments.length;

  const paymentCompanies = new Set(
    receivedPayments.map((payment) => payment.companyId),
  ).size;

  return (
    <div className="payments-page">
      <header className="payments-header">
        <div>
          <span className="payments-eyebrow">
            COLLECTIONS & REVENUE
          </span>

          <h1>Payments</h1>

          <p>
            Track collections received from clients, linked work
            orders or quotations, transaction references and payment
            status.
          </p>
        </div>

        <Link
          href="/admin/companies"
          className="payments-add"
        >
          <Plus size={16} />
          Record Payment
          <ArrowRight size={14} />
        </Link>
      </header>

      <section className="payments-metrics">
        <PaymentMetric
          label="Total Collected"
          value={money(collectedAmount)}
          helper="Received payments"
          icon={<IndianRupee size={21} />}
          type="green"
        />

        <PaymentMetric
          label="Payments Received"
          value={String(receivedCount)}
          helper="Successful entries"
          icon={<CheckCircle2 size={21} />}
          type="blue"
        />

        <PaymentMetric
          label="Paying Clients"
          value={String(paymentCompanies)}
          helper="Clients with collections"
          icon={<Building2 size={21} />}
          type="cyan"
        />

        <PaymentMetric
          label="Pending Verification"
          value={String(pendingVerification)}
          helper="Needs confirmation"
          icon={<Clock3 size={21} />}
          type="amber"
        />

        <PaymentMetric
          label="Failed"
          value={String(failedPayments)}
          helper="Failed transactions"
          icon={<CircleDollarSign size={21} />}
          type="red"
        />
      </section>

      <section className="payments-panel">
        <div className="payments-panel-header">
          <div className="payments-panel-heading">
            <div className="payments-panel-icon">
              <ReceiptText size={20} />
            </div>

            <div>
              <span>Payment Lifecycle</span>
              <h2>Collection Register</h2>
              <p>
                Confirmed business → payment → collection status
              </p>
            </div>
          </div>

          <div className="payments-panel-count">
            {payments.length}{" "}
            {payments.length === 1 ? "Payment" : "Payments"}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="payments-empty">
            <div className="payments-empty-icon">
              <WalletCards size={30} />
            </div>

            <span>Collections Workspace</span>
            <h3>No payments recorded yet</h3>

            <p>
              Record a payment from the relevant client profile after
              confirmed business is created.
            </p>

            <Link href="/admin/companies">
              Open Clients
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="payments-table-wrap">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Linked Record</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th className="money">Amount</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => {
                  const company = companyMap.get(payment.companyId);

                  const workOrder = payment.workOrderId
                    ? workOrderMap.get(payment.workOrderId)
                    : undefined;

                  const quotation = payment.quotationId
                    ? quotationMap.get(payment.quotationId)
                    : undefined;

                  const linkedRecord = workOrder || quotation;

                  return (
                    <tr key={payment.id}>
                      <td>
                        {company ? (
                          <Link
                            className="payments-client"
                            href={`/admin/companies/${company.id}`}
                          >
                            <span className="payments-client-icon">
                              <Building2 size={14} />
                            </span>

                            <span>{company.name}</span>
                          </Link>
                        ) : (
                          <span className="payments-muted">
                            Company unavailable
                          </span>
                        )}
                      </td>

                      <td>
                        {workOrder ? (
                          <div className="payments-order">
                            <strong>
                              {workOrder.workOrderNumber}
                            </strong>
                            <small>
                              Work Order •{" "}
                              {money(workOrder.totalAmount)}
                            </small>
                          </div>
                        ) : quotation ? (
                          <div className="payments-order">
                            <strong>
                              {quotation.quotationNumber}
                            </strong>
                            <small>
                              Quotation •{" "}
                              {money(quotation.totalAmount)}
                            </small>
                          </div>
                        ) : (
                          <span className="payments-muted">
                            Not linked
                          </span>
                        )}
                      </td>

                      <td>
                        {linkedRecord?.service || "—"}
                      </td>

                      <td>
                        {formatDate(payment.paymentDate)}
                      </td>

                      <td>
                        <span className="payments-method">
                          <CreditCard size={13} />
                          {payment.paymentMethod ||
                            "Not specified"}
                        </span>
                      </td>

                      <td>{payment.reference || "—"}</td>

                      <td>
                        <span
                          className={`payments-status ${paymentStatusClass(
                            payment.status,
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="money">
                        <strong>
                          {money(Number(payment.amount || 0))}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="payments-note">
        <Landmark size={16} />

        <div>
          <strong>Live CRM collections</strong>

          <span>
            Dashboard collection figures are calculated from received
            payment records in this register.
          </span>
        </div>
      </div>
    </div>
  );
}

function PaymentMetric({
  label,
  value,
  helper,
  icon,
  type,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  type: "blue" | "green" | "cyan" | "amber" | "red";
}) {
  return (
    <article className={`payments-metric ${type}`}>
      <div className="payments-metric-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}
