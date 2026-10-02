import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, FileClock, Target, UsersRound } from "lucide-react";
import { db } from "@/src/prisma/db";
import "../management.css";
import "../v8-control.css";
import "./workflow.css";

export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
type Table = "Company" | "Lead" | "Activity" | "Quotation" | "WorkOrder" | "Sample" | "Report" | "PlanItem" | "MarketingProspect";
async function rows(t: Table) { try { return await (db.orm.public[t] as unknown as { all: () => Promise<Row[]> }).all(); } catch { return []; } }
const txt=(v:unknown)=>String(v||"").trim();
const low=(v:unknown)=>txt(v).toLowerCase();
const age=(v:unknown)=>{const d=new Date(String(v||""));return Number.isNaN(d.getTime())?0:Math.max(0,Math.floor((Date.now()-d.getTime())/86400000));};
const open=(v:unknown)=>!["completed","complete","done","closed","won","lost","rejected","cancelled","canceled","delivered"].includes(low(v));
function due(v:unknown){if(!v)return "none";const d=new Date(String(v)),z=new Date(),a=new Date(z.getFullYear(),z.getMonth(),z.getDate()).getTime(),b=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return b<a?"overdue":b===a?"today":"upcoming";}
function date(v:unknown){if(!v)return "—";const d=new Date(String(v));return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(d);}

export default async function WorkflowPage(){
 const [companies,leads,activities,quotes,orders,samples,reports,plans,prospects]=await Promise.all([rows("Company"),rows("Lead"),rows("Activity"),rows("Quotation"),rows("WorkOrder"),rows("Sample"),rows("Report"),rows("PlanItem"),rows("MarketingProspect")]);
 const activeLeads=leads.filter(x=>open(x.status));
 const overdueLeads=activeLeads.filter(x=>due(x.nextFollowUp)==="overdue");
 const noLeadAction=activeLeads.filter(x=>!x.nextFollowUp);
 const staleLeads=activeLeads.filter(x=>age(x.updatedAt)>14);
 const unassigned=activeLeads.filter(x=>!txt(x.salesOwner));
 const activityFollowups=activities.filter(x=>x.nextFollowUp&&due(x.nextFollowUp)!=="upcoming");
 const activitiesNoNext=activities.filter(x=>!txt(x.nextAction)&&!x.nextFollowUp).slice().sort((a,b)=>age(b.activityDate)-age(a.activityDate));
 const openQuotes=quotes.filter(x=>open(x.status));
 const staleQuotes=openQuotes.filter(x=>age(x.sentDate||x.quotationDate||x.createdAt)>15);
 const openOrders=orders.filter(x=>open(x.status));
 const pendingSamples=samples.filter(x=>open(x.reportStatus));
 const lateSamples=pendingSamples.filter(x=>x.expectedCompletionDate&&due(x.expectedCompletionDate)==="overdue");
 const missingSampleDue=pendingSamples.filter(x=>!x.expectedCompletionDate);
 const pendingReports=reports.filter(x=>open(x.status));
 const openPlans=plans.filter(x=>open(x.status));
 const overduePlans=openPlans.filter(x=>x.dueDate&&due(x.dueDate)==="overdue");
 const openProspects=prospects.filter(x=>x.converted!==true&&open(x.outreachStatus));
 const prospectDue=openProspects.filter(x=>x.nextFollowUp&&["overdue","today"].includes(due(x.nextFollowUp)));
 const companyName=(id:unknown)=>txt(companies.find(c=>String(c.id)===String(id))?.name)||"Unknown client";
 const queue=[
  ...overdueLeads.map(x=>({priority:"Critical",area:"Sales",title:`Overdue lead follow-up: ${txt(x.name)||companyName(x.companyId)}`,detail:`Owner: ${txt(x.salesOwner)||"Unassigned"} · Due ${date(x.nextFollowUp)}`,href:"/admin/leads"})),
  ...activityFollowups.map(x=>({priority:due(x.nextFollowUp)==="overdue"?"Critical":"Today",area:"Activity",title:txt(x.nextAction)||txt(x.title)||"Client activity follow-up",detail:`${companyName(x.companyId)} · ${date(x.nextFollowUp)}`,href:`/admin/companies/${String(x.companyId)}`})),
  ...lateSamples.map(x=>({priority:"Critical",area:"Operations",title:`Late sample: ${txt(x.sampleNumber)||txt(x.sampleType)}`,detail:`${companyName(x.companyId)} · Expected ${date(x.expectedCompletionDate)}`,href:`/admin/samples/${String(x.id)}`})),
  ...overduePlans.map(x=>({priority:"High",area:"Planning",title:txt(x.title)||"Overdue plan item",detail:`Due ${date(x.dueDate)} · ${txt(x.priority)||"Priority not set"}`,href:"/admin/monthly-plan"})),
  ...prospectDue.map(x=>({priority:due(x.nextFollowUp)==="overdue"?"High":"Today",area:"Marketing",title:`Prospect follow-up: ${txt(x.companyName)}`,detail:`${txt(x.contactName)||"Contact not set"} · ${date(x.nextFollowUp)}`,href:`/admin/digital-marketing/${String(x.id)}`})),
 ].slice(0,30);
 const completeness=[
  ["Active leads with owner",activeLeads.length-unassigned.length,activeLeads.length],
  ["Active leads with next follow-up",activeLeads.length-noLeadAction.length,activeLeads.length],
  ["Pending samples with due date",pendingSamples.length-missingSampleDue.length,pendingSamples.length],
  ["Open plans with due date",openPlans.filter(x=>x.dueDate).length,openPlans.length],
 ];
 const cards=[
  ["Overdue follow-ups",overdueLeads.length+activityFollowups.filter(x=>due(x.nextFollowUp)==="overdue").length,"/admin/follow-ups",AlertTriangle],
  ["Due today",activityFollowups.filter(x=>due(x.nextFollowUp)==="today").length+prospectDue.filter(x=>due(x.nextFollowUp)==="today").length,"/admin/follow-ups",CalendarClock],
  ["Stale leads",staleLeads.length,"/admin/leads",Target],
  ["Unassigned leads",unassigned.length,"/admin/leads",UsersRound],
  ["Aged quotations",staleQuotes.length,"/admin/quotations",FileClock],
  ["Late samples",lateSamples.length,"/admin/management/operations",Activity],
  ["Pending reports",pendingReports.length,"/admin/reports",ClipboardCheck],
  ["Open work orders",openOrders.length,"/admin/orders",CheckCircle2],
 ] as const;
 return <main className="mi-page wf-page">
  <header className="mi-hero"><div><span>WORKFLOW & DATA INTELLIGENCE</span><h1>Real-Time Accountability Control Center</h1><p>One operational queue for missing ownership, overdue actions, stale work, delivery deadlines and CRM data completeness.</p></div><Link href="/admin/management">Management <ArrowRight size={17}/></Link></header>
  <div className="mi-live-strip"><div><i className="mi-live-dot"/><span>LIVE CRM DATA</span><small>Calculated from current CRM records whenever this page loads.</small></div><small>{activities.length} activities · {activeLeads.length} active leads · {pendingSamples.length} pending samples</small></div>
  <section className="mi-kpis">{cards.map(([label,value,href,Icon])=><Link href={href} className="mi-card" key={label}><div className="mi-icon"><Icon/></div><div><span>{label}</span><strong>{value}</strong></div><ArrowRight className="mi-arrow" size={16}/></Link>)}</section>
  <section className="wf-grid">
   <article className="mi-panel wf-queue"><div className="mi-panel-head"><div><span>PRIORITY WORK QUEUE</span><h2>What needs action now</h2></div><AlertTriangle/></div>{queue.length?<div className="wf-list">{queue.map((x,i)=><Link href={x.href} key={`${x.area}-${i}`} className="wf-item"><span className={`wf-priority ${x.priority.toLowerCase()}`}>{x.priority}</span><div><strong>{x.title}</strong><small>{x.area} · {x.detail}</small></div><ArrowRight size={15}/></Link>)}</div>:<div className="wf-empty"><CheckCircle2/><strong>No urgent workflow exceptions</strong><small>Current monitored queues have no overdue action.</small></div>}</article>
   <article className="mi-panel"><div className="mi-panel-head"><div><span>DATA COMPLETENESS</span><h2>Can management trust the workflow?</h2></div><ClipboardCheck/></div><div className="wf-completeness">{completeness.map(([label,done,total])=>{const p=Number(total)?Math.round(Number(done)/Number(total)*100):100;return <div key={String(label)}><div><span>{label}</span><strong>{p}%</strong></div><div className="wf-meter"><i style={{width:`${p}%`}}/></div><small>{done} of {total} records complete</small></div>})}</div></article>
  </section>
  <section className="mi-panel"><div className="mi-panel-head"><div><span>WORKFLOW GAPS</span><h2>Records likely to disappear from daily attention</h2></div><Target/></div><div className="wf-gap-grid"><Link href="/admin/leads"><strong>{noLeadAction.length}</strong><span>Leads without follow-up</span><small>Active opportunities with no next follow-up date.</small></Link><Link href="/admin/quotations"><strong>{staleQuotes.length}</strong><span>Quotes aged 15+ days</span><small>Open commercial records requiring review.</small></Link><Link href="/admin/management/operations"><strong>{missingSampleDue.length}</strong><span>Samples without due date</span><small>Pending delivery work without expected completion.</small></Link><Link href="/admin/monthly-plan"><strong>{overduePlans.length}</strong><span>Overdue plan items</span><small>Management commitments past their due date.</small></Link><Link href="/admin/digital-marketing"><strong>{prospectDue.length}</strong><span>Marketing follow-ups due</span><small>Prospects needing outreach today or already overdue.</small></Link><Link href="/admin/companies"><strong>{activitiesNoNext.length}</strong><span>Recent activities without next action</span><small>Interactions recorded without a continuation step.</small></Link></div></section>
 </main>;
}
