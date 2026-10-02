import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { db } from "@/src/prisma/db";
import PaymentRecordForm from "@/components/PaymentRecordForm";
import "./record.css";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;
const text = (v: unknown) => String(v ?? "").trim();
const number = (v: unknown) => Number(v || 0);
const received = (v: unknown) => ["received", "paid", "collected", "completed"].includes(text(v).toLowerCase());
const confirmed = (v: unknown) => !["cancelled", "canceled", "rejected", "lost", "draft"].includes(text(v).toLowerCase());

async function allRows(model: { all: () => unknown }): Promise<Row[]> {
  return await (model.all() as unknown as Promise<Row[]>);
}

export default async function RecordPaymentPage() {
  const [companies, workOrders, payments] = await Promise.all([
    allRows(db.orm.public.Company),
    allRows(db.orm.public.WorkOrder),
    allRows(db.orm.public.Payment),
  ]);

  const companyNames = new Map(companies.map((c) => [text(c.id), text(c.name)]));
  const collected = new Map<string, number>();
  for (const p of payments) {
    if (!received(p.status) || !p.workOrderId) continue;
    const id = text(p.workOrderId);
    collected.set(id, (collected.get(id) || 0) + number(p.amount));
  }

  const orders = workOrders
    .filter((w) => confirmed(w.status))
    .map((w) => {
      const id = text(w.id);
      const totalAmount = number(w.totalAmount);
      const alreadyCollected = collected.get(id) || 0;
      return {
        id,
        companyId: text(w.companyId),
        companyName: companyNames.get(text(w.companyId)) || "Unknown client",
        workOrderNumber: text(w.workOrderNumber),
        service: text(w.service),
        totalAmount,
        collected: alreadyCollected,
        pending: Math.max(totalAmount - alreadyCollected, 0),
      };
    })
    .filter((w) => w.pending > 0)
    .sort((a, b) => b.pending - a.pending);

  return <div className="payment-control-page">
    <header className="payment-control-header">
      <div><span>COLLECTION CONTROL</span><h1>Record Received Payment</h1><p>Select the pending work order, confirm the amount received and save. The outstanding balance recalculates automatically.</p></div>
      <Link href="/admin/payments?view=pending"><ArrowLeft size={16}/> Pending Payments</Link>
    </header>
    <section className="payment-control-panel">
      <div className="payment-control-title"><WalletCards size={20}/><div><strong>Manual Payment Update</strong><p>Use this immediately when the client confirms payment.</p></div></div>
      <PaymentRecordForm orders={orders}/>
    </section>
  </div>;
}
