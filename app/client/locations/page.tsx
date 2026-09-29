"use client";
import Link from "next/link";
import { Building2, FileCheck2, MapPin, TestTube2 } from "lucide-react";
import PortalHeader from "../PortalHeader";
import DemoGuard from "../DemoGuard";
export default function LocationsPage(){return <><DemoGuard/><PortalHeader/><main className="client-main">
<div className="client-breadcrumb"><Link href="/client/dashboard">Dashboard</Link><span>›</span><strong>Locations</strong></div>
<section className="client-page-heading"><div><span className="client-section-kicker">SERVICE LOCATIONS</span><h1>Your locations</h1><p>View testing activity location by location. This demo uses one fictional Hyderabad facility.</p></div><div className="client-period">Hyderabad • Demo</div></section>
<div className="client-demo-notice"><strong>Future multi-location view:</strong> After approval, large customers can see only the locations authorized for their account.</div>
<section className="client-location-grid"><div className="client-card client-location-card"><div className="client-location-icon"><Building2 size={26}/></div><div><span className="client-section-kicker">PRIMARY LOCATION</span><h2>Hyderabad Facility</h2><p><MapPin size={15}/> Hyderabad, Telangana</p></div><div className="client-location-stats"><div><TestTube2 size={18}/><strong>12</strong><span>Samples this month</span></div><div><FileCheck2 size={18}/><strong>2</strong><span>Reports ready</span></div></div><Link className="client-primary-link" href="/client/samples">View location samples →</Link></div></section>
<section className="client-card client-expansion-card"><h2>How this scales for a national customer</h2><p>After real-client approval, the same screen can show Hyderabad, Bengaluru, Mumbai, Pune, Chennai or other approved locations. A national manager can be authorized for all locations while a facility user can be limited to their own site.</p></section>
</main><footer className="client-footer">Nexus Test Labs Client Portal • Demonstration data only</footer></>}
