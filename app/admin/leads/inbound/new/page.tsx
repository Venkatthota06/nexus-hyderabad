import Link from "next/link";
import { ArrowLeft, PhoneIncoming } from "lucide-react";
import InboundCallForm from "@/components/InboundCallForm";
export default function NewInboundCallPage(){return <div className="lead-profile-page"><div className="lead-profile-back"><Link href="/admin/leads/inbound"><ArrowLeft size={16}/>Inbound Calls</Link></div><header className="lead-profile-header"><div><span>FAST CALL CAPTURE</span><h1>Record Incoming Customer Call</h1><div className="lead-profile-company-text"><PhoneIncoming size={15}/>Capture the enquiry first; follow the journey from the lead profile.</div></div></header><section className="lead-profile-card"><InboundCallForm/></section></div>}
