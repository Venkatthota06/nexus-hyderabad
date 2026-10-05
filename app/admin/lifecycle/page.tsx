import Link from "next/link";
import { db } from "@/src/prisma/db";
import "./lifecycle.css";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;
const text = (v: unknown) => String(v ?? "").trim();
const num = (v: unknown) => Number(v || 0);
async function rows(model: { all: () => unknown }): Promise<Row[]> { return await (model.all() as Promise<Row[]>); }
const money = (v:number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const paid = (s:unknown) => ["received","paid","collected","completed"].includes(text(s).toLowerCase());

export default async function LifecyclePage() {
  const [companies, quotations, orders, samples, reports, payments] = await Promise.all([
    rows(db.orm.public.Company), rows(db.orm.public.Quotation), rows(db.orm.public.WorkOrder),
    rows(db.orm.public.Sample), rows(db.orm.public.Report), rows(db.orm.public.Payment),
  ]);
  const company = new Map(companies.map(c => [text(c.id), text(c.name)]));
  const accepted = quotations.filter(q => text(q.status).toLowerCase() === "accepted");
  const confirmed = orders.filter(o => !["cancelled","canceled","rejected","lost","draft"].includes(text(o.status).toLowerCase()));
  const delivered = reports.filter(r => text(r.status).toLowerCase() === "delivered");
  const collected = payments.filter(p => paid(p.status)).reduce((a,p)=>a+num(p.amount),0);
  const orderValue = confirmed.reduce((a,o)=>a+num(o.totalAmount),0);
  const outstanding = Math.max(orderValue-collected,0);
  const orderByQuote = new Map(confirmed.filter(o=>o.quotationId).map(o=>[text(o.quotationId),o]));
  const sampleByOrder = new Map(samples.filter(s=>s.workOrderId).map(s=>[text(s.workOrderId),s]));
  const reportBySample = new Map(reports.filter(r=>r.sampleId).map(r=>[text(r.sampleId),r]));
  const paymentByOrder = new Map<string,number>();
  for (const p of payments) if (paid(p.status) && p.workOrderId) paymentByOrder.set(text(p.workOrderId),(paymentByOrder.get(text(p.workOrderId))||0)+num(p.amount));
  const pipeline = accepted.map(q=>{
    const o=orderByQuote.get(text(q.id)); const s=o?sampleByOrder.get(text(o.id)):undefined; const r=s?reportBySample.get(text(s.id)):undefined;
    const total=o?num(o.totalAmount):num(q.totalAmount); const received=o?(paymentByOrder.get(text(o.id))||0):0;
    return {q,o,s,r,total,received,pending:Math.max(total-received,0)};
  }).sort((a,b)=>b.pending-a.pending);

  return <div className="life-page">
    <header className="life-head"><div><span>MANAGEMENT CONTROL</span><h1>Business Lifecycle</h1><p>One view from accepted quotation to order, sample, report and collection.</p></div><Link href="/admin/business">Business Dashboard</Link></header>
    <section className="life-kpis">
      <div><span>Accepted Quotations</span><strong>{accepted.length}</strong></div><div><span>Confirmed Orders</span><strong>{confirmed.length}</strong></div><div><span>Active Samples</span><strong>{samples.length}</strong></div><div><span>Reports Delivered</span><strong>{delivered.length}</strong></div><div><span>Order Value</span><strong>{money(orderValue)}</strong></div><div className="danger"><span>Outstanding</span><strong>{money(outstanding)}</strong></div>
    </section>
    <section className="life-panel"><div className="life-title"><div><span>LIVE PIPELINE</span><h2>Accepted business journey</h2></div><small>{pipeline.length} accepted quotations tracked</small></div>
      {pipeline.length===0 ? <div className="life-empty">No accepted quotations are currently available.</div> : <div className="life-list">{pipeline.map(({q,o,s,r,total,received,pending})=><article key={text(q.id)} className="life-row">
        <div className="life-client"><strong>{company.get(text(q.companyId))||"Unknown client"}</strong><span>{text(q.quotationNumber)} · {text(q.service)||"Service"}</span><small>{money(total)} business value</small></div>
        <div className="life-steps">
          <Link className="done" href={`/admin/quotations/${text(q.id)}`}><b>1</b><span>Quotation<small>Accepted</small></span></Link>
          {o?<Link className="done" href={`/admin/companies/${text(q.companyId)}`}><b>2</b><span>Order<small>{text(o.workOrderNumber)}</small></span></Link>:<Link className="next" href={`/admin/companies/${text(q.companyId)}/work-orders/new?quotationId=${text(q.id)}`}><b>2</b><span>Order<small>Create now</small></span></Link>}
          {s?<Link className="done" href={`/admin/samples/${text(s.id)}`}><b>3</b><span>Sample<small>{text(s.sampleNumber)}</small></span></Link>:<Link className={o?"next":"locked"} href={o?`/admin/samples/new?companyId=${text(q.companyId)}&quotationId=${text(q.id)}&workOrderId=${text(o.id)}`:"#"}><b>3</b><span>Sample<small>{o?"Register":"Await order"}</small></span></Link>}
          {r?<Link className="done" href={`/admin/reports/${text(r.id)}`}><b>4</b><span>Report<small>{text(r.status)}</small></span></Link>:<Link className={s?"next":"locked"} href={s?`/admin/reports/new?sampleId=${text(s.id)}&companyId=${text(q.companyId)}`:"#"}><b>4</b><span>Report<small>{s?"Create / update":"Await sample"}</small></span></Link>}
          <Link className={o&&pending>0?"money":"done"} href={o?`/admin/payments/record?workOrder=${text(o.id)}&companyId=${text(q.companyId)}`:"#"}><b>5</b><span>Payment<small>{o?(pending>0?`${money(pending)} pending`:"Collected"):"Await order"}</small></span></Link>
        </div>
        <div className="life-money"><span>Collected</span><strong>{money(received)}</strong><small>{pending>0?`${money(pending)} pending`:o?"Payment cleared":"Order not created"}</small></div>
      </article>)}</div>}
    </section>
  </div>;
}
