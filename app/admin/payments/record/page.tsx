import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { db } from "@/src/prisma/db";
import PaymentRecordForm from "@/components/PaymentRecordForm";
import "./record.css";

export const dynamic="force-dynamic";
type Row=Record<string,unknown>;type Props={searchParams?:Promise<{workOrder?:string|string[];companyId?:string|string[];leadId?:string|string[];quotationId?:string|string[];returnTo?:string|string[]}>};
const text=(v:unknown)=>String(v??"").trim(),number=(v:unknown)=>Number(v||0);
const received=(v:unknown)=>["received","paid","collected","completed"].includes(text(v).toLowerCase());
const confirmed=(v:unknown)=>!["cancelled","canceled","rejected","lost","draft"].includes(text(v).toLowerCase());
async function allRows(model:{all:()=>unknown}):Promise<Row[]>{return await(model.all() as unknown as Promise<Row[]>)}
const one=(v:string|string[]|undefined)=>Array.isArray(v)?v[0]:v;

export default async function RecordPaymentPage({searchParams}:Props){
 const params=searchParams?await searchParams:{};const requestedOrder=one(params.workOrder),companyId=one(params.companyId),leadId=one(params.leadId),returnTo=one(params.returnTo);
 const lifecycleReturn=returnTo==="lifecycle";
 const [companies,workOrders,payments]=await Promise.all([allRows(db.orm.public.Company),allRows(db.orm.public.WorkOrder),allRows(db.orm.public.Payment)]);
 const companyNames=new Map(companies.map(c=>[text(c.id),text(c.name)])),collected=new Map<string,number>();
 for(const p of payments){if(!received(p.status)||!p.workOrderId)continue;const id=text(p.workOrderId);collected.set(id,(collected.get(id)||0)+number(p.amount))}
 const orders=workOrders.filter(w=>confirmed(w.status)).map(w=>{const id=text(w.id),totalAmount=number(w.totalAmount),alreadyCollected=collected.get(id)||0;return{id,companyId:text(w.companyId),companyName:companyNames.get(text(w.companyId))||"Unknown client",workOrderNumber:text(w.workOrderNumber),service:text(w.service),totalAmount,collected:alreadyCollected,pending:Math.max(totalAmount-alreadyCollected,0)}}).filter(w=>w.pending>0).sort((a,b)=>b.pending-a.pending);
 const companyOrder=companyId?orders.find(o=>o.companyId===companyId)?.id:undefined,initialOrderId=requestedOrder||companyOrder;
 const backHref=lifecycleReturn?"/admin/lifecycle":leadId?`/admin/leads/${leadId}`:"/admin/payments?view=pending";
 const backLabel=lifecycleReturn?"Business Lifecycle":leadId?"Lead Journey":"Pending Payments";
 return <div className="payment-control-page"><header className="payment-control-header"><div><span>{lifecycleReturn?"BUSINESS LIFECYCLE · COLLECTION":leadId?"LEAD JOURNEY · COLLECTION":"COLLECTION CONTROL"}</span><h1>Record Received Payment</h1><p>{companyOrder&&!requestedOrder?"The pending order for this linked client has been selected automatically. Confirm the received amount and save.":"Select the pending work order, confirm the amount received and save. The outstanding balance recalculates automatically."}</p></div><Link href={backHref}><ArrowLeft size={16}/>{backLabel}</Link></header><section className="payment-control-panel"><div className="payment-control-title"><WalletCards size={20}/><div><strong>Manual Payment Update</strong><p>Use this immediately when the client confirms payment.</p></div></div><PaymentRecordForm orders={orders} initialOrderId={initialOrderId} returnTo={lifecycleReturn?"/admin/lifecycle":undefined}/></section></div>;
}
