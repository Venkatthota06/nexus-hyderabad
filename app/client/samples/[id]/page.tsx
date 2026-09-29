"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock3, Download, Eye, FlaskConical, MapPin, TestTube2 } from "lucide-react";
import PortalHeader from "../../PortalHeader";
import DemoGuard from "../../DemoGuard";
import { demoSamples } from "../../demo-data";

export default function ClientSampleDetailPage() {
  const params = useParams<{ id: string }>();
  const sample = demoSamples.find((item) => item.id === params.id);
  if (!sample) return <main className="client-main"><div className="client-card"><h1>Demo sample not found</h1><Link className="client-text-link" href="/client/samples">← Back to samples</Link></div></main>;

  return (
    <>
      <DemoGuard/>
      <PortalHeader/>
      <main className="client-main">
        <div className="client-breadcrumb"><Link href="/client/dashboard">Dashboard</Link><span>›</span><Link href="/client/samples">Samples</Link><span>›</span><strong>{sample.id}</strong></div>
        <Link className="client-back-link" href="/client/samples"><ArrowLeft size={17}/> Back to all samples</Link>
        <section className="client-detail-hero">
          <div><span className="client-section-kicker">SAMPLE DETAILS</span><div className="client-detail-title"><h1>{sample.id} • {sample.service}</h1><span className={`client-status ${sample.statusClass}`}>{sample.status}</span></div><p>{sample.description}</p></div>
        </section>
        <section className="client-detail-grid">
          <div className="client-card client-info-card">
            <div className="client-card-header"><h2>Sample information</h2></div>
            <div className="client-info-grid">
              <div><span><TestTube2 size={16}/> Sample number</span><strong>{sample.id}</strong></div>
              <div><span><FlaskConical size={16}/> Service</span><strong>{sample.service}</strong></div>
              <div><span><MapPin size={16}/> Location</span><strong>{sample.location}</strong></div>
              <div><span><CalendarDays size={16}/> Collected</span><strong>{sample.collected}</strong></div>
              <div><span><Clock3 size={16}/> Collection time</span><strong>{sample.collectedTime}</strong></div>
              <div><span><TestTube2 size={16}/> Quantity</span><strong>{sample.quantity}</strong></div>
            </div>
          </div>
          <div className="client-card client-current-card"><span>Current status</span><strong>{sample.status}</strong><p>{sample.status === "Report Ready" ? "Testing is complete and the demo report is ready for customer access." : "Nexus is currently progressing this sample through the laboratory workflow."}</p></div>
        </section>
        <section className="client-card client-timeline-card">
          <div className="client-card-header"><div><h2>Sample journey</h2><p className="client-card-subtitle">A clear history of what has happened to this sample.</p></div></div>
          <div className="client-timeline">
            {sample.timeline.map((step, index) => <div className={`client-timeline-item ${step.done ? "is-done" : "is-pending"}`} key={`${step.label}-${index}`}><div className="client-timeline-marker">{step.done ? <Check size={16}/> : <Clock3 size={15}/>}</div><div><strong>{step.label}</strong><span>{step.date}</span><p>{step.detail}</p></div></div>)}
          </div>
          {sample.status === "Report Ready" && <div className="client-report-preview"><div><strong>Demo report is ready</strong><p>Open the sample laboratory report in your browser or download the PDF to your phone/computer.</p></div><div className="client-report-actions"><a href="/demo-reports/DEMO-001-water-testing-report.pdf" target="_blank" rel="noreferrer"><Eye size={16}/>View report</a><a href="/demo-reports/DEMO-001-water-testing-report.pdf" download><Download size={16}/>Download PDF</a></div></div>}
        </section>
      </main>
      <footer className="client-footer">Nexus Test Labs Client Portal • Demonstration data only</footer>
    </>
  );
}
