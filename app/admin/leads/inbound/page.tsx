import Link from "next/link";
import { db } from "@/src/prisma/db";
import { ArrowRight, CalendarClock, CheckCircle2, CircleDollarSign, PhoneIncoming, TriangleAlert, Users } from "lucide-react";

export const dynamic = "force-dynamic";
type Row=Record<string,unknown>;
const txt=(v:unknown)=>String(v??"").trim();
const low=(v:unknown)=>txt(v).toLowerCase();
const closed=(s:unknown)=>["won","lost","not qualified","duplicate"].includes(low(s));
const inbound=(s:unknown)=>["inbound call","phone call","incoming call","customer call"].includes(low(s));
const day=(v:unknown)=>{const d=new Date(String(v));return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(d)};
async function rows(model:{all:()=>unknown}):Promise<Row[]>{try{return await(model.all() as unknown as Promise<Row[]>)}catch{return[]}}
export default async function InboundCallsPage(){
 const [allLeads,quotes,orders]=await Promise.all([rows(db.orm.public.Lead),rows(db.orm.public.Quotation),rows(db.orm.public.WorkOrder)]);
 const leads=allLeads.filter(x=>inbound(x.source)); const today=new Date();today.setHours(0,0,0,0);
 const active=leads.filter(x=>!closed(x.status)); const overdue=active.filter(x=>x.nextFollowUp&&new Date(String(x.nextFollowUp))<today);
 const noNext=active.filter(x=>!x.nextFollowUp); const newToday=leads.filter(x=>{const d=new Date(String(x.createdAt));d.setHours(0,0,0,0);return d.getTime()===today.getTime()});
 const won=leads.filter(x=>low(x.status)==="won"); const linkedCompanyIds=new Set(leads.map(x=>txt(x.companyId)).filter(Boolean));
 const quoteRows=quotes.filter(x=>linkedCompanyIds.has(txt(x.companyId))); const orderRows=orders.filter(x=>linkedCompanyIds.has(txt(x.companyId)));
 const quoted=quoteRows.reduce((a,x)=>a+Number(x.totalAmount||0),0),converted=orderRows.reduce((a,x)=>a+Number(x.totalAmount||0),0);
 return <div className="leads-page-content"><header className="leads-page-header"><div><span>INBOUND CALL CONTROL</span><h1>Inbound Call Leads</h1><p>Monitor what happened after a customer called Nexus: requirement, ownership, follow-up, quotation and conversion.</p></div><Link className="leads-status contacted" href="/admin/leads/inbound/new" style={{textDecoration:"none"}}><PhoneIncoming size={15}/> Record Incoming Call</Link></header>
 <div className="leads-metrics"><Metric title="Calls Logged" value={leads.length} icon={<PhoneIncoming size={21}/>}/><Metric title="New Today" value={newToday.length} icon={<Users size={21}/>}/><Metric title="Overdue Follow-ups" value={overdue.length} icon={<TriangleAlert size={21}/>}/><Metric title="No Next Action" value={noNext.length} icon={<CalendarClock size={21}/>}/><Metric title="Won" value={won.length} icon={<CheckCircle2 size={21}/>}/></div>
 <section className="leads-panel"><div className="leads-panel-header"><div><span className="leads-panel-eyebrow">Management Control</span><h2>Call-to-Business Pipeline</h2><p>Quoted value ₹{quoted.toLocaleString("en-IN")} · Confirmed value ₹{converted.toLocaleString("en-IN")}</p></div><Link href="/admin/leads">All Leads</Link></div>
 {!leads.length?<div className="leads-empty"><PhoneIncoming size={42}/><h3>No inbound calls logged yet</h3><p>Use Record Incoming Call whenever a customer contacts Nexus directly.</p><Link href="/admin/leads/inbound/new">Record First Call</Link></div>:<div className="leads-table-wrapper"><table className="leads-table"><thead><tr><th>Caller / Client</th><th>Requirement</th><th>Owner</th><th>Status</th><th>Received</th><th>Next Follow-up</th><th>Control</th></tr></thead><tbody>{leads.sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||""))).map(x=>{const isOver=x.nextFollowUp&&!closed(x.status)&&new Date(String(x.nextFollowUp))<today;return <tr key={txt(x.id)}><td><div className="leads-person-details"><Link className="leads-name" href={`/admin/leads/${txt(x.id)}`}>{txt(x.name)||"Unknown caller"}</Link><span>{txt(x.company)||"Company not provided"} · {txt(x.phone)}</span></div></td><td><span className="leads-service">{txt(x.service)||"Not identified"}</span><div>{txt(x.requirement)||"Requirement pending"}</div></td><td>{txt(x.salesOwner)||"Unassigned"}</td><td><span className="leads-status new">{txt(x.status)}</span></td><td>{day(x.createdAt)}</td><td>{x.nextFollowUp?<strong style={{color:isOver?"#b91c1c":undefined}}>{day(x.nextFollowUp)}{isOver?" · OVERDUE":""}</strong>:closed(x.status)?"Closed":"⚠ Not scheduled"}</td><td><Link href={`/admin/leads/${txt(x.id)}`}>Open Journey <ArrowRight size={13}/></Link></td></tr>})}</tbody></table></div>}</section>
 </div>;
}
function Metric({title,value,icon}:{title:string;value:number;icon:React.ReactNode}){return <div className="leads-metric-card"><div className="leads-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong></div></div>}
