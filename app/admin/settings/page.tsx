import {
  BellRing,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  Globe2,
  HardDrive,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import SettingsPreferences from "./SettingsPreferences";
import "./settings.css";

export const dynamic = "force-dynamic";

async function getSystemSnapshot() {
  try {
    const [
      companies,
      leads,
      documents,
    ] = await Promise.all([
      db.orm.public.Company.all(),
      db.orm.public.Lead.all(),
      db.orm.public.Document.all(),
    ]);

    return {
      databaseOnline: true,
      companies: companies.length,
      leads: leads.length,
      documents: documents.length,
    };
  } catch (error) {
    console.error("Settings system snapshot error:", error);

    return {
      databaseOnline: false,
      companies: 0,
      leads: 0,
      documents: 0,
    };
  }
}

export default async function SettingsPage() {
  const snapshot = await getSystemSnapshot();

  return (
    <main className="settings-page">
      <section className="settings-hero">
        <div>
          <span className="settings-eyebrow">
            SYSTEM & OPERATIONS
          </span>

          <h1>Settings</h1>

          <p>
            Hyderabad Operations configuration, CRM preferences,
            account visibility and system health.
          </p>
        </div>

        <div className="settings-hero-icon">
          <Settings2 size={28} />
        </div>
      </section>

      <section className="settings-health-grid">
        <HealthCard
          icon={<Database size={19} />}
          label="Database"
          value={
            snapshot.databaseOnline
              ? "Connected"
              : "Unavailable"
          }
          helper={
            snapshot.databaseOnline
              ? "Neon CRM data is responding"
              : "Database check failed"
          }
          state={
            snapshot.databaseOnline
              ? "good"
              : "danger"
          }
        />

        <HealthCard
          icon={<Building2 size={19} />}
          label="Clients"
          value={String(snapshot.companies)}
          helper="Company records currently stored"
          state="blue"
        />

        <HealthCard
          icon={<UsersRound size={19} />}
          label="Leads"
          value={String(snapshot.leads)}
          helper="Lead records currently stored"
          state="purple"
        />

        <HealthCard
          icon={<FileText size={19} />}
          label="Documents"
          value={String(snapshot.documents)}
          helper="Document records currently stored"
          state="cyan"
        />
      </section>

      <section className="settings-grid">
        <article className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon blue">
              <Building2 size={18} />
            </div>

            <div>
              <span>OPERATIONS PROFILE</span>
              <h2>Hyderabad Operations</h2>
              <p>
                Core identity used across this CRM workspace.
              </p>
            </div>
          </div>

          <div className="settings-info-list">
            <InfoRow
              label="Organisation"
              value="Nexus Test Labs Pvt. Ltd."
            />

            <InfoRow
              label="Workspace"
              value="Hyderabad Operations"
            />

            <InfoRow
              label="Regional Coverage"
              value="Telangana & Andhra Pradesh"
            />

            <InfoRow
              label="Website"
              value={
                <a
                  href="https://nexustestlabs.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  nexustestlabs.com
                  <Globe2 size={12} />
                </a>
              }
            />

            <InfoRow
              label="CRM Mode"
              value="Production data only"
            />
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon green">
              <ShieldCheck size={18} />
            </div>

            <div>
              <span>SYSTEM STATUS</span>
              <h2>CRM Health</h2>
              <p>
                Current operational status of the Hyderabad CRM.
              </p>
            </div>
          </div>

          <div className="settings-status-list">
            <StatusRow
              label="CRM Application"
              value="Online"
              active
            />

            <StatusRow
              label="Neon Database"
              value={
                snapshot.databaseOnline
                  ? "Connected"
                  : "Unavailable"
              }
              active={snapshot.databaseOnline}
            />

            <StatusRow
              label="Document Register"
              value="Enabled"
              active
            />

            <StatusRow
              label="Company 360"
              value="Enabled"
              active
            />

            <StatusRow
              label="Digital Marketing → Lead"
              value="Enabled"
              active
            />
          </div>
        </article>
      </section>

      <SettingsPreferences />

      <section className="settings-grid settings-bottom-grid">
        <article className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon purple">
              <BellRing size={18} />
            </div>

            <div>
              <span>NOTIFICATIONS</span>
              <h2>CRM Alerts</h2>
              <p>
                Current notification behaviour in the application.
              </p>
            </div>
          </div>

          <div className="settings-note">
            <CheckCircle2 size={18} />

            <div>
              <strong>Lead notification polling is active.</strong>
              <p>
                New lead notifications continue to use the existing
                CRM notification system. Browser preferences below do
                not modify server-side lead data.
              </p>
            </div>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon slate">
              <HardDrive size={18} />
            </div>

            <div>
              <span>DATA POLICY</span>
              <h2>Production Safety</h2>
              <p>
                Rules followed by this Hyderabad operations system.
              </p>
            </div>
          </div>

          <div className="settings-policy-list">
            <div>
              <ShieldCheck size={15} />
              <span>
                Dashboard numbers come from CRM records.
              </span>
            </div>

            <div>
              <ShieldCheck size={15} />
              <span>
                Missing business records display zero or no records.
              </span>
            </div>

            <div>
              <ShieldCheck size={15} />
              <span>
                Client names are displayed from stored CRM data.
              </span>
            </div>

            <div>
              <ShieldCheck size={15} />
              <span>
                Document files require a real URL or reference.
              </span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function HealthCard({
  icon,
  label,
  value,
  helper,
  state,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  state: "good" | "danger" | "blue" | "purple" | "cyan";
}) {
  return (
    <article className={`settings-health-card ${state}`}>
      <div className="settings-health-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="settings-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="settings-status-row">
      <span className={active ? "online" : "offline"} />
      <strong>{label}</strong>
      <small>{value}</small>
    </div>
  );
}
