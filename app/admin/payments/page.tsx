import Link from "next/link";

import {
  ArrowLeft,
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

/* =========================================================
   TYPES
   ========================================================= */

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

type PageProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

/* =========================================================
   DATABASE
   ========================================================= */

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

/* =========================================================
   HELPERS
   ========================================================= */

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

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function isReceivedPayment(status: string) {
  return [
    "received",
    "paid",
    "collected",
    "completed",
  ].includes(normalizeStatus(status));
}

function paymentStatusClass(status: string) {
  return normalizeStatus(status)
    .replaceAll(" ", "-")
    .replaceAll("/", "-");
}

/*
  These are the statuses treated as confirmed work orders.

  This follows the same idea as the dashboard:
  pending balance should be calculated against confirmed business,
  not against quotations.
*/
function isConfirmedWorkOrder(status: string) {
  const normalized = normalizeStatus(status);

  if (!normalized) return true;

  const excludedStatuses = [
    "cancelled",
    "canceled",
    "rejected",
    "lost",
    "draft",
  ];

  return !excludedStatuses.includes(normalized);
}

/* =========================================================
   PAGE
   ========================================================= */

export default async function PaymentsPage({
  searchParams,
}: PageProps) {
  const params = searchParams ? await searchParams : {};

  const rawView = params.view;

  const requestedView = Array.isArray(rawView)
    ? rawView[0]
    : rawView;

  const view =
    requestedView === "collected" ||
    requestedView === "pending"
      ? requestedView
      : "all";

  const [
    payments,
    companies,
    workOrders,
    quotations,
  ] = await Promise.all([
    getPayments(),
    getCompanies(),
    getWorkOrders(),
    getQuotations(),
  ]);

  /* =======================================================
     LOOKUP MAPS
     ======================================================= */

  const companyMap = new Map(
    companies.map((company) => [
      company.id,
      company,
    ]),
  );

  const workOrderMap = new Map(
    workOrders.map((workOrder) => [
      workOrder.id,
      workOrder,
    ]),
  );

  const quotationMap = new Map(
    quotations.map((quotation) => [
      quotation.id,
      quotation,
    ]),
  );

  /* =======================================================
     RECEIVED / COLLECTED PAYMENTS
     ======================================================= */

  const receivedPayments = payments.filter(
    (payment) =>
      isReceivedPayment(payment.status),
  );

  const collectedAmount =
    receivedPayments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0,
    );

  const pendingVerification =
    payments.filter(
      (payment) =>
        normalizeStatus(payment.status) ===
        "pending verification",
    ).length;

  const failedPayments =
    payments.filter(
      (payment) =>
        normalizeStatus(payment.status) ===
        "failed",
    ).length;

  const receivedCount =
    receivedPayments.length;

  const paymentCompanies =
    new Set(
      receivedPayments.map(
        (payment) => payment.companyId,
      ),
    ).size;

  /* =======================================================
     RECEIVED MONEY BY WORK ORDER
     ======================================================= */

  const collectedByWorkOrder =
    new Map<string, number>();

  for (const payment of receivedPayments) {
    if (!payment.workOrderId) continue;

    const previous =
      collectedByWorkOrder.get(
        payment.workOrderId,
      ) || 0;

    collectedByWorkOrder.set(
      payment.workOrderId,
      previous +
        Number(payment.amount || 0),
    );
  }

  /* =======================================================
     OUTSTANDING / PENDING BALANCES
     ======================================================= */

  const confirmedWorkOrders =
    workOrders.filter((workOrder) =>
      isConfirmedWorkOrder(
        workOrder.status,
      ),
    );

  const outstandingOrders =
    confirmedWorkOrders
      .map((workOrder) => {
        const collected =
          collectedByWorkOrder.get(
            workOrder.id,
          ) || 0;

        const total =
          Number(
            workOrder.totalAmount || 0,
          );

        const pending = Math.max(
          total - collected,
          0,
        );

        const company =
          companyMap.get(
            workOrder.companyId,
          );

        return {
          ...workOrder,
          company,
          collected,
          pending,
        };
      })
      .filter(
        (workOrder) =>
          workOrder.pending > 0,
      )
      .sort(
        (a, b) =>
          b.pending - a.pending,
      );

  const totalPendingAmount =
    outstandingOrders.reduce(
      (total, order) =>
        total + order.pending,
      0,
    );

  const outstandingClients =
    new Set(
      outstandingOrders.map(
        (order) => order.companyId,
      ),
    ).size;

  /* =======================================================
     TABLE DATA ACCORDING TO URL
     ======================================================= */

  const visiblePayments =
    view === "collected"
      ? receivedPayments
      : payments;

  /* =======================================================
     PAGE TITLE
     ======================================================= */

  const pageTitle =
    view === "pending"
      ? "Pending Amount"
      : view === "collected"
        ? "Amount Collected"
        : "Payments";

  const pageDescription =
    view === "pending"
      ? "Outstanding balances against confirmed work orders."
      : view === "collected"
        ? "Received and successfully collected client payments."
        : "Track collections received from clients, linked work orders or quotations, transaction references and payment status.";

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="payments-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="payments-header">

        <div>
          <span className="payments-eyebrow">
            COLLECTIONS & REVENUE
          </span>

          <h1>{pageTitle}</h1>

          <p>{pageDescription}</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {view !== "all" && (
            <Link
              href="/admin/payments"
              className="payments-add"
            >
              <ArrowLeft size={15} />
              All Payments
            </Link>
          )}

          <Link
            href="/admin/companies"
            className="payments-add"
          >
            <Plus size={16} />
            Record Payment
            <ArrowRight size={14} />
          </Link>
        </div>

      </header>

      {/* ===================================================
          VIEW NAVIGATION
          =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <Link
          href="/admin/payments"
          className={`payments-view-tab ${
            view === "all" ? "active" : ""
          }`}
        >
          All Payments
        </Link>

        <Link
          href="/admin/payments?view=collected"
          className={`payments-view-tab ${
            view === "collected"
              ? "active"
              : ""
          }`}
        >
          Amount Collected
        </Link>

        <Link
          href="/admin/payments?view=pending"
          className={`payments-view-tab ${
            view === "pending"
              ? "active"
              : ""
          }`}
        >
          Pending Amount
        </Link>
      </div>

      {/* ===================================================
          METRICS
          =================================================== */}

      <section className="payments-metrics">

        <PaymentMetric
          label="Total Collected"
          value={money(collectedAmount)}
          helper="Received payments"
          icon={<IndianRupee size={21} />}
          type="green"
        />

        <PaymentMetric
          label="Pending Amount"
          value={money(totalPendingAmount)}
          helper="Outstanding work orders"
          icon={<WalletCards size={21} />}
          type="amber"
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
          value={String(
            pendingVerification,
          )}
          helper="Needs confirmation"
          icon={<Clock3 size={21} />}
          type="amber"
        />

      </section>

      {/* ===================================================
          PENDING BALANCE VIEW
          =================================================== */}

      {view === "pending" ? (

        <section className="payments-panel">

          <div className="payments-panel-header">

            <div className="payments-panel-heading">

              <div className="payments-panel-icon">
                <WalletCards size={20} />
              </div>

              <div>
                <span>
                  Outstanding Business
                </span>

                <h2>
                  Pending Collection Register
                </h2>

                <p>
                  Confirmed work order value
                  minus received payments
                </p>
              </div>

            </div>

            <div className="payments-panel-count">
              {outstandingOrders.length}{" "}
              {outstandingOrders.length === 1
                ? "Order"
                : "Orders"}
            </div>

          </div>

          {outstandingOrders.length === 0 ? (

            <div className="payments-empty">

              <div className="payments-empty-icon">
                <CheckCircle2 size={30} />
              </div>

              <span>
                Collection Status
              </span>

              <h3>
                No pending balances
              </h3>

              <p>
                No outstanding balance was
                calculated against the
                confirmed work orders.
              </p>

            </div>

          ) : (

            <div className="payments-table-wrap">

              <table className="payments-table">

                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Work Order</th>
                    <th>Service</th>

                    <th className="money">
                      Order Value
                    </th>

                    <th className="money">
                      Collected
                    </th>

                    <th className="money">
                      Pending
                    </th>

                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {outstandingOrders.map(
                    (order) => (

                      <tr key={order.id}>

                        <td>

                          {order.company ? (

                            <Link
                              className="payments-client"
                              href={`/admin/companies/${order.company.id}`}
                            >
                              <span className="payments-client-icon">
                                <Building2
                                  size={14}
                                />
                              </span>

                              <span>
                                {
                                  order
                                    .company
                                    .name
                                }
                              </span>
                            </Link>

                          ) : (

                            <span className="payments-muted">
                              Company unavailable
                            </span>

                          )}

                        </td>

                        <td>

                          <div className="payments-order">

                            <strong>
                              {
                                order.workOrderNumber
                              }
                            </strong>

                            <small>
                              Work Order
                            </small>

                          </div>

                        </td>

                        <td>
                          {order.service ||
                            "—"}
                        </td>

                        <td className="money">
                          <strong>
                            {money(
                              Number(
                                order.totalAmount ||
                                  0,
                              ),
                            )}
                          </strong>
                        </td>

                        <td className="money">

                          <strong
                            style={{
                              color: "#15803d",
                            }}
                          >
                            {money(
                              order.collected,
                            )}
                          </strong>

                        </td>

                        <td className="money">

                          <strong
                            style={{
                              color: "#dc2626",
                            }}
                          >
                            {money(
                              order.pending,
                            )}
                          </strong>

                        </td>

                        <td>

                          <span
                            className={`payments-status ${paymentStatusClass(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>

                        </td>

                      </tr>

                    ),
                  )}

                </tbody>

              </table>

            </div>

          )}

          {/* Pending summary */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "30px",
              flexWrap: "wrap",
              marginTop: "18px",
              padding: "16px",
              borderRadius: "14px",
              background: "#fff8ed",
              border:
                "1px solid #fed7aa",
            }}
          >
            <div>
              <small
                style={{
                  display: "block",
                  color: "#64748b",
                }}
              >
                Clients with Pending Amount
              </small>

              <strong>
                {outstandingClients}
              </strong>
            </div>

            <div>
              <small
                style={{
                  display: "block",
                  color: "#64748b",
                }}
              >
                Outstanding Orders
              </small>

              <strong>
                {outstandingOrders.length}
              </strong>
            </div>

            <div>
              <small
                style={{
                  display: "block",
                  color: "#64748b",
                }}
              >
                Total Pending
              </small>

              <strong
                style={{
                  color: "#dc2626",
                  fontSize: "20px",
                }}
              >
                {money(
                  totalPendingAmount,
                )}
              </strong>
            </div>
          </div>

        </section>

      ) : (

        /* =================================================
           PAYMENT REGISTER
           ================================================= */

        <section className="payments-panel">

          <div className="payments-panel-header">

            <div className="payments-panel-heading">

              <div className="payments-panel-icon">
                <ReceiptText size={20} />
              </div>

              <div>

                <span>
                  {view === "collected"
                    ? "Received Collections"
                    : "Payment Lifecycle"}
                </span>

                <h2>
                  {view === "collected"
                    ? "Collected Payment Register"
                    : "Collection Register"}
                </h2>

                <p>
                  {view === "collected"
                    ? "Successfully received client payment records"
                    : "Confirmed business → payment → collection status"}
                </p>

              </div>

            </div>

            <div className="payments-panel-count">

              {visiblePayments.length}{" "}

              {visiblePayments.length === 1
                ? "Payment"
                : "Payments"}

            </div>

          </div>

          {visiblePayments.length === 0 ? (

            <div className="payments-empty">

              <div className="payments-empty-icon">
                <WalletCards size={30} />
              </div>

              <span>
                Collections Workspace
              </span>

              <h3>
                {view === "collected"
                  ? "No collected payments"
                  : "No payments recorded yet"}
              </h3>

              <p>
                {view === "collected"
                  ? "No received payment records are currently available."
                  : "Record a payment from the relevant client profile after confirmed business is created."}
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

                    <th className="money">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {visiblePayments.map(
                    (payment) => {

                      const company =
                        companyMap.get(
                          payment.companyId,
                        );

                      const workOrder =
                        payment.workOrderId
                          ? workOrderMap.get(
                              payment.workOrderId,
                            )
                          : undefined;

                      const quotation =
                        payment.quotationId
                          ? quotationMap.get(
                              payment.quotationId,
                            )
                          : undefined;

                      const linkedRecord =
                        workOrder ||
                        quotation;

                      return (

                        <tr key={payment.id}>

                          <td>

                            {company ? (

                              <Link
                                className="payments-client"
                                href={`/admin/companies/${company.id}`}
                              >

                                <span className="payments-client-icon">
                                  <Building2
                                    size={14}
                                  />
                                </span>

                                <span>
                                  {company.name}
                                </span>

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
                                  {
                                    workOrder.workOrderNumber
                                  }
                                </strong>

                                <small>
                                  Work Order •{" "}
                                  {money(
                                    workOrder.totalAmount,
                                  )}
                                </small>

                              </div>

                            ) : quotation ? (

                              <div className="payments-order">

                                <strong>
                                  {
                                    quotation.quotationNumber
                                  }
                                </strong>

                                <small>
                                  Quotation •{" "}
                                  {money(
                                    quotation.totalAmount,
                                  )}
                                </small>

                              </div>

                            ) : (

                              <span className="payments-muted">
                                Not linked
                              </span>

                            )}

                          </td>

                          <td>
                            {linkedRecord?.service ||
                              "—"}
                          </td>

                          <td>
                            {formatDate(
                              payment.paymentDate,
                            )}
                          </td>

                          <td>

                            <span className="payments-method">

                              <CreditCard
                                size={13}
                              />

                              {payment.paymentMethod ||
                                "Not specified"}

                            </span>

                          </td>

                          <td>
                            {payment.reference ||
                              "—"}
                          </td>

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
                              {money(
                                Number(
                                  payment.amount ||
                                    0,
                                ),
                              )}
                            </strong>

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

      )}

      {/* ===================================================
          INFORMATION NOTE
          =================================================== */}

      <div className="payments-note">

        <Landmark size={16} />

        <div>

          <strong>
            Live CRM collections
          </strong>

          <span>
            Collected figures are calculated
            from received payment records.
            Pending balances are calculated
            from confirmed work-order value
            minus received payments linked to
            those work orders.
          </span>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   METRIC COMPONENT
   ========================================================= */

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
  type:
    | "blue"
    | "green"
    | "cyan"
    | "amber"
    | "red";
}) {
  return (
    <article
      className={`payments-metric ${type}`}
    >
      <div className="payments-metric-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}