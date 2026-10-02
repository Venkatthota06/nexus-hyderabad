import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, ClipboardCheck, FileClock, Megaphone, Target, UsersRound } from "lucide-react";
import { db } from "@/src/prisma/db";
import "../management.css";
import "../v8-control.css";
import "./attention.css";

export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
type Table = "Lead"|"Quotation"|"Sample"|"PlanItem"|"MarketingProspect";
async function rows(t:Table){try{return await(db.orm.public[t] as unknown as{all:()=>Promise<Row[]>}).all()}catch{return[]}}
const txt=(v:unknown)=>String(v||"").trim(),low=(v:unknown)=>txt(v).toLowerCase();
const active=(s:unknown)=>!["inactive","cancelled","canceled","closed","rejected","void","won","lost"].includes(low(s));
const openQ=(s:unknown)=>!["accepted","approved","won","closed","rejected","cancelled","canceled","expired"].includes(low(s));
const done=(s:unknown)=>["completed","done","closed"].includes(low(s));
function dayDelta(v:unknown){if(!v)return null;const d=new Date(String(v));if(Number.isNaN(d.getTime()))return null;const z=new Date(),a=new Date(z.getFullYear(),z.getMonth(),z.getDate()).getTime(),b=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return Math.ceil((b-a)/86400000)}
function daysOld(v:unknown){if(!v)return 0;const d=new Date(String(v));return Number.isNaN(d.getTime())?0:Math.max(0,Math.floor((Date.now()-d.getTime())/86400000))}
function age(v:unknown){const d=dayDelta(v);if(d===null)return "No date";if(d===0)return "Today";return d<0?`${Math.abs(d)}d overdue`:`Due in ${d}d`}
const leadOpen=(x:Row)=>active(x.status),reportOpen=(x:Row)=>!["delivered","completed","complete"].includes(low(x.reportStatus));
const ownerHref=(v:unknown)=>`/admin/management/owner/${encodeURIComponent(txt(v)||"Unassigned")}`;

export default async function Page(){
 const [leads,quotes,samples,plans,prospects]=await Promise.all([rows("Lead"),rows("Quotation"),rows("Sample"),rows("PlanItem"),rows("MarketingProspect")]);
 const overdueLeads=leads.filter(x=>leadOpen(x)&&dayDelta(x.nextFollowUp)!==null&&dayDelta(x.nextFollowUp)!<0);
 const noAction=leads.filter(x=>leadOpen(x)&&!x.nextFollowUp);
 const unassigned=leads.filter(x=>leadOpen(x)&&!txt(x.salesOwner));
 const quoteFollowOverdue=quotes.filter(x=>openQ(x.status)&&dayDelta(x.nextFollowUp)!==null&&dayDelta(x.nextFollowUp)!<0);
 const noQuoteAction=quotes.filter(x=>openQ(x.status)&&!x.nextFollowUp);
 const agedQuotes=quotes.filter(x=>openQ(x.status)&&daysOld(x.sentDate||x.quotationDate||x.createdAt)>14);
 const overdueSamples=samples.filter(x=>reportOpen(x)&&dayDelta(x.expectedCompletionDate)!==null&&dayDelta(x.expectedCompletionDate)!<0);
 const dueSoon=samples.filter(x=>{const d=dayDelta(x.expectedCompletionDate);return reportOpen(x)&&d!==null&&d>=0&&d<=2});
 const missingDue=samples.filter(x=>reportOpen(x)&&!x.expectedCompletionDate);
 const overduePlans=plans.filter(x=>!done(x.status)&&dayDelta(x.dueDate)!==null&&dayDelta(x.dueDate)!<0);
 const marketingDue=prospects.filter(x=>x.converted!==true&&dayDelta(x.nextFollowUp)!==null&&dayDelta(x.nextFollowUp)!<0);
 const quoteExceptions=[...quoteFollowOverdue,...noQuoteAction.filter(x=>!quoteFollowOverdue.some(y=>String(y.id)===String(x.id))),...agedQuotes.filter(x=>!quoteFollowOverdue.some(y=>String(y.id)===String(x.id))&&!noQuoteAction.some(y=>String(y.id)===String(x.id)))];
 const total=overdueLeads.length+noAction.length+unassigned.length+quoteExceptions.length+overdueSamples.length+dueSoon.length+missingDue.length+overduePlans.length+marketingDue.length;
 const ownerMap=new Map<string,{overdue:number;noAction:number;quoteRisk:number;total:number}>();
 const own=(v:unknown)=>{const k=txt(v)||"Unassigned";if(!ownerMap.has(k))ownerMap.set(k,{overdue:0,noAction:0,quoteRisk:0,total:0});return ownerMap.get(k)!};
 overdueLeads.forEach(x=>{const a=own(x.salesOwner);a.overdue++;a.total++});noAction.forEach(x=>{const a=own(x.salesOwner);a.noAction++;a.total++});quoteExceptions.forEach(x=>{const a=own(x.salesOwner);a.quoteRisk++;a.total++});
 const ownerQueue=[...ownerMap].sort((a,b)=>b[1].total-a[1].total);
 const leadRows=(items:Row[],empty:string)=><div className="mx-list">{items.length?items.slice(0,50).map(x=><Link href={`/admin/leads/${x.id}`} className="mx-row" key={String(x.id)}><div><strong>{txt(x.company)||txt(x.name)||"Lead"}</strong><span>{txt(x.service)||"Service not specified"} · Owner: {txt(x.salesOwner)||"Unassigned"}</span></div><div><b>{txt(x.status)||"—"}</b><small>{x.nextFollowUp?age(x.nextFollowUp):"No next action"}</small></div><ArrowRight/></Link>):<p className="mx-empty">{empty}</p>}</div>;
 return <main className="mi-page"><header className="mi-hero mx-hero"><div><span>V9 • MANAGEMENT ACTION CENTER</span><h1>Accountability & Exception Control</h1><p>Every visible risk is tied to the responsible owner and the underlying CRM record, so management can see what needs action and immediately investigate it.</p></div><Link href="/admin/management"><ArrowLeft size={17}/> Management</Link></header>
 <section className="mx-summary"><div><AlertTriangle/><span>Total visible exceptions</span><strong>{total}</strong></div><div><CalendarClock/><span>Sales follow-up risks</span><strong>{overdueLeads.length+noAction.length}</strong></div><div><FileClock/><span>Quotation risks</span><strong>{quoteExceptions.length}</strong></div><div><ClipboardCheck/><span>Operations risks</span><strong>{overdueSamples.length+dueSoon.length+missingDue.length}</strong></div></section>
 <article className="mi-panel mx-panel mx-wide"><div className="mi-panel-head"><div><span>OWNER ACCOUNTABILITY QUEUE</span><h2>Who needs management attention and why</h2></div><UsersRound/></div><div className="mx-list">{ownerQueue.length?ownerQueue.map(([name,a])=><Link href={ownerHref(name)} className="mx-row" key={name}><div><strong>{name}</strong><span>{a.overdue} overdue follow-up(s) · {a.noAction} lead(s) without next action · {a.quoteRisk} quotation risk(s)</span></div><div><b>{a.total} exception{a.total===1?"":"s"}</b><small>Inspect complete owner trail</small></div><ArrowRight/></Link>):<p className="mx-empty">No owner-level sales exceptions detected.</p>}</div></article>
 <section className="mx-grid">
  <article className="mi-panel mx-panel"><div className="mi-panel-head"><div><span>SALES • CRITICAL</span><h2>Overdue lead follow-ups</h2></div><strong className="mx-count danger">{overdueLeads.length}</strong></div>{leadRows(overdueLeads,"No overdue lead follow-ups.")}</article>
  <article className="mi-panel mx-panel"><div className="mi-panel-head"><div><span>SALES • DATA QUALITY</span><h2>Active leads without next action</h2></div><strong className="mx-count warning">{noAction.length}</strong></div>{leadRows(noAction,"Every active lead has a next action.")}</article>
  <article className="mi-panel mx-panel"><div className="mi-panel-head"><div><span>OWNERSHIP</span><h2>Unassigned active leads</h2></div><strong className="mx-count warning">{unassigned.length}</strong></div>{leadRows(unassigned,"No unassigned active leads.")}</article>
  <article className="mi-panel mx-panel"><div className="mi-panel-head"><div><span>QUOTATIONS • COMMERCIAL RISK</span><h2>Follow-up and aging exceptions</h2></div><strong className="mx-count danger">{quoteExceptions.length}</strong></div><div className="mx-list">{quoteExceptions.slice(0,60).map(x=><Link href={`/admin/quotations/${x.id}`} className="mx-row" key={String(x.id)}><div><strong>{txt(x.quotationNumber)||"Quotation"}</strong><span>{txt(x.service)||"Service"} · Owner: {txt(x.salesOwner)||"Unassigned"}</span></div><div><b>{txt(x.status)||"—"}</b><small>{x.nextFollowUp?age(x.nextFollowUp):`No next action · ${daysOld(x.sentDate||x.quotationDate||x.createdAt)}d old`}</small></div><ArrowRight/></Link>)}</div></article>
  <article className="mi-panel mx-panel mx-wide"><div className="mi-panel-head"><div><span>OPERATIONS</span><h2>Sample & report delivery exceptions</h2></div><strong className="mx-count danger">{overdueSamples.length+dueSoon.length+missingDue.length}</strong></div><div className="mx-list">{[...overdueSamples,...dueSoon,...missingDue].slice(0,60).map(x=><Link href={`/admin/samples/${x.id}`} className="mx-row" key={String(x.id)}><div><strong>{txt(x.sampleNumber)||"Sample"}</strong><span>{txt(x.sampleType)||"Sample"} · {Number(x.sampleCount||1)} sample(s) · Report: {txt(x.reportStatus)||"Pending"}</span></div><div><b>{txt(x.status)||"—"}</b><small>{x.expectedCompletionDate?age(x.expectedCompletionDate):"Expected date missing"}</small></div><ArrowRight/></Link>)}</div></article>
  <article className="mi-panel mx-panel"><div className="mi-panel-head"><div><span>MONTHLY PLAN</span><h2>Overdue plan items</h2></div><strong className="mx-count warning">{overduePlans.length}</strong></div><div className="mx-list">{overduePlans.slice(0,40).map(x=><Link href="/admin/monthly-plan" className="mx-row" key={String(x.id)}><div><strong>{txt(x.title)||"Plan item"}</strong><span>{txt(x.category)||"Operations"} · {txt(x.priority)||"Medium"} priority</span></div><div><b>{txt(x.status)||"Planned"}</b><small>{age(x.dueDate)}</small></div><ArrowRight/></Link>)}</div></article>
  <article className="mi-panel mx-panel"><div className="mi-panel-head"><div><span>DIGITAL MARKETING</span><h2>Prospects overdue for follow-up</h2></div><strong className="mx-count warning">{marketingDue.length}</strong></div><div className="mx-list">{marketingDue.slice(0,40).map(x=><Link href={`/admin/digital-marketing/${x.id}`} className="mx-row" key={String(x.id)}><div><strong>{txt(x.companyName)||"Prospect"}</strong><span>{txt(x.contactName)||"No contact"} · {txt(x.targetService)||"Service not specified"}</span></div><div><b>{txt(x.outreachStatus)||"Identified"}</b><small>{age(x.nextFollowUp)}</small></div><ArrowRight/></Link>)}</div></article>
 </section><div className="mx-note"><Target/><div><strong>Management principle</strong><span>Counts alone are not enough. V9 connects each exception to an owner and then to the exact CRM record behind the issue.</span></div></div></main>;
}
