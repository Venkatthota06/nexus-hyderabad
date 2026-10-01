import Link from "next/link";
import { ArrowRight, BarChart3, CircleDollarSign, ClipboardCheck, FileText, FlaskConical, Target, UsersRound } from "lucide-react";
import { db } from "@/src/prisma/db";
import "./management.css";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;
async function rows(table: "Company"|"Lead"|"Quotation"|"WorkOrder"|"Payment"|"Sample") {
  try { return await (db.orm.public[table] as unknown as { all:()=>Promise<Row[]> }).all(); } catch { return []; }
}
const n=(v:unknown)=>Number(v||0);
const active=(s:unknown)=>!["inactive","cancelled","canceled","closed","rejected","void"].includes(String(s||"").toLowerCase());
const openQuote=(s:unknown)=>!["accepted","approved","won","closed","rejected","cancelled","canceled","expired"].includes(String(s||"").toLowerCase());
const validOrder=(s:unknown)=>!["cancelled","canceled","rejected","void"].includes(String(s||"").toLowerCase());
const paid=(s:unknown)=>["received","paid","collected","completed"].includes(String(s||"").toLowerCase());
const money=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(v);

export default async function ManagementPage(){
  const [companies,leads,quotes,orders,payments,samples]=await Promise.all([rows("Company"),rows("Lead"),rows("Quotation"),rows("WorkOrder"),rows("Payment"),rows("Sample")]);
  const liveLeads=leads.filter(x=>active(x.status)); const liveQuotes=quotes.filter(x=>openQuote(x.status)); const liveOrders=orders.filter(x=>validOrder(x.status));
  const business=liveOrders.reduce((a,x)=>a+n(x.totalAmount),0); const collected=payments.filter(x=>paid(x.status)).reduce((a,x)=>a+n(x.amount),0); const pending=Math.max(business-collected,0);
  const sampleCount=samples.reduce((a,x)=>a+n(x.sampleCount||1),0);
  const cards=[
    ["Clients",companies.length,"Company master","/admin/companies",<UsersRound key="c"/>],
    ["Active Leads",liveLeads.length,"Current sales pipeline","/admin/leads",<Target key="l"/>],
    ["Open Quotations",liveQuotes.length,"Awaiting decision / follow-up","/admin/quotations",<FileText key="q"/>],
    ["Business Value",money(business),`${liveOrders.length} valid orders`,"/admin/orders",<BarChart3 key="b"/>],
    ["Collected",money(collected),"Recorded received payments","/admin/payments",<CircleDollarSign key="p"/>],
    ["Pending",money(pending),"Business value less collections","/admin/payments",<ClipboardCheck key="d"/>],
    ["Samples",sampleCount,"Recorded sample volume","/admin/samples",<FlaskConical key="s"/>],
  ] as const;
  return <main className="mi-page">
    <header className="mi-hero"><div><span>MANAGEMENT INTELLIGENCE • V5</span><h1>Hyderabad Business Command Center</h1><p>A single management view of sales pipeline, confirmed business, collections and operational workload.</p></div><Link href="/admin/business">Open Business MIS <ArrowRight size={17}/></Link></header>
    <section className="mi-kpis">{cards.map(([title,value,note,href,icon])=><Link href={href} className="mi-card" key={title}><div className="mi-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{note}</small></div><ArrowRight className="mi-arrow" size={16}/></Link>)}</section>
    <section className="mi-grid">
      <article className="mi-panel"><div className="mi-panel-head"><div><span>SALES CONTROL</span><h2>Pipeline at a glance</h2></div><Target/></div><div className="mi-flow"><div><strong>{liveLeads.length}</strong><span>Active Leads</span></div><i>→</i><div><strong>{liveQuotes.length}</strong><span>Open Quotes</span></div><i>→</i><div><strong>{liveOrders.length}</strong><span>Orders</span></div></div><Link href="/admin/follow-ups">Review follow-ups <ArrowRight size={15}/></Link></article>
      <article className="mi-panel mi-finance"><div className="mi-panel-head"><div><span>COLLECTION CONTROL</span><h2>Revenue position</h2></div><CircleDollarSign/></div><div className="mi-money"><div><span>Business</span><strong>{money(business)}</strong></div><div><span>Collected</span><strong>{money(collected)}</strong></div><div><span>Pending</span><strong>{money(pending)}</strong></div></div><div className="mi-bar"><i style={{width:`${business?Math.min(100,(collected/business)*100):0}%`}}/></div><small>{business?Math.round((collected/business)*100):0}% of recorded business value collected</small></article>
    </section>
    <section className="mi-next"><div><span>V5 ROADMAP</span><h2>Management automation being built on this foundation</h2></div><div className="mi-next-items"><span>Lead source & ownership</span><span>Individual sales contribution</span><span>Monthly report automation</span><span>Management alerts</span></div></section>
  </main>;
}
