"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, GitBranch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  if (!value) return;
  if (element instanceof HTMLSelectElement) {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function LeadJourneyContext() {
  const pathname = usePathname();
  const search = useSearchParams();
  const leadId = search.get("leadId") || "";
  const companyId = search.get("companyId") || "";
  const service = search.get("service") || "";
  const requirement = search.get("requirement") || "";
  const contact = search.get("contact") || "";
  const [prefilled, setPrefilled] = useState(false);

  const supported = useMemo(() =>
    pathname.includes("/quotations/new") || pathname.includes("/samples/new") || pathname.includes("/reports/new") || pathname.includes("/payments/record") || pathname.includes("/documents/new") || pathname.includes("/activities/new") || pathname.includes("/work-orders/new"), [pathname]);

  useEffect(() => {
    if (!leadId || !supported) return;
    let stopped = false;
    let attempts = 0;

    const apply = () => {
      if (stopped) return;
      attempts += 1;
      let changed = false;

      if (companyId) {
        const selects = Array.from(document.querySelectorAll("select"));
        const companySelect = selects.find((select) => Array.from(select.options).some((option) => option.value === companyId));
        if (companySelect && companySelect.value !== companyId) {
          setNativeValue(companySelect, companyId);
          changed = true;
        }
      }

      if (service && pathname.includes("/quotations/new")) {
        const inputs = Array.from(document.querySelectorAll("input"));
        const serviceInput = inputs.find((input) => (input.placeholder || "").toLowerCase().includes("water testing") || (input.closest("label")?.textContent || "").toLowerCase().includes("service"));
        if (serviceInput && !serviceInput.value) {
          setNativeValue(serviceInput, service);
          changed = true;
        }
      }

      if (requirement && pathname.includes("/quotations/new")) {
        const textarea = document.querySelector("textarea");
        if (textarea && !textarea.value) {
          setNativeValue(textarea, requirement);
          changed = true;
        }
      }

      if (service && pathname.includes("/samples/new")) {
        const inputs = Array.from(document.querySelectorAll("input"));
        const sampleType = inputs.find((input) => (input.closest("label")?.textContent || "").toLowerCase().includes("sample type"));
        if (sampleType && !sampleType.value) {
          setNativeValue(sampleType, service);
          changed = true;
        }
      }

      if (changed || attempts > 2) setPrefilled(true);
      if (attempts < 18) window.setTimeout(apply, 450);
    };

    const timer = window.setTimeout(apply, 250);
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [leadId, companyId, service, requirement, pathname, supported]);

  if (!leadId || !supported) return null;

  return (
    <div style={{margin:"14px 18px 0",padding:"12px 14px",border:"1px solid #cfe4df",borderRadius:12,background:"linear-gradient(135deg,#f8fcfb,#eef8f5)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
        <div style={{width:34,height:34,borderRadius:9,display:"grid",placeItems:"center",background:"#126c63",color:"white",flex:"0 0 auto"}}><GitBranch size={16}/></div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:10,fontWeight:900,color:"#126c63",letterSpacing:'.06em',textTransform:"uppercase"}}>Inbound Lead Journey</div>
          <div style={{fontSize:11,color:"#5f716e",marginTop:2}}>{prefilled?"Client context carried forward automatically.":"Loading linked client context…"}{contact?` Contact: ${contact}`:""}</div>
        </div>
      </div>
      <Link href={`/admin/leads/${leadId}`} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 10px",border:"1px solid #d6e5e2",borderRadius:8,background:"white",color:"#126c63",fontSize:10,fontWeight:850,textDecoration:"none"}}>
        {prefilled?<CheckCircle2 size={14}/>:<ArrowLeft size={14}/>} Back to Lead Journey
      </Link>
    </div>
  );
}
