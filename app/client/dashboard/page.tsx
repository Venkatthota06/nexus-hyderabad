"use client";

import Link from "next/link";
import { Beaker, CheckCircle2, Clock3, FileCheck2, FlaskConical, MapPin, TestTube2 } from "lucide-react";
import PortalHeader from "../PortalHeader";
import DemoGuard from "../DemoGuard";

const activity = [
  { id: "DEMO-001", service: "Water Testing", location: "Hyderabad Facility", date: "15 Sep 2026", status: "Report Ready", cls: "status-ready", icon: TestTube2 },
  { id: "DEMO-002", service: "Food Testing", location: "Hyderabad Facility", date: "17 Sep 2026", status: "Testing", cls: "status-testing", icon: FlaskConical },
  { id: "DEMO-003", service: "Swab Testing", location: "Hyderabad Facility", date: "18 Sep 2026", status: "Completed", cls: "status-complete", icon: Beaker },
];

export default function ClientDashboardPage() {
  return (
    <>
      <DemoGuard/>
      <PortalHeader/>

      <main className="client-main">
        <section className="client-welcome">
          <div><h1>Good afternoon, Uday Sir</h1><p>Here is the current status of your testing work with Nexus Test Labs.</p></div>
          <div className="client-period">September 2026 • Hyderabad</div>
        </section>

        <section className="client-kpis">
          <div className="client-kpi"><div className="client-kpi-top"><span className="client-kpi-label">Samples Collected</span><span className="client-kpi-icon"><TestTube2 size={19}/></span></div><div className="client-kpi-value">12</div><small>This month</small></div>
          <div className="client-kpi"><div className="client-kpi-top"><span className="client-kpi-label">Under Testing</span><span className="client-kpi-icon"><Clock3 size={19}/></span></div><div className="client-kpi-value">3</div><small>Currently in progress</small></div>
          <div className="client-kpi"><div className="client-kpi-top"><span className="client-kpi-label">Reports Ready</span><span className="client-kpi-icon"><FileCheck2 size={19}/></span></div><div className="client-kpi-value">2</div><small>Available to download</small></div>
          <div className="client-kpi"><div className="client-kpi-top"><span className="client-kpi-label">Completed</span><span className="client-kpi-icon"><CheckCircle2 size={19}/></span></div><div className="client-kpi-value">7</div><small>Completed this month</small></div>
        </section>

        <section className="client-grid">
          <div className="client-card">
            <div className="client-card-header"><h2>Recent sample activity</h2><Link className="client-link" href="/client/samples">View all samples →</Link></div>
            {activity.map((item) => { const Icon = item.icon; return <Link className="client-activity" href={`/client/samples/${item.id}`} key={item.id}><div className="client-service-icon"><Icon size={19}/></div><div><strong>{item.id} • {item.service}</strong><p>{item.location} • Collected {item.date}</p></div><span className={`client-status ${item.cls}`}>{item.status}</span></Link>; })}
          </div>

          <aside className="client-card">
            <div className="client-card-header"><h2>Your service overview</h2></div>
            <div className="client-quick-list">
              <div className="client-quick-item"><div><strong>Hyderabad Facility</strong><br/><span>Primary service location</span></div><MapPin size={18}/></div>
              <Link href="/client/reports" className="client-quick-item"><div><strong>2 reports ready</strong><br/><span>View and download reports</span></div><FileCheck2 size={18}/></Link>
              <div className="client-quick-item"><div><strong>3 tests in progress</strong><br/><span>Laboratory processing</span></div><FlaskConical size={18}/></div>
            </div>
            <div className="client-progress"><div className="client-progress-row"><span>Monthly work completed</span><strong>75%</strong></div><div className="client-progress-track"><div className="client-progress-fill" /></div></div>
          </aside>
        </section>
      </main>
      <footer className="client-footer">Nexus Test Labs Client Portal • Demonstration data only</footer>
    </>
  );
}
