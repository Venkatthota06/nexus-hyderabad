import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  IndianRupee,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./orders.css";

export const dynamic = "force-dynamic";

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

type Payment = {
  id: string;
  companyId: string;
  workOrderId: string | null;
  amount: number;
  status: string;
};

async function getCompanies(): Promise<Company[]> {
  try {
    return (await db.orm.public.Company.all()) as Company[];
  } catch (error) {
    console.error("Orders getCompanies error:", error);
    return [];
  }
}

async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    return (await db.orm.public.WorkOrder.all()) as WorkOrder[];
  } catch (error) {
    console.error("Orders getWorkOrders error:", error);
    return [];
  }
}

async function getPayments(): Promise<Payment[]> {
  try {
    return (await db.orm.public.Payment.all()) as Payment[];
  } catch (error) {
    console.error("Orders getPayments error:", error);
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isReceivedPayment(status: string) {
  return [
    "received",
    "paid",
    "collected",
    "completed",
  ].includes(normalizeStatus(status));
}

/*
  Keep the same confirmed-business logic here and on Payments.
  We exclude records that clearly do not represent confirmed business.
*/
function isConfirmedWorkOrder(status: string) {
  const normalized = normalizeStatus(status);

  if (!normalized) return true;

  return ![
    "cancelled",
    "canceled",
    "rejected",
    "lost",
    "draft",
  ].includes(normalized);
}

function statusClass(status: string) {
  return (
    normalizeStatus(status)
      .replaceAll(" ", "-")
      .replaceAll("/", "-") || "unknown"
  );
}

export default async function OrdersPage() {
  const [companies, workOrders, payments] =
    await Promise.all([
      getCompanies(),
      getWorkOrders(),
      getPayments(),
    ]);

  const companyMap = new Map(
    companies.map((company) => [
      company.id,
      company,
    ]),
  );

  /*
    Only successfully received payments contribute
    to collected amount.
  */
  const receivedPayments =
    payments.filter((payment) =>
      isReceivedPayment(payment.status),
    );

  const collectedByWorkOrder =
    new Map<string, number>();

  for (const payment of receivedPayments) {
    if (!payment.workOrderId) continue;

    const current =
      collectedByWorkOrder.get(
        payment.workOrderId,
      ) || 0;

    collectedByWorkOrder.set(
      payment.workOrderId,
      current +
        Number(payment.amount || 0),
    );
  }

  const confirmedOrders =
    workOrders
      .filter((order) =>
        isConfirmedWorkOrder(
          order.status,
        ),
      )
      .map((order) => {
        const orderValue = Number(
          order.totalAmount || 0,
        );

        const collected =
          collectedByWorkOrder.get(
            order.id,
          ) || 0;

        const pending = Math.max(
          orderValue - collected,
          0,
        );

        return {
          ...order,
          company:
            companyMap.get(
              order.companyId,
            ),
          orderValue,
          collected,
          pending,
        };
      })
      .sort(
        (a, b) =>
          b.orderValue -
          a.orderValue,
      );

  const businessValue =
    confirmedOrders.reduce(
      (sum, order) =>
        sum + order.orderValue,
      0,
    );

  const collectedAmount =
    confirmedOrders.reduce(
      (sum, order) =>
        sum + order.collected,
      0,
    );

  const pendingAmount =
    confirmedOrders.reduce(
      (sum, order) =>
        sum + order.pending,
      0,
    );

  const fullyPaidOrders =
    confirmedOrders.filter(
      (order) =>
        order.orderValue > 0 &&
        order.pending <= 0,
    ).length;

  return (
    <main className="orders-page">

      {/* HEADER */}

      <header className="orders-header">

        <div>
          <span className="orders-eyebrow">
            HYDERABAD BUSINESS
          </span>

          <h1>Confirmed Orders</h1>

          <p>
            Monitor confirmed client work,
            business value, collections and
            outstanding amounts from one
            management view.
          </p>
        </div>

        <Link
          href="/admin"
          className="orders-back"
        >
          Dashboard
          <ArrowRight size={15} />
        </Link>

      </header>

      {/* KPI CARDS */}

      <section className="orders-kpis">

        <OrderMetric
          title="Orders Closed"
          value={String(
            confirmedOrders.length,
          )}
          note="Confirmed work orders"
          icon={
            <ClipboardCheck size={23} />
          }
          tone="blue"
        />

        <OrderMetric
          title="Business Value"
          value={money(businessValue)}
          note="Confirmed order value"
          icon={
            <IndianRupee size={23} />
          }
          tone="purple"
        />

        <OrderMetric
          title="Amount Collected"
          value={money(collectedAmount)}
          note="Received against orders"
          icon={
            <CheckCircle2 size={23} />
          }
          tone="green"
        />

        <OrderMetric
          title="Pending Amount"
          value={money(pendingAmount)}
          note="Outstanding balance"
          icon={
            <WalletCards size={23} />
          }
          tone="amber"
        />

      </section>

      {/* SUMMARY BAR */}

      <section className="orders-summary">

        <div>
          <span>Confirmed Orders</span>
          <strong>
            {confirmedOrders.length}
          </strong>
        </div>

        <div>
          <span>Fully Collected</span>
          <strong>
            {fullyPaidOrders}
          </strong>
        </div>

        <div>
          <span>Business Value</span>
          <strong>
            {money(businessValue)}
          </strong>
        </div>

        <div>
          <span>Outstanding</span>
          <strong className="pending">
            {money(pendingAmount)}
          </strong>
        </div>

      </section>

      {/* ORDER REGISTER */}

      <section className="orders-panel">

        <div className="orders-panel-header">

          <div className="orders-panel-heading">

            <div className="orders-panel-icon">
              <ReceiptText size={20} />
            </div>

            <div>
              <span>
                BUSINESS REGISTER
              </span>

              <h2>
                Confirmed Work Orders
              </h2>

              <p>
                Client-wise order value,
                collections and outstanding
                balance
              </p>
            </div>

          </div>

          <div className="orders-count">
            {confirmedOrders.length}{" "}
            {confirmedOrders.length === 1
              ? "Order"
              : "Orders"}
          </div>

        </div>

        {confirmedOrders.length === 0 ? (

          <div className="orders-empty">

            <div className="orders-empty-icon">
              <ClipboardCheck
                size={30}
              />
            </div>

            <h3>
              No confirmed orders
            </h3>

            <p>
              Confirmed work orders will
              appear here once they are
              created against clients.
            </p>

            <Link href="/admin/companies">
              Open Clients
              <ArrowRight size={14} />
            </Link>

          </div>

        ) : (

          <div className="orders-table-wrap">

            <table className="orders-table">

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
                  <th>View</th>
                </tr>
              </thead>

              <tbody>

                {confirmedOrders.map(
                  (order) => (

                    <tr key={order.id}>

                      <td>

                        {order.company ? (

                          <Link
                            className="orders-client"
                            href={`/admin/companies/${order.company.id}`}
                          >
                            <span className="orders-client-icon">
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

                          <span className="orders-muted">
                            Company unavailable
                          </span>

                        )}

                      </td>

                      <td>
                        <div className="orders-number">
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
                            order.orderValue,
                          )}
                        </strong>
                      </td>

                      <td className="money">
                        <strong className="collected">
                          {money(
                            order.collected,
                          )}
                        </strong>
                      </td>

                      <td className="money">
                        <strong
                          className={
                            order.pending > 0
                              ? "outstanding"
                              : "paid"
                          }
                        >
                          {money(
                            order.pending,
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`orders-status ${statusClass(
                            order.status,
                          )}`}
                        >
                          {order.status ||
                            "Confirmed"}
                        </span>
                      </td>

                      <td>

                        {order.company ? (

                          <Link
                            href={`/admin/companies/${order.company.id}`}
                            className="orders-view"
                          >
                            View
                            <ArrowRight
                              size={13}
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

      <div className="orders-note">

        <CheckCircle2 size={17} />

        <div>
          <strong>
            Live business data
          </strong>

          <span>
            Business value comes from
            confirmed work orders.
            Collected amount comes from
            received payments linked to
            those work orders. Pending
            amount is calculated as order
            value minus received amount.
          </span>
        </div>

      </div>

    </main>
  );
}

function OrderMetric({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  tone:
    | "blue"
    | "green"
    | "purple"
    | "amber";
}) {
  return (
    <article
      className={`orders-kpi ${tone}`}
    >
      <div className="orders-kpi-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}