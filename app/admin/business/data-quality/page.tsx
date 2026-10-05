import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Database, TriangleAlert } from "lucide-react";
import { db } from "@/src/prisma/db";
import "./data-quality.css";

export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
type Table = "Sample" | "WorkOrder" | "Payment" | "RecurringService" | "Company" | "Location";
async function rows(t: Table) { try { return await (db.orm.public[t] as unknown as { all: () => Promise<Row[]> }).all(); } catch { return []; } }
const txt = (v: unknown) => String(v ?? "").trim();
const low = (v: unknown) => txt(v).toLowerCase();
const num = (v: unknown) => { const n = Number(v ?? 0); return Number.isFinite(n) ? n : 0; };
const labels: Record<string,string> = { missingExpectedDate:"Missing Expected Date", missingTestingLocation:"Missing Testing Location", deliveredWithoutDate:"Delivered Without Date", duplicateSampleNumbers:"Duplicate Sample Numbers", ordersWithoutQuotation:"Orders Without Quotation", paymentsWithoutReference:"Payments Without Reference", recurringWithoutLocation:"Recurring Without Location", invalidSampleQuantity:"Invalid Sample Quantity" };
const descriptions: Record<string,string> = { missingExpectedDate:"Collected/open samples without an expected completion date.", missingTestingLocation:"Laboratory-stage samples without a testing location.", deliveredWithoutDate:"Samples marked delivered without a report delivered date.", duplicateSampleNumbers:"Sample numbers used by more than one CRM record.", ordersWithoutQuotation:"Work orders that are not linked to a quotation.", paymentsWithoutReference:"Payments with neither a work-order nor quotation reference.", recurringWithoutLocation:"Active recurring services without a linked service location.", invalidSampleQuantity:"Sample records with zero or negative quantity." };
type SP = Promise<{ issue?: string }>;
export default async function DataQualityPage({ searchParams }: { searchParams: SP }) {
  const { issue = "missingExpectedDate" } = await searchParams;
  const selected = labels[issue] ? issue : "missingExpectedDate";
  const [samples, orders, payments, recurring, companies, locations] = await Promise.all([rows("Sample"), rows("WorkOrder"), rows("Payment"), rows("RecurringService"), rows("Company"), rows("Location")]);
  const company = (id: unknown) => txt(companies.find(x => String(x.id) === String(id))?.name) || "Unknown company";
  const location = (id: unknown) => txt(locations.find(x => String(x.id) === String(id))?.name) || "Location not set";
  const duplicates = new Map<string, Row[]>(); samples.forEach(s => { const k=low(s.sampleNumber); if(k) duplicates.set(k,[...(duplicates.get(k)||[]),s]); });
  const duplicateRows = [...duplicates.values()].filter(group => group.length > 1).flat();
  const activeRecurring = recurring.filter(r => low(r.status) === "active");
  const groups: Record<string, Row[]> = {
    missingExpectedDate: samples.filter(r => low(r.status) !== "planned" && !low(r.reportStatus).includes("deliver") && !r.expectedCompletionDate),
    missingTestingLocation: samples.filter(r => ["received at lab","testing","completed"].includes(low(r.status)) && !txt(r.testingLocation)),
    deliveredWithoutDate: samples.filter(r => low(r.reportStatus).includes("deliver") && !r.reportDeliveredDate),
    duplicateSampleNumbers: duplicateRows,
    ordersWithoutQuotation: orders.filter(r => !r.quotationId),
    paymentsWithoutReference: payments.filter(r => !r.workOrderId && !r.quotationId),
    recurringWithoutLocation: activeRecurring.filter(r => !r.locationId),
    invalidSampleQuantity: samples.filter(r => num(r.sampleCount) <= 0),
  };
  const counts: Record<string,number> = { ...Object.fromEntries(Object.entries(groups).map(([k,v])=>[k, selected === "duplicateSampleNumbers" && k === "duplicateSampleNumbers" ? [...duplicates.values()].filter(g=>g.length>1).length : v.length])) };
  const list = groups[selected] || [];
  const recordHref = (r: Row) => selected === "ordersWithoutQuotation" ? `/admin/companies/${r.companyId}` : selected === "paymentsWithoutReference" ? "/admin/payments" : selected === "recurringWithoutLocation" ? `/admin/companies/${r.companyId}` : `/admin/samples/${r.id}`;
  const title = (r: Row) => selected === "ordersWithoutQuotation" ? txt(r.workOrderNumber)||"Work order" : selected === "paymentsWithoutReference" ? `Payment ${txt(r.id).slice(0,8)}` : selected === "recurringWithoutLocation" ? txt(r.service)||"Recurring service" : txt(r.sampleNumber)||"Sample";
  const detail = (r: Row) => selected === "ordersWithoutQuotation" ? `${company(r.companyId)} · ${txt(r.service)||"Service not set"}` : selected === "paymentsWithoutReference" ? `${company(r.companyId)} · ₹${num(r.amount).toLocaleString("en-IN")}` : selected === "recurringWithoutLocation" ? `${company(r.companyId)} · ${txt(r.sampleType)||"Sample type not set"}` : `${company(r.companyId)} · ${txt(r.sampleType)||"Sample type not set"} · ${r.locationId ? location(r.locationId) : "No location"}`;
  return <main className="dq-page"><header className="dq-hero"><div><Link href="/admin/business"><ArrowLeft size={15}/> Business MIS</Link><span>DATA QUALITY CONTROL</span><h1>CRM Exception Drill-Down</h1><p>Every quality counter opens the exact records behind it so management can investigate and correct the source data.</p></div><Database size={34}/></header><section className="dq-tabs">{Object.entries(labels).map(([key,label])=><Link key={key} href={`/admin/business/data-quality?issue=${key}`} className={selected===key?"active":""}><span>{label}</span><strong>{counts[key]||0}</strong><ArrowRight size={14}/></Link>)}</section><section className="dq-panel"><div className="dq-head"><div><span>SELECTED EXCEPTION</span><h2>{labels[selected]}</h2><p>{descriptions[selected]}</p></div><strong className={list.length?"warn":"ok"}>{selected === "duplicateSampleNumbers" ? counts[selected] : list.length}</strong></div>{list.length?<div className="dq-list">{list.map((r,i)=><Link href={recordHref(r)} key={`${String(r.id)}-${i}`}><TriangleAlert size={17}/><div><strong>{title(r)}</strong><span>{detail(r)}</span>{selected === "duplicateSampleNumbers" && <small>Duplicate sample number · open this record to review</small>}</div><ArrowRight size={16}/></Link>)}</div>:<div className="dq-empty"><CheckCircle2/><strong>No affected records</strong><span>This monitored data-quality check is currently clean.</span></div>}</section><footer className="dq-note"><Database/><div><strong>Live CRM control</strong><span>Counts and drill-down records are recalculated directly from current CRM data whenever this page loads.</span></div></footer></main>;
}
