"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, IndianRupee, RefreshCw, Target } from "lucide-react";
import "./business.css";

type Progress = { id: string; companyName: string; locationName: string; service: string; sampleType: string; target: number; collected: number; remaining: number; completionPercent: number };
type Payment = { id: string; workOrderNumber: string; companyName: string; totalAmount: number; receivedAmount: number; pendingAmount: number };
type Summary = {
  success: boolean; message?: string; month?: string;
  monthly?: { recurringTarget: number; recurringCollected: number; recurringRemaining: number; recurringCompletionPercent: number; oneTimeSamples: number; totalCollected: number; testingPending: number; reportsPending: number; reportsReady: number; reportsDelivered: number; ordersReceived: number; orderValue: number; paymentsReceived: number; pendingPaymentValue: number };
  sampleMix?: Record<string, number>; recurringProgress?: Progress[]; pendingPayments?: Payment[];
  dataQuality?: Record<string, number>;
};

const money = (value = 0) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default function BusinessPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/business/summary", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Unable to load MIS.");
      setData(json);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load MIS."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const m = data?.monthly;
  const quality = data?.dataQuality || {};
  const qualityTotal = Object.values(quality).reduce((sum, value) => sum + Number(value || 0), 0);

  return <main className="biz-page">
    <div className="biz-top"><div><span>Business Automation V4</span><strong>Monthly MIS & Commercial Control</strong></div><button onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
    <section className="biz-hero"><div><span>Hyderabad Management View</span><h1>Business Operations & Revenue Control</h1><p>One live view connecting recurring targets, samples, laboratory progress, reports, orders and payments.</p></div><div><small>Recurring completion</small><strong>{m?.recurringCompletionPercent || 0}%</strong><span>{m?.recurringCollected || 0} / {m?.recurringTarget || 0} samples</span></div></section>
    {error && <div className="biz-error">{error}</div>}
    {loading && !data ? <div className="biz-loading">Loading business MIS…</div> : <>
      <section className="biz-cards">
        <article><Target/><span>Recurring Target</span><strong>{m?.recurringTarget || 0}</strong><small>{m?.recurringRemaining || 0} remaining</small></article>
        <article><CheckCircle2/><span>Total Collected</span><strong>{m?.totalCollected || 0}</strong><small>{m?.oneTimeSamples || 0} one-time</small></article>
        <article><BarChart3/><span>Orders This Month</span><strong>{m?.ordersReceived || 0}</strong><small>{money(m?.orderValue)}</small></article>
        <article><IndianRupee/><span>Payments Received</span><strong>{money(m?.paymentsReceived)}</strong><small>{money(m?.pendingPaymentValue)} pending</small></article>
        <article><AlertTriangle/><span>Reports Pending</span><strong>{m?.reportsPending || 0}</strong><small>{m?.reportsReady || 0} ready to deliver</small></article>
        <article><AlertTriangle/><span>Data Quality</span><strong>{qualityTotal}</strong><small>records need review</small></article>
      </section>

      <section className="biz-grid">
        <div className="biz-panel"><div className="biz-head"><div><span>Monthly commitments</span><h2>Recurring Service Progress</h2></div><Link href="/admin/recurring-services">Manage <ArrowRight size={14}/></Link></div>
          <div className="biz-table">{data?.recurringProgress?.length ? data.recurringProgress.map(row => <div className="biz-row" key={row.id}><div><strong>{row.companyName}</strong><small>{row.locationName} · {row.sampleType}</small></div><span>{row.collected}/{row.target}</span><div className="biz-progress"><i style={{width:`${row.completionPercent}%`}}/></div><b>{row.remaining} left</b></div>) : <p className="biz-empty">No active recurring commitments.</p>}</div>
        </div>
        <div className="biz-panel"><div className="biz-head"><div><span>Collections</span><h2>Sample Mix</h2></div><Link href="/admin/samples">Samples <ArrowRight size={14}/></Link></div>
          <div className="biz-mix">{Object.entries(data?.sampleMix || {}).map(([name,value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
        </div>
      </section>

      <section className="biz-grid">
        <div className="biz-panel"><div className="biz-head"><div><span>Commercial action</span><h2>Pending Payments</h2></div><Link href="/admin/payments">Payments <ArrowRight size={14}/></Link></div>
          <div className="biz-table">{data?.pendingPayments?.length ? data.pendingPayments.slice(0,10).map(row => <div className="biz-pay" key={row.id}><div><strong>{row.companyName}</strong><small>{row.workOrderNumber}</small></div><span>{money(row.receivedAmount)} received</span><b>{money(row.pendingAmount)} pending</b></div>) : <p className="biz-empty">No linked order balance is pending.</p>}</div>
        </div>
        <div className="biz-panel"><div className="biz-head"><div><span>Action required</span><h2>Data Quality Control</h2></div><Link href="/admin/operations">Operations <ArrowRight size={14}/></Link></div>
          <div className="biz-quality">{Object.entries(quality).map(([name,value]) => <div key={name} className={value ? "warn" : "ok"}><span>{name.replace(/([A-Z])/g," $1")}</span><strong>{value}</strong></div>)}</div>
        </div>
      </section>
    </>}
  </main>;
}
