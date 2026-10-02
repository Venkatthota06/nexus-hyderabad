"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id:string; companyId:string; companyName:string; workOrderNumber:string; service:string; totalAmount:number; collected:number; pending:number };

export default function PaymentRecordForm({ orders, initialOrderId }: { orders:Option[]; initialOrderId?:string }) {
  const router=useRouter();
  const initial=orders.find(o=>o.id===initialOrderId) || orders[0];
  const [workOrderId,setWorkOrderId]=useState(initial?.id??"");
  const selected=useMemo(()=>orders.find(o=>o.id===workOrderId),[orders,workOrderId]);
  const [amount,setAmount]=useState(String(initial?.pending??""));
  const [paymentDate,setPaymentDate]=useState(new Date().toISOString().slice(0,10));
  const [paymentMethod,setPaymentMethod]=useState("Bank Transfer");
  const [reference,setReference]=useState(""); const [notes,setNotes]=useState(""); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  function chooseOrder(id:string){setWorkOrderId(id);const o=orders.find(x=>x.id===id);setAmount(o?String(o.pending):"");setError("")}
  async function submit(e:FormEvent){e.preventDefault();if(!selected)return;const value=Number(amount);if(!Number.isFinite(value)||value<=0)return setError("Enter a valid received amount.");if(value>selected.pending)return setError(`Amount cannot exceed pending balance of ₹${selected.pending.toLocaleString("en-IN")}.`);setSaving(true);setError("");try{const r=await fetch("/api/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({companyId:selected.companyId,workOrderId:selected.id,quotationId:null,amount:value,paymentDate,paymentMethod,reference,status:"Received",notes})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Failed to record payment.");router.push("/admin/payments?view=pending");router.refresh()}catch(x){setError(x instanceof Error?x.message:"Failed to record payment.");setSaving(false)}}
  if(!orders.length)return <div className="payment-control-empty">No outstanding work orders. All recorded balances are cleared.</div>;
  return <form className="payment-control-form" onSubmit={submit}>
    <label>Pending work order<select value={workOrderId} onChange={e=>chooseOrder(e.target.value)}>{orders.map(o=><option key={o.id} value={o.id}>{o.companyName} — {o.workOrderNumber} — ₹{o.pending.toLocaleString("en-IN")} pending</option>)}</select></label>
    {selected&&<div className="payment-control-summary"><div><span>Client</span><strong>{selected.companyName}</strong></div><div><span>Service</span><strong>{selected.service||"—"}</strong></div><div><span>Order Value</span><strong>₹{selected.totalAmount.toLocaleString("en-IN")}</strong></div><div><span>Already Collected</span><strong>₹{selected.collected.toLocaleString("en-IN")}</strong></div><div><span>Pending</span><strong>₹{selected.pending.toLocaleString("en-IN")}</strong></div></div>}
    <div className="payment-control-grid"><label>Amount received<input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required/></label><label>Payment date<input type="date" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} required/></label><label>Payment method<select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option>Bank Transfer</option><option>UPI</option><option>NEFT</option><option>RTGS</option><option>IMPS</option><option>Cheque</option><option>Cash</option><option>Other</option></select></label><label>Reference / UTR<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Optional"/></label></div>
    <label>Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional payment note" rows={3}/></label>{error&&<p className="payment-control-error">{error}</p>}
    <div className="payment-control-actions"><button type="button" onClick={()=>router.back()}>Cancel</button><button className="primary" disabled={saving}>{saving?"Recording…":selected&&Number(amount)===selected.pending?"Record Full Payment & Close":"Record Payment"}</button></div>
  </form>;
}
