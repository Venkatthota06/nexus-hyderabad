"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FlaskConical, MapPin, TestTube2 } from "lucide-react";
import { demoSamples } from "../demo-data";
import PortalHeader from "../PortalHeader";
import DemoGuard from "../DemoGuard";

export default function ClientSamplesPage() {
  return (
    <>
      <DemoGuard/>
      <PortalHeader/>
      <main className="client-main">
        <div className="client-breadcrumb"><Link href="/client/dashboard">Dashboard</Link><span>›</span><strong>Samples</strong></div>
        <section className="client-page-heading"><div><span className="client-section-kicker">SAMPLE TRACKING</span><h1>Your samples</h1><p>Follow every demo sample from collection through laboratory testing and report readiness.</p></div><div className="client-period">September 2026 • Hyderabad</div></section>
        <div className="client-demo-notice"><strong>Demo environment:</strong> The records below are fictional and are not connected to any real Nexus customer.</div>
        <section className="client-sample-list">
          {demoSamples.map((sample) => (
            <Link className="client-sample-row" href={`/client/samples/${sample.id}`} key={sample.id}>
              <div className="client-service-icon"><TestTube2 size={20}/></div>
              <div className="client-sample-primary"><strong>{sample.id}</strong><span>{sample.service}</span><small>{sample.description}</small></div>
              <div className="client-sample-meta"><span><MapPin size={15}/>{sample.location}</span><span><CalendarDays size={15}/>{sample.collected}</span><span><FlaskConical size={15}/>{sample.quantity}</span></div>
              <span className={`client-status ${sample.statusClass}`}>{sample.status}</span>
              <ArrowRight className="client-row-arrow" size={19}/>
            </Link>
          ))}
        </section>
      </main>
      <footer className="client-footer">Nexus Test Labs Client Portal • Demonstration data only</footer>
    </>
  );
}
