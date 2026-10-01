import Link from "next/link";
import {
  AlertTriangle, ArrowRight, BarChart3, CalendarClock, CircleDollarSign,
  ClipboardCheck, FileText, FlaskConical, Target, TrendingUp, UsersRound,
  WalletCards,
} from "lucide-react";
import { db } from "@/src/prisma/db";
import "./management.css";

export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
type OwnerStats = { leads:number; activeLeads:number; quotes:number; openQuotes:number; orders:number; business:number; collections:number; overdue:number; today:number };

async function rows(t:"Company"|"Lead"|"Quotation"|"WorkOrder"|"Payment"|"Sample") {
  try { return await (db.orm.public[t] as unknown as { all:()=>Promise<Row[]> }).all(); } catch { return []; }
}
const n=(v:unknown)=>Number(v||0);
const txt=(v:unknown)=>String(v||"").trim();
const low=(v:unknown)=>txt(v).toLowerCase();
const money=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(v);
const pct=(a:number,b:number)=>b ? `${Math.round((a/b)*100)}%` : "0%";
const active=(s:unknown)=>!["inactive","cancelled","canceled","closed","rejected","void","won","lost"].includes(low(s));
const openQ=(s:unknown)=>!["accepted","approved","won","closed","rejected","cancelled","canceled","expired"].includes(low(s));
const valid=(s:unknown)=>!["cancelled","canceled","rejected","void"].includes(low(s));
const paid=(s:unknown)=>["received","paid","collected","completed"].includes(low(s));
function follow(x:Row){if(!x.nextFollowUp)return "none";const d=new Date(String(x.nextFollowUp)),z=new Date(),a=new Date(z.getFullYear(),z.getMonth(),z.getDate()).getTime(),b=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return b<a?"overdue":b===a?"today":"upcoming";}
function sg(v:unknown){const s=low(v);if(!s)return "Unspecified";if(s.includes("web"))return "Website";if(s.includes("linkedin")||s.includes("digital")||s.includes("social"))return "Digital / LinkedIn";if(s.includes("ref"))return "Reference";if(s.includes("field")||s.includes("visit")||s.includes("walk"))return "Field Marketing";return txt(v);}
const ownerHref=(name:string)=>`/admin/management/owner/${encodeURIComponent(name)}`;

export default async function Page(){
  const [companies,leads,quotes,orders,payments,samples]=await Promise.all([rows("Company"),rows("Lead"),rows("Quotation"),rows("WorkOrder"),rows("Payment"),rows("Sample")]);
  const activeLeads=leads.filter(x=>active(x.status));
  const openQuotes=quotes.filter(x=>openQ(x.status));
  const validOrders=orders.filter(x=>valid(x.status));
  const received=payments.filter(x=>paid(x.status));
  const business=validOrders.reduce((a,x)=>a+n(x.totalAmount),0);
  const collected=received.reduce((a,x)=>a+n(x.amount),0);
  const outstanding=Math.max(business-collected,0);
  const sampleCount=samples.reduce((a,x)=>a+n(x.sampleCount||1),0);
  const overdue=activeLeads.filter(x=>follow(x)==="overdue").length;
  const dueToday=activeLeads.filter(x=>follow(x)==="today").length;
  const noFollowUp=activeLeads.filter(x=>follow(x)==="none").length;
  const unread=leads.filter(x=>x.isRead===false).length;
  const avgOrder=validOrders.length?business/validOrders.length:0;

  const src=new Map<string,number>();
  leads.forEach(x=>src.set(sg(x.source),(src.get(sg(x.source))||0)+1));
  const sources=[...src].sort((a,b)=>b[1]-a[1]).slice(0,6),mx=Math.max(1,...sources.map(x=>x[1]));

  const owners=new Map<string,OwnerStats>();
  const get=(name:string)=>{const k=name||"Unassigned";if(!owners.has(k))owners.set(k,{leads:0,activeLeads:0,quotes:0,openQuotes:0,orders:0,business:0,collections:0,overdue:0,today:0});return owners.get(k)!;};
  leads.forEach(x=>{const a=get(txt(x.salesOwner)||"Unassigned");a.leads++;if(active(x.status))a.activeLeads++;if(follow(x)==="overdue")a.overdue++;if(follow(x)==="today")a.today++;});
  quotes.forEach(x=>{const a=get(txt(x.salesOwner)||"Unassigned");a.quotes++;if(openQ(x.status))a.openQuotes++;});
  validOrders.forEach(x=>{const a=get(txt(x.salesOwner)||"Unassigned");a.orders++;a.business+=n(x.totalAmount);});
  received.forEach(x=>{const wo=orders.find(w=>String(w.id)===String(x.workOrderId)),qt=quotes.find(z=>String(z.id)===String(x.quotationId));get(txt(wo?.salesOwner)||txt(qt?.salesOwner)||"Unassigned").collections+=n(x.amount);});
  const ownerRows=[...owners.entries()].sort((a,b)=>b[1].business-a[1].business);

  const kpis=[
    {label:"Clients",value:companies.length,note:"Companies in CRM",href:"/admin/companies",icon:<UsersRound/>,tone:"blue"},
    {label:"Active Leads",value:activeLeads.length,note:`${overdue} overdue`,href:"/admin/leads",icon:<Target/>,tone:"blue"},
    {label:"Open Quotations",value:openQuotes.length,note:`${pct(openQuotes.length,quotes.length)} of quotations`,href:"/admin/quotations",icon:<FileText/>,tone:"violet"},
    {label:"Business Value",value:money(business),note:`${validOrders.length} valid orders`,href:"/admin/orders",icon:<TrendingUp/>,tone:"green"},
    {label:"Collected",value:money(collected),note:`${pct(collected,business)} collection rate`,href:"/admin/payments",icon:<CircleDollarSign/>,tone:"green"},
    {label:"Outstanding",value:money(outstanding),note:"Business less collections",href:"/admin/payments",icon:<WalletCards/>,tone:"amber"},
    {label:"Avg. Order",value:money(avgOrder),note:"Average confirmed value",href:"/admin/orders",icon:<BarChart3/>,tone:"violet"},
    {label:"Samples",value:sampleCount,note:"Total sample count",href:"/admin/samples",icon:<FlaskConical/>,tone:"cyan"},
  ];

  return <main className="mi-page">
    <header className="mi-hero"><div><span>MANAGEMENT INTELLIGENCE • V6</span><h1>Hyderabad Business Command Center</h1><p>Every management number is traceable — from team performance to the exact records behind it.</p></div><Link href="/admin/monthly-report">Monthly Report <ArrowRight size={17}/></Link></header>

    <div className="mi-section-title"><div><span>EXECUTIVE OVERVIEW</span><h2>Business health at a glance</h2></div><small>Click any card to inspect the underlying module</small></div>
    <section className="mi-kpis">{kpis.map(k=><Link href={k.href} className={`mi-card tone-${k.tone}`} key={k.label}><div className="mi-icon">{k.icon}</div><div><span>{k.label}</span><strong>{k.value}</strong><small>{k.note}</small></div><ArrowRight className="mi-arrow" size={16}/></Link>)}</section>

    <section className="mi-grid mi-grid-top">
      <article className="mi-panel mi-funnel"><div className="mi-panel-head"><div><span>SALES FUNNEL</span><h2>Lead → Quotation → Order</h2></div><TrendingUp/></div><div className="mi-flow"><Link href="/admin/leads"><strong>{leads.length}</strong><span>Leads</span></Link><i>→ <b>{pct(quotes.length,leads.length)}</b></i><Link href="/admin/quotations"><strong>{quotes.length}</strong><span>Quotations</span></Link><i>→ <b>{pct(validOrders.length,quotes.length)}</b></i><Link href="/admin/orders"><strong>{validOrders.length}</strong><span>Orders</span></Link></div><p className="mi-explain">Conversion shows how efficiently opportunities move through the commercial pipeline.</p></article>
      <article className="mi-panel mi-finance"><div className="mi-panel-head"><div><span>FINANCIAL HEALTH</span><h2>Business to collection</h2></div><CircleDollarSign/></div><div className="mi-money"><Link href="/admin/orders"><span>Business</span><strong>{money(business)}</strong></Link><Link href="/admin/payments"><span>Collected</span><strong>{money(collected)}</strong></Link><Link href="/admin/payments"><span>Outstanding</span><strong>{money(outstanding)}</strong></Link></div><div className="mi-bar"><i style={{width:`${Math.min(100,business?collected/business*100:0)}%`}}/></div><small>{pct(collected,business)} of business value collected</small></article>
    </section>

    <section className="mi-panel mi-owner-panel"><div className="mi-panel-head"><div><span>INDIVIDUAL SALES INTELLIGENCE</span><h2>Owner performance — click a person for full details</h2></div><UsersRound/></div><div className="mi-table-wrap"><table className="mi-owner-table"><thead><tr><th>Owner</th><th>Leads</th><th>Quotes</th><th>Orders</th><th>Lead→Quote</th><th>Quote→Order</th><th>Business</th><th>Collections</th><th>Outstanding</th><th>Attention</th><th></th></tr></thead><tbody>{ownerRows.map(([name,a])=>{const out=Math.max(a.business-a.collections,0);return <tr key={name}><td><Link className="mi-owner-name" href={ownerHref(name)}><span className="mi-avatar">{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>{a.activeLeads} active leads</small></div></Link></td><td>{a.leads}</td><td>{a.quotes}</td><td>{a.orders}</td><td><span className="mi-rate">{pct(a.quotes,a.leads)}</span></td><td><span className="mi-rate">{pct(a.orders,a.quotes)}</span></td><td className="mi-positive">{money(a.business)}</td><td>{money(a.collections)}</td><td className={out>0?"mi-warning":""}>{money(out)}</td><td>{a.overdue>0?<span className="mi-alert-badge">{a.overdue} overdue</span>:<span className="mi-ok-badge">Clear</span>}</td><td><Link className="mi-view" href={ownerHref(name)}>View <ArrowRight size={13}/></Link></td></tr>})}</tbody></table></div></section>

    <section className="mi-grid">
      <article className="mi-panel"><div className="mi-panel-head"><div><span>LEAD SOURCE INTELLIGENCE</span><h2>Where opportunities originate</h2></div><BarChart3/></div><div className="mi-sources">{sources.map(([name,count])=><Link href="/admin/leads" className="mi-source" key={name}><div><span>{name}</span><strong>{count} leads</strong></div><div className="mi-source-bar"><i style={{width:`${count/mx*100}%`}}/></div></Link>)}</div></article>
      <article className="mi-panel"><div className="mi-panel-head"><div><span>MANAGEMENT ATTENTION</span><h2>Items requiring action</h2></div><AlertTriangle/></div><div className="mi-alerts"><Link className="critical" href="/admin/follow-ups"><CalendarClock/><div><strong>{overdue}</strong><span>Overdue follow-ups</span></div><ArrowRight/></Link><Link className="warning" href="/admin/follow-ups"><CalendarClock/><div><strong>{dueToday}</strong><span>Due today</span></div><ArrowRight/></Link><Link href="/admin/leads"><ClipboardCheck/><div><strong>{noFollowUp}</strong><span>Active leads without next follow-up</span></div><ArrowRight/></Link><Link href="/admin/leads"><Target/><div><strong>{unread}</strong><span>Unread / new leads</span></div><ArrowRight/></Link><Link href="/admin/quotations"><FileText/><div><strong>{openQuotes.length}</strong><span>Open quotations</span></div><ArrowRight/></Link></div></article>
    </section>

    <section className="mi-next"><div><span>V6 MANAGEMENT LAYER</span><h2>Traceable, owner-level business intelligence</h2></div><div className="mi-next-items"><span>Executive KPIs ✓</span><span>Sales funnel ✓</span><span>Owner conversion ✓</span><span>Financial health ✓</span><span>Action alerts ✓</span></div></section>
  </main>;
}
