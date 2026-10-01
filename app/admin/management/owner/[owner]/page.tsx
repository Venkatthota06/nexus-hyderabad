import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarClock, CircleDollarSign, FileText, Target, TrendingUp, UsersRound, WalletCards } from "lucide-react";
import { db } from "@/src/prisma/db";
import "../../management.css";

export const dynamic="force-dynamic";
type Row=Record<string,unknown>;
async function rows(t:"Company"|"Lead"|"Quotation"|"WorkOrder"|"Payment"){try{return await(db.orm.public[t] as unknown as{all:()=>Promise<Row[]>}).all()}catch{return[]}}
const n=(v:unknown)=>Number(v||0),txt=(v:unknown)=>String(v||"").trim(),low=(v:unknown)=>txt(v).toLowerCase();
const money=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(v);
const pct=(a:number,b:number)=>b?`${Math.round(a/b*100)}%`:"0%";
const active=(s:unknown)=>!["inactive","cancelled","canceled","closed","rejected","void","won","lost"].includes(low(s));
const openQ=(s:unknown)=>!["accepted","approved","won","closed","rejected","cancelled","canceled","expired"].includes(low(s));
const valid=(s:unknown)=>!["cancelled","canceled","rejected","void"].includes(low(s));
const paid=(s:unknown)=>["received","paid","collected","completed"].includes(low(s));
function follow(x:Row){if(!x.nextFollowUp)return"none";const d=new Date(String(x.nextFollowUp)),z=new Date(),a=new Date(z.getFullYear(),z.getMonth(),z.getDate()).getTime(),b=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return b<a?"overdue":b===a?"today":"upcoming"}
const date=(v:unknown)=>{if(!v)return"—";const d=new Date(String(v));return Number.isNaN(d.getTime())?"—":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})};

export default async function OwnerPage({params}:{params:Promise<{owner:string}>}){
  const {owner:raw}=await params;const owner=decodeURIComponent(raw);
  const [companies,allLeads,allQuotes,allOrders,allPayments]=await Promise.all([rows("Company"),rows("Lead"),rows("Quotation"),rows("WorkOrder"),rows("Payment")]);
  const same=(v:unknown)=>(txt(v)||"Unassigned").toLowerCase()===owner.toLowerCase();
  const leads=allLeads.filter(x=>same(x.salesOwner)),quotes=allQuotes.filter(x=>same(x.salesOwner)),orders=allOrders.filter(x=>same(x.salesOwner)&&valid(x.status));
  const orderIds=new Set(orders.map(x=>String(x.id))),quoteIds=new Set(quotes.map(x=>String(x.id)));
  const payments=allPayments.filter(x=>paid(x.status)&&(orderIds.has(String(x.workOrderId))||quoteIds.has(String(x.quotationId))));
  const business=orders.reduce((a,x)=>a+n(x.totalAmount),0),collected=payments.reduce((a,x)=>a+n(x.amount),0),outstanding=Math.max(business-collected,0),activeLeads=leads.filter(x=>active(x.status)),openQuotes=quotes.filter(x=>openQ(x.status));
  const overdue=activeLeads.filter(x=>follow(x)==="overdue"),today=activeLeads.filter(x=>follow(x)==="today"),noFollow=activeLeads.filter(x=>follow(x)==="none");
  const companyName=(id:unknown)=>txt(companies.find(c=>String(c.id)===String(id))?.name)||"Unknown company";
  const sources=new Map<string,number>();leads.forEach(x=>{const s=txt(x.source)||"Unspecified";sources.set(s,(sources.get(s)||0)+1)});
  const sourceRows=[...sources].sort((a,b)=>b[1]-a[1]);
  const cards=[
    ["Leads",leads.length,`${activeLeads.length} active`,"#owner-leads",<Target key="l"/>],
    ["Quotations",quotes.length,`${openQuotes.length} open`,"#owner-quotes",<FileText key="q"/>],
    ["Orders",orders.length,`${pct(orders.length,quotes.length)} quote conversion`,"#owner-orders",<TrendingUp key="o"/>],
    ["Business",money(business),`${money(orders.length?business/orders.length:0)} avg. order`,"#owner-orders",<TrendingUp key="b"/>],
    ["Collected",money(collected),`${pct(collected,business)} collection rate`,"#owner-payments",<CircleDollarSign key="c"/>],
    ["Outstanding",money(outstanding),"Business less collections","#owner-payments",<WalletCards key="p"/>],
  ];
  return <main className="mi-page owner-page">
    <header className="mi-owner-hero"><div><Link href="/admin/management" className="mi-back"><ArrowLeft size={15}/> Management</Link><span>INDIVIDUAL SALES INTELLIGENCE • V6</span><h1>{owner}</h1><p>Complete ownership trail from lead generation through quotation, order and collection.</p></div><div className="mi-owner-health"><UsersRound/><div><small>ATTENTION</small><strong>{overdue.length}</strong><span>overdue follow-ups</span></div></div></header>
    <section className="mi-owner-kpis">{cards.map(([label,value,note,href,icon])=><Link href={String(href)} className="mi-owner-kpi" key={String(label)}><div className="mi-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div><ArrowRight size={14}/></Link>)}</section>

    <section className="mi-grid"><article className="mi-panel"><div className="mi-panel-head"><div><span>PERSONAL SALES FUNNEL</span><h2>Conversion performance</h2></div><TrendingUp/></div><div className="mi-flow"><a href="#owner-leads"><strong>{leads.length}</strong><span>Leads</span></a><i>→ <b>{pct(quotes.length,leads.length)}</b></i><a href="#owner-quotes"><strong>{quotes.length}</strong><span>Quotes</span></a><i>→ <b>{pct(orders.length,quotes.length)}</b></i><a href="#owner-orders"><strong>{orders.length}</strong><span>Orders</span></a></div></article><article className="mi-panel"><div className="mi-panel-head"><div><span>FOLLOW-UP HEALTH</span><h2>What needs attention</h2></div><CalendarClock/></div><div className="mi-attention-grid"><a href="#owner-attention" className="danger"><strong>{overdue.length}</strong><span>Overdue</span></a><a href="#owner-attention" className="warn"><strong>{today.length}</strong><span>Due today</span></a><a href="#owner-attention"><strong>{noFollow.length}</strong><span>No next action</span></a><a href="#owner-quotes"><strong>{openQuotes.length}</strong><span>Open quotes</span></a></div></article></section>

    <section className="mi-panel mi-detail-panel" id="owner-attention"><div className="mi-panel-head"><div><span>ACTION REQUIRED</span><h2>Follow-ups requiring management visibility</h2></div><CalendarClock/></div><div className="mi-record-grid">{[...overdue,...today,...noFollow].slice(0,12).map(x=><Link href={`/admin/leads/${String(x.id)}`} className="mi-record-card" key={String(x.id)}><div><strong>{txt(x.company)||txt(x.name)||"Lead"}</strong><span>{txt(x.service)||"Service not specified"}</span></div><div><span className={`mi-state ${follow(x)}`}>{follow(x)==="none"?"No follow-up":follow(x)}</span><small>{date(x.nextFollowUp)}</small></div></Link>)}{overdue.length+today.length+noFollow.length===0&&<p className="mi-empty">No follow-up exceptions for this owner.</p>}</div></section>

    <section className="mi-panel mi-detail-panel" id="owner-leads"><div className="mi-panel-head"><div><span>OWNED LEADS</span><h2>{leads.length} leads attributed to {owner}</h2></div><Target/></div><div className="mi-detail-table-wrap"><table className="mi-detail-table"><thead><tr><th>Company / Contact</th><th>Service</th><th>Source</th><th>Status</th><th>Next Follow-up</th><th></th></tr></thead><tbody>{leads.map(x=><tr key={String(x.id)}><td><strong>{txt(x.company)||txt(x.name)}</strong><small>{txt(x.name)}</small></td><td>{txt(x.service)||"—"}</td><td>{txt(x.source)||"—"}</td><td>{txt(x.status)||"—"}</td><td>{date(x.nextFollowUp)}</td><td><Link href={`/admin/leads/${String(x.id)}`}>Open <ArrowRight size={12}/></Link></td></tr>)}</tbody></table></div></section>

    <section className="mi-panel mi-detail-panel" id="owner-quotes"><div className="mi-panel-head"><div><span>QUOTATION PIPELINE</span><h2>{quotes.length} quotations owned by {owner}</h2></div><FileText/></div><div className="mi-detail-table-wrap"><table className="mi-detail-table"><thead><tr><th>Quotation</th><th>Company</th><th>Service</th><th>Status</th><th>Total</th><th>Follow-up</th><th></th></tr></thead><tbody>{quotes.map(x=><tr key={String(x.id)}><td><strong>{txt(x.quotationNumber)}</strong></td><td>{companyName(x.companyId)}</td><td>{txt(x.service)||"—"}</td><td>{txt(x.status)||"—"}</td><td className="mi-positive">{money(n(x.totalAmount))}</td><td>{date(x.nextFollowUp)}</td><td><Link href={`/admin/quotations/${String(x.id)}`}>Open <ArrowRight size={12}/></Link></td></tr>)}</tbody></table></div></section>

    <section className="mi-panel mi-detail-panel" id="owner-orders"><div className="mi-panel-head"><div><span>BUSINESS GENERATED</span><h2>{money(business)} across {orders.length} orders</h2></div><TrendingUp/></div><div className="mi-detail-table-wrap"><table className="mi-detail-table"><thead><tr><th>Work Order</th><th>Company</th><th>Service</th><th>Status</th><th>Confirmed</th><th>Value</th><th>Trace</th></tr></thead><tbody>{orders.map(x=><tr key={String(x.id)}><td><strong>{txt(x.workOrderNumber)}</strong></td><td>{companyName(x.companyId)}</td><td>{txt(x.service)||"—"}</td><td>{txt(x.status)||"—"}</td><td>{date(x.confirmedDate)}</td><td className="mi-positive">{money(n(x.totalAmount))}</td><td>{x.quotationId?<Link href={`/admin/quotations/${String(x.quotationId)}`}>Quotation <ArrowRight size={12}/></Link>:<Link href={`/admin/companies/${String(x.companyId)}`}>Company <ArrowRight size={12}/></Link>}</td></tr>)}</tbody></table></div></section>

    <section className="mi-grid" id="owner-payments"><article className="mi-panel"><div className="mi-panel-head"><div><span>COLLECTION TRACE</span><h2>{money(collected)} received</h2></div><CircleDollarSign/></div><div className="mi-payment-list">{payments.slice(0,12).map(x=><div key={String(x.id)}><span>{date(x.paymentDate)}</span><strong>{money(n(x.amount))}</strong><small>{txt(x.paymentMethod)||txt(x.status)||"Payment"}</small></div>)}{payments.length===0&&<p className="mi-empty">No received payments linked to this owner.</p>}</div></article><article className="mi-panel"><div className="mi-panel-head"><div><span>SOURCE MIX</span><h2>Where this owner's leads originate</h2></div><BarChartIcon/></div><div className="mi-source-chips">{sourceRows.map(([name,count])=><a href="#owner-leads" key={name}><strong>{count}</strong><span>{name}</span></a>)}{sourceRows.length===0&&<p className="mi-empty">No lead source data.</p>}</div></article></section>
  </main>;
}
function BarChartIcon(){return <TrendingUp/>}
