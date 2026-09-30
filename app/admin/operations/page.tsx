"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardList, FileWarning, FlaskConical, RefreshCw } from "lucide-react";

type Summary = {
  generatedAt?: string;
  totals?: {
    records?: number;
    physicalSamples?: number;
    pendingReports?: number;
    deliveredReports?: number;
    missingExpectedCompletionDate?: number;
    dueSoon?: number;
    overdue?: number;
  };
  dueSoon?: Array<{ id: string; sampleNumber: string; sampleType: string; sampleCount: number; companyName?: string; expectedCompletionDate?: string }>;
  overdue?: Array<{ id: string; sampleNumber: string; sampleType: string; sampleCount: number; companyName?: string; expectedCompletionDate?: string }>;
};

function Metric({ label, value, note, href, icon }: { label: string; value: number; note: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <span className="rounded-xl bg-slate-100 p-2.5 text-blue-700">{icon}</span>
        <ArrowRight size={17} className="text-slate-400" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <strong className="mt-1 block text-3xl text-slate-900">{value}</strong>
      <span className="mt-1 block text-xs text-slate-500">{note}</span>
    </Link>
  );
}

function Queue({ title, items, empty }: { title: string; items: Summary["overdue"]; empty: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div><h2 className="font-bold text-slate-900">{title}</h2><p className="text-xs text-slate-500">Open a sample to update its workflow.</p></div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{items?.length || 0}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items?.length ? items.slice(0, 8).map((item) => (
          <Link key={item.id} href={`/admin/samples/${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
            <div className="min-w-0">
              <strong className="block truncate text-sm text-slate-900">{item.sampleNumber} · {item.sampleType}</strong>
              <span className="block truncate text-xs text-slate-500">{item.companyName || "Client"} · Qty {item.sampleCount}</span>
            </div>
            <div className="shrink-0 text-right"><span className="block text-xs font-semibold text-slate-700">{item.expectedCompletionDate || "No date"}</span><ArrowRight size={15} className="ml-auto mt-1 text-slate-400" /></div>
          </Link>
        )) : <p className="px-5 py-10 text-center text-sm text-slate-500">{empty}</p>}
      </div>
    </section>
  );
}

export default function OperationsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/operations/summary", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || json.success === false) throw new Error(json.message || "Unable to load operations summary.");
      setData(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load operations summary."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);
  const t = data?.totals || {};

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Laboratory Operations</p><h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Operations Control Center</h1><p className="mt-1 text-sm text-slate-500">Due dates, report delivery and samples needing action in one place.</p></div>
          <div className="flex gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><RefreshCw size={16} /> Refresh</button><Link href="/admin/samples" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white">All Samples <ArrowRight size={16} /></Link></div>
        </header>

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading && !data ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading live operations…</div> : <>
          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Overdue" value={t.overdue || 0} note="Expected date has passed" href="/admin/samples?report=pending" icon={<AlertTriangle size={21} />} />
            <Metric label="Due Soon" value={t.dueSoon || 0} note="Due within the next 2 days" href="/admin/samples?report=pending" icon={<CalendarClock size={21} />} />
            <Metric label="Pending Reports" value={t.pendingReports || 0} note="Physical samples awaiting delivery" href="/admin/samples?report=pending" icon={<FileWarning size={21} />} />
            <Metric label="Missing Due Date" value={t.missingExpectedCompletionDate || 0} note="Open samples without expected date" href="/admin/samples?report=pending" icon={<ClipboardList size={21} />} />
            <Metric label="Sample Records" value={t.records || 0} note={`${t.physicalSamples || 0} physical samples`} href="/admin/samples" icon={<FlaskConical size={21} />} />
            <Metric label="Delivered Reports" value={t.deliveredReports || 0} note="Physical samples completed" href="/admin/samples?report=delivered" icon={<CheckCircle2 size={21} />} />
          </section>

          <section className="grid gap-5 lg:grid-cols-2"><Queue title="Overdue Reports" items={data?.overdue} empty="No overdue reports. Good." /><Queue title="Due Soon" items={data?.dueSoon} empty="Nothing is due in the next two days." /></section>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5"><strong className="text-sm text-blue-950">Workflow rule</strong><p className="mt-1 text-sm text-blue-800">Keep Expected Completion Date updated on each sample. The system will surface due-soon and overdue work automatically and the notification bell will avoid duplicate alerts.</p></div>
        </>}
      </div>
    </main>
  );
}
