import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Crown,
  ExternalLink,
  FileCheck2,
  FileText,
  FlaskConical,
  Globe2,
  Layers3,
  Link2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  ReceiptIndianRupee,
  RefreshCcw,
  TestTube2,
  TrendingUp,
  UserPlus,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { db } from "@/src/prisma/db";
import CompanyDocumentsSection from "./CompanyDocumentsSection";

type Company = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Contact = {
  id: string;
  companyId: string;
  name: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  decisionMaker: boolean;
  createdAt: string;
  updatedAt: string;
};

type Lead = {
  id: string;
  companyId: string | null;
  name: string;
  company: string;
  phone: string;
  email: string;
  service: string;
  requirement: string;
  source: string;
  status: string;
  isRead: boolean;
  notes: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

type Activity = {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string | null;
  outcome: string | null;
  activityDate: string;
  nextAction: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  description: string | null;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  quotationDate: string;
  sentDate: string | null;
  nextFollowUp: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type QuotationItem = {
  id: string;
  quotationId: string;
  service: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

type WorkOrder = {
  id: string;
  companyId: string;
  quotationId: string | null;
  workOrderNumber: string;
  service: string;
  description: string | null;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  confirmedDate: string;
  expectedStart: string | null;
  expectedEnd: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Sample = {
  id: string;
  companyId: string;
  quotationId: string | null;
  workOrderId: string | null;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  collectionDate: string | null;
  collectedBy: string | null;
  status: string;
  testingLocation: string | null;
  expectedCompletionDate: string | null;
  reportStatus: string;
  reportDeliveredDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Report = {
  id: string;
  companyId: string;
  sampleId: string;
  reportNumber: string;
  reportType: string;
  reportDate: string | null;
  status: string;
  deliveredDate: string | null;
  deliveryMethod: string | null;
  fileReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Location = {
  id: string;
  companyId: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Payment = {
  id: string;
  companyId: string;
  quotationId: string | null;
  workOrderId: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
  reference: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type RecurringService = {
  id: string;
  companyId: string;
  locationId: string | null;
  service: string;
  sampleType: string;
  samplesPerMonth: number;
  frequency: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: string;
};

async function getCompany(id: string): Promise<Company | null> {
  try {
    const company = await db.orm.public.Company.where({ id }).first();
    return company ? (company as Company) : null;
  } catch (error) {
    console.error("Company detail error:", error);
    return null;
  }
}

async function getContacts(companyId: string): Promise<Contact[]> {
  try {
    return (await db.orm.public.Contact.where({ companyId }).orderBy((row) => row.createdAt.desc()).all()) as Contact[];
  } catch (error) {
    console.error("Company contacts error:", error);
    return [];
  }
}

async function getLeads(companyId: string): Promise<Lead[]> {
  try {
    return (await db.orm.public.Lead.where({ companyId }).orderBy((row) => row.createdAt.desc()).all()) as Lead[];
  } catch (error) {
    console.error("Company leads error:", error);
    return [];
  }
}

async function getActivities(companyId: string): Promise<Activity[]> {
  try {
    return (await db.orm.public.Activity.where({ companyId }).orderBy((row) => row.activityDate.desc()).all()) as Activity[];
  } catch (error) {
    console.error("Company activities error:", error);
    return [];
  }
}

async function getQuotations(companyId: string): Promise<Quotation[]> {
  try {
    return (await db.orm.public.Quotation.where({ companyId }).orderBy((row) => row.quotationDate.desc()).all()) as Quotation[];
  } catch (error) {
    console.error("Company quotations error:", error);
    return [];
  }
}

async function getQuotationItems(quotations: Quotation[]): Promise<QuotationItem[]> {
  try {
    const groups = await Promise.all(
      quotations.map(async (quotation) =>
        (await db.orm.public.QuotationItem
          .where({ quotationId: quotation.id })
          .orderBy((row) => row.createdAt.asc())
          .all()) as QuotationItem[]
      )
    );
    return groups.flat();
  } catch (error) {
    console.error("Quotation items error:", error);
    return [];
  }
}

async function getWorkOrders(companyId: string): Promise<WorkOrder[]> {
  try {
    return (await db.orm.public.WorkOrder.where({ companyId }).orderBy((row) => row.confirmedDate.desc()).all()) as WorkOrder[];
  } catch (error) {
    console.error("Company work orders error:", error);
    return [];
  }
}

async function getSamples(companyId: string): Promise<Sample[]> {
  try {
    return (await db.orm.public.Sample.where({ companyId }).orderBy((row) => row.createdAt.desc()).all()) as Sample[];
  } catch (error) {
    console.error("Company samples error:", error);
    return [];
  }
}

async function getReports(companyId: string): Promise<Report[]> {
  try {
    return (await db.orm.public.Report.where({ companyId }).orderBy((row) => row.createdAt.desc()).all()) as Report[];
  } catch (error) {
    console.error("Company reports error:", error);
    return [];
  }
}

async function getLocations(companyId: string): Promise<Location[]> {
  try {
    return (await db.orm.public.Location.where({ companyId }).orderBy((row) => row.createdAt.desc()).all()) as Location[];
  } catch (error) {
    console.error("Company locations error:", error);
    return [];
  }
}

async function getPayments(companyId: string): Promise<Payment[]> {
  try {
    return (await db.orm.public.Payment.where({ companyId }).orderBy((row) => row.paymentDate.desc()).all()) as Payment[];
  } catch (error) {
    console.error("Company payments error:", error);
    return [];
  }
}

async function getRecurringServices(companyId: string): Promise<RecurringService[]> {
  try {
    return (await db.orm.public.RecurringService.where({ companyId }).orderBy((row) => row.createdAt.desc()).all()) as RecurringService[];
  } catch (error) {
    console.error("Company recurring services error:", error);
    return [];
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function statusClass(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function websiteHref(value: string) {
  return value.startsWith("http") ? value : `https://${value}`;
}

function isActiveLead(status: string) {
  return !["won", "lost", "closed", "cancelled"].includes(status.trim().toLowerCase());
}

function isOpenQuotation(status: string) {
  return !["accepted", "approved", "won", "closed", "rejected", "cancelled", "expired"].includes(
    status.trim().toLowerCase()
  );
}

function isActiveRecurring(status: string) {
  return status.trim().toLowerCase() === "active";
}

function isReceivedPayment(status: string) {
  return ["received", "paid", "collected", "completed"].includes(status.trim().toLowerCase());
}

function isCountedWorkOrder(status: string) {
  return !["cancelled", "rejected", "void"].includes(status.trim().toLowerCase());
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) notFound();

  const [
    contacts,
    leads,
    activities,
    quotations,
    workOrders,
    samples,
    reports,
    locations,
    payments,
    recurringServices,
  ] = await Promise.all([
    getContacts(company.id),
    getLeads(company.id),
    getActivities(company.id),
    getQuotations(company.id),
    getWorkOrders(company.id),
    getSamples(company.id),
    getReports(company.id),
    getLocations(company.id),
    getPayments(company.id),
    getRecurringServices(company.id),
  ]);

  const quotationItems = await getQuotationItems(quotations);
  const decisionMakers = contacts.filter((contact) => contact.decisionMaker).length;
  const activeLeads = leads.filter((lead) => isActiveLead(lead.status)).length;
  const openQuotations = quotations.filter((quotation) => isOpenQuotation(quotation.status)).length;
  const countedWorkOrders = workOrders.filter((workOrder) => isCountedWorkOrder(workOrder.status));
  const totalOrderValue = sum(countedWorkOrders.map((workOrder) => workOrder.totalAmount));
  const receivedPayments = payments.filter((payment) => isReceivedPayment(payment.status));
  const amountCollected = sum(receivedPayments.map((payment) => payment.amount));
  const pendingAmount = Math.max(totalOrderValue - amountCollected, 0);
  const recurringSamplesPerMonth = sum(
    recurringServices.filter((service) => isActiveRecurring(service.status)).map((service) => service.samplesPerMonth)
  );
  const totalSampleUnits = sum(samples.map((sample) => sample.sampleCount));
  const activeLocations = locations.filter((location) => location.status.toLowerCase() === "active").length;

  const timeline: TimelineEntry[] = [
    ...activities.map((activity) => ({
      id: `activity-${activity.id}`,
      date: activity.activityDate,
      title: activity.title,
      detail: activity.type,
      kind: "Activity",
    })),
    ...quotations.map((quotation) => ({
      id: `quotation-${quotation.id}`,
      date: quotation.quotationDate,
      title: `Quotation ${quotation.quotationNumber}`,
      detail: `${quotation.service} Â· ${formatCurrency(quotation.totalAmount)}`,
      kind: "Quotation",
    })),
    ...workOrders.map((workOrder) => ({
      id: `workorder-${workOrder.id}`,
      date: workOrder.confirmedDate,
      title: `Work Order ${workOrder.workOrderNumber}`,
      detail: `${workOrder.service} Â· ${formatCurrency(workOrder.totalAmount)}`,
      kind: "Work Order",
    })),
    ...samples.map((sample) => ({
      id: `sample-${sample.id}`,
      date: sample.collectionDate || sample.createdAt,
      title: `Sample ${sample.sampleNumber}`,
      detail: `${sample.sampleType} Â· ${sample.sampleCount} ${sample.sampleCount === 1 ? "sample" : "samples"}`,
      kind: "Sample",
    })),
    ...reports.map((report) => ({
      id: `report-${report.id}`,
      date: report.reportDate || report.createdAt,
      title: `Report ${report.reportNumber}`,
      detail: report.reportType,
      kind: "Report",
    })),
    ...receivedPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.paymentDate,
      title: `Payment ${formatCurrency(payment.amount)}`,
      detail: payment.paymentMethod || "Payment received",
      kind: "Payment",
    })),
  ]
    .filter((entry) => Boolean(entry.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);

  return (
    <div className="company360-page">
      <div className="company360-topbar">
        <Link href="/admin/companies" className="company360-back">
          <ArrowLeft size={17} />
          <span>Back to Clients</span>
        </Link>
        <div className="company360-topbar-copy">
          <span>Nexus Test Labs</span>
          <strong>Hyderabad Operations Â· Client 360Â°</strong>
        </div>
      </div>

      <section className="company360-hero">
        <div className="company360-hero-main">
          <div className="company360-hero-icon">
            <Building2 size={30} />
          </div>
          <div className="company360-hero-copy">
            <span className="company360-eyebrow">Client 360Â° Profile</span>
            <h1>{company.name}</h1>
            <div className="company360-hero-meta">
              <span>{company.industry || "Industry not specified"}</span>
              {company.source && <><i /><span>{company.source}</span></>}
              {(company.city || company.state) && (
                <><i /><span>{[company.city, company.state].filter(Boolean).join(", ")}</span></>
              )}
            </div>
          </div>
        </div>
        <div className="company360-hero-side">
          <span className={`company360-status ${statusClass(company.status)}`}>{company.status}</span>
          <div className="company360-hero-date">
            <CalendarDays size={15} />
            Client since {formatDate(company.createdAt)}
          </div>
        </div>
      </section>

      <section className="company360-kpis">
        <MetricCard label="Active Locations" value={String(activeLocations)} caption={`${locations.length} total locations`} icon={<MapPin size={20} />} tone="blue" />
        <MetricCard label="Contacts" value={String(contacts.length)} caption={`${decisionMakers} decision makers`} icon={<UsersRound size={20} />} tone="purple" />
        <MetricCard label="Active Leads" value={String(activeLeads)} caption={`${leads.length} total leads`} icon={<TrendingUp size={20} />} tone="cyan" />
        <MetricCard label="Open Quotations" value={String(openQuotations)} caption={`${quotations.length} total quotations`} icon={<FileText size={20} />} tone="orange" />
        <MetricCard label="Confirmed Orders" value={String(countedWorkOrders.length)} caption={formatCurrency(totalOrderValue)} icon={<ClipboardCheck size={20} />} tone="green" />
        <MetricCard label="Sample Units" value={String(totalSampleUnits)} caption={`${samples.length} sample records`} icon={<TestTube2 size={20} />} tone="sky" />
        <MetricCard label="Reports" value={String(reports.length)} caption={`${reports.filter((report) => report.deliveredDate).length} delivered`} icon={<FileCheck2 size={20} />} tone="indigo" />
        <MetricCard label="Recurring / Month" value={String(recurringSamplesPerMonth)} caption="Active recurring samples" icon={<RefreshCcw size={20} />} tone="teal" />
        <MetricCard label="Amount Collected" value={formatCurrency(amountCollected)} caption={`${receivedPayments.length} received payments`} icon={<Banknote size={20} />} tone="green" money />
        <MetricCard label="Pending Amount" value={formatCurrency(pendingAmount)} caption="Order value less received" icon={<WalletCards size={20} />} tone={pendingAmount > 0 ? "red" : "slate"} money />
      </section>

      <section className="company360-overview-grid">
        <PanelCard eyebrow="Business Details" title="Company Information" description="Core client information used across Hyderabad operations.">
          <div className="company360-info-grid">
            <InfoItem icon={<Building2 size={17} />} label="Industry" value={company.industry || "Not specified"} />
            <InfoItem icon={<BriefcaseBusiness size={17} />} label="Source" value={company.source || "Not specified"} />
            <InfoItem icon={<Phone size={17} />} label="Phone" value={company.phone ? <a href={`tel:${company.phone}`}>{company.phone}</a> : "Not available"} />
            <InfoItem icon={<Mail size={17} />} label="Email" value={company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : "Not available"} />
            <InfoItem icon={<Globe2 size={17} />} label="Website" value={company.website ? <a href={websiteHref(company.website)} target="_blank" rel="noreferrer">{company.website}<ExternalLink size={12} /></a> : "Not available"} />
            <InfoItem icon={<CalendarDays size={17} />} label="Last Updated" value={formatDate(company.updatedAt)} />
          </div>
        </PanelCard>

        <PanelCard eyebrow="Primary Address" title="Company Location" description="Main office or operating address stored on the client record.">
          <div className="company360-primary-location">
            <div className="company360-primary-location-icon"><MapPin size={25} /></div>
            <div>
              <span>Primary company address</span>
              <h3>{company.city || company.state ? [company.city, company.state].filter(Boolean).join(", ") : "Location not specified"}</h3>
              <p>{company.address || "No address added yet."}</p>
            </div>
          </div>
        </PanelCard>
      </section>

      <Section eyebrow="Facility Network" title="Client Locations" description="Every active facility or operating site linked to this client." icon={<MapPin size={19} />}>
        {locations.length ? (
          <div className="company360-card-grid three">
            {locations.map((location) => (
              <article className="company360-record-card" key={location.id}>
                <RecordHead icon={<MapPin size={18} />} title={location.name} subtitle={[location.city, location.state].filter(Boolean).join(", ") || "Location details not specified"} status={location.status} />
                <div className="company360-record-body">
                  <RecordField label="Address" value={location.address || "Not available"} />
                  <RecordField label="Contact" value={location.contactName || "Not available"} />
                  <RecordField label="Phone / Email" value={[location.phone, location.email].filter(Boolean).join(" Â· ") || "Not available"} />
                  {location.notes && <RecordField label="Notes" value={location.notes} />}
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState icon={<MapPin size={29} />} title="No client locations yet" description="No Location records are linked to this company." />}
      </Section>

      <Section eyebrow="People" title="Contacts & Decision Makers" description="Facility, Admin, EHS, Procurement, Operations and other client contacts." icon={<UsersRound size={19} />} action={<Link href={`/admin/companies/${company.id}/contacts/new`} className="company360-primary-action"><UserPlus size={16} />Add Contact</Link>}>
        {contacts.length ? (
          <div className="company360-card-grid two">
            {contacts.map((contact) => (
              <article className="company360-contact-card" key={contact.id}>
                <div className="company360-contact-head">
                  <div className="company360-avatar">{contact.name.charAt(0).toUpperCase()}</div>
                  <div className="company360-contact-name">
                    <div><h3>{contact.name}</h3>{contact.decisionMaker && <span className="company360-decision-badge"><Crown size={11} />Decision Maker</span>}</div>
                    <p>{contact.designation || "Designation not specified"}</p>
                  </div>
                </div>
                <div className="company360-contact-links">
                  {contact.phone && <a href={`tel:${contact.phone}`}><Phone size={15} /><span>{contact.phone}</span></a>}
                  {contact.email && <a href={`mailto:${contact.email}`}><Mail size={15} /><span>{contact.email}</span></a>}
                  {contact.linkedin && <a href={websiteHref(contact.linkedin)} target="_blank" rel="noreferrer"><Link2 size={15} /><span>LinkedIn</span><ExternalLink size={11} /></a>}
                  {!contact.phone && !contact.email && !contact.linkedin && <span className="company360-muted">No contact channels added.</span>}
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState icon={<UsersRound size={29} />} title="No contacts yet" description={`Add the first contact person for ${company.name}.`} actionHref={`/admin/companies/${company.id}/contacts/new`} actionLabel="Add First Contact" />}
      </Section>

      <Section eyebrow="Sales Pipeline" title="Leads & Opportunities" description={`Enquiries and opportunities linked to ${company.name}.`} icon={<TrendingUp size={19} />} action={<Link href="/admin/leads" className="company360-secondary-action">View All Leads<ArrowRight size={15} /></Link>}>
        {leads.length ? (
          <div className="company360-card-grid two">
            {leads.map((lead) => (
              <article className="company360-record-card" key={lead.id}>
                <RecordHead icon={<TrendingUp size={18} />} title={lead.name} subtitle={lead.service} status={lead.status} />
                <div className="company360-record-body">
                  <RecordField label="Requirement" value={lead.requirement} />
                  <RecordField label="Source" value={lead.source} />
                  <RecordField label="Next Follow-up" value={lead.nextFollowUp ? formatDate(lead.nextFollowUp) : "Not scheduled"} />
                </div>
                <RecordFooter left={formatDate(lead.createdAt)} href={`/admin/leads/${lead.id}`} label="View Lead" />
              </article>
            ))}
          </div>
        ) : <EmptyState icon={<TrendingUp size={29} />} title="No linked leads yet" description={`No Lead records are linked to ${company.name}.`} actionHref="/admin/leads" actionLabel="Go to Leads" />}
      </Section>

      <Section eyebrow="Engagement" title="Follow-ups & Activity History" description="Calls, meetings, visits, LinkedIn outreach, outcomes and next actions." icon={<CalendarDays size={19} />} action={<Link href={`/admin/companies/${company.id}/activities/new`} className="company360-primary-action"><Plus size={16} />Add Activity</Link>}>
        {activities.length ? (
          <div className="company360-timeline-list">
            {activities.map((activity) => (
              <article className="company360-activity-card" key={activity.id}>
                <div className="company360-activity-icon"><CalendarDays size={18} /></div>
                <div className="company360-activity-content">
                  <div className="company360-activity-title"><div><h3>{activity.title}</h3><span>{activity.type}</span></div><small>{formatDate(activity.activityDate)}</small></div>
                  <div className="company360-detail-grid">
                    {activity.description && <RecordField label="Discussion" value={activity.description} />}
                    {activity.outcome && <RecordField label="Outcome" value={activity.outcome} />}
                    {activity.nextAction && <RecordField label="Next Action" value={activity.nextAction} />}
                  </div>
                  {activity.nextFollowUp && <div className="company360-followup-chip"><Clock3 size={14} />Follow-up {formatDate(activity.nextFollowUp)}</div>}
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState icon={<CalendarDays size={29} />} title="No activities yet" description={`Record the first call, meeting or field visit for ${company.name}.`} actionHref={`/admin/companies/${company.id}/activities/new`} actionLabel="Add First Activity" />}
      </Section>

      <Section eyebrow="Commercial Pipeline" title="Quotations" description="Pricing, GST, quotation items, status and commercial follow-ups." icon={<ReceiptIndianRupee size={19} />} action={<Link href="/admin/quotations" className="company360-secondary-action">View All Quotations<ArrowRight size={15} /></Link>}>
        {quotations.length ? (
          <div className="company360-stack">
            {quotations.map((quotation) => {
              const items = quotationItems.filter((item) => item.quotationId === quotation.id);
              return (
                <article className="company360-commercial-card" key={quotation.id}>
                  <RecordHead icon={<ReceiptIndianRupee size={18} />} title={quotation.quotationNumber} subtitle={quotation.service} status={quotation.status} />
                  <div className="company360-commercial-summary">
                    <MoneyCell label="Base" value={quotation.amount} />
                    <MoneyCell label={`GST (${quotation.gstPercent}%)`} value={quotation.gstAmount} />
                    <MoneyCell label="Total" value={quotation.totalAmount} strong />
                    <div className="company360-summary-cell"><span>Quotation Date</span><strong>{formatDate(quotation.quotationDate)}</strong></div>
                  </div>
                  {quotation.description && <div className="company360-commercial-note"><span>Scope / Description</span><p>{quotation.description}</p></div>}
                  {items.length > 0 && (
                    <div className="company360-items-wrap">
                      <div className="company360-items-title"><Layers3 size={15} />Quotation Items</div>
                      <div className="company360-table-wrap">
                        <table className="company360-table">
                          <thead><tr><th>Service</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
                          <tbody>{items.map((item) => <tr key={item.id}><td>{item.service}</td><td>{item.description || "â€”"}</td><td>{item.quantity}</td><td>{formatCurrency(item.unitPrice)}</td><td>{formatCurrency(item.amount)}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <RecordFooter left={quotation.nextFollowUp ? `Follow-up ${formatDate(quotation.nextFollowUp)}` : "No follow-up scheduled"} href={`/admin/quotations/${quotation.id}`} label="View Quotation" />
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon={<ReceiptIndianRupee size={29} />} title="No quotations yet" description={`No quotation is linked to ${company.name}.`} actionHref="/admin/quotations/new" actionLabel="Create Quotation" />}
      </Section>

      <Section eyebrow="Confirmed Business" title="Work Orders" description="Approved commercial work and confirmed service value." icon={<ClipboardCheck size={19} />}>
        {workOrders.length ? (
          <div className="company360-card-grid two">
            {workOrders.map((workOrder) => {
              const linkedQuotation = quotations.find((quotation) => quotation.id === workOrder.quotationId);
              return (
                <article className="company360-record-card" key={workOrder.id}>
                  <RecordHead icon={<ClipboardCheck size={18} />} title={workOrder.workOrderNumber} subtitle={workOrder.service} status={workOrder.status} />
                  <div className="company360-record-body">
                    <RecordField label="Confirmed" value={formatDate(workOrder.confirmedDate)} />
                    <RecordField label="Order Value" value={formatCurrency(workOrder.totalAmount)} />
                    <RecordField label="Linked Quotation" value={linkedQuotation?.quotationNumber || (workOrder.quotationId ? "Linked quotation" : "None")} />
                    <RecordField label="Service Window" value={workOrder.expectedStart || workOrder.expectedEnd ? `${formatDate(workOrder.expectedStart)} â†’ ${formatDate(workOrder.expectedEnd)}` : "Not scheduled"} />
                    {workOrder.notes && <RecordField label="Notes" value={workOrder.notes} />}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon={<ClipboardCheck size={29} />} title="No work orders yet" description="Confirmed business will appear here after Work Order records are created." />}
      </Section>

      <Section eyebrow="Laboratory Operations" title="Sample Collection & Testing" description="Collection, testing location, completion targets and report progress." icon={<FlaskConical size={19} />} action={<Link href="/admin/samples" className="company360-secondary-action">View All Samples<ArrowRight size={15} /></Link>}>
        {samples.length ? (
          <div className="company360-card-grid two">
            {samples.map((sample) => (
              <article className="company360-record-card" key={sample.id}>
                <RecordHead icon={<TestTube2 size={18} />} title={sample.sampleNumber} subtitle={`${sample.sampleType} Â· ${sample.sampleCount} ${sample.sampleCount === 1 ? "sample" : "samples"}`} status={sample.status} />
                <div className="company360-record-body">
                  <RecordField label="Collection Date" value={sample.collectionDate ? formatDate(sample.collectionDate) : "Not collected"} />
                  <RecordField label="Collected By" value={sample.collectedBy || "Not available"} />
                  <RecordField label="Testing Location" value={sample.testingLocation || "Not available"} />
                  <RecordField label="Report Status" value={sample.reportStatus} />
                  <RecordField label="Expected Completion" value={sample.expectedCompletionDate ? formatDate(sample.expectedCompletionDate) : "Not scheduled"} />
                </div>
                <RecordFooter left={sample.reportStatus} href={`/admin/samples/${sample.id}`} label="View Sample" />
              </article>
            ))}
          </div>
        ) : <EmptyState icon={<FlaskConical size={29} />} title="No samples yet" description={`No laboratory sample is linked to ${company.name}.`} actionHref="/admin/samples/new" actionLabel="Add Sample" />}
      </Section>

      <Section eyebrow="Laboratory Reporting" title="Reports" description="Report preparation, release and client delivery history." icon={<FileCheck2 size={19} />} action={<Link href="/admin/reports" className="company360-secondary-action">View All Reports<ArrowRight size={15} /></Link>}>
        {reports.length ? (
          <div className="company360-card-grid two">
            {reports.map((report) => {
              const linkedSample = samples.find((sample) => sample.id === report.sampleId);
              return (
                <article className="company360-record-card" key={report.id}>
                  <RecordHead icon={<FileCheck2 size={18} />} title={report.reportNumber} subtitle={report.reportType} status={report.status} />
                  <div className="company360-record-body">
                    <RecordField label="Sample" value={linkedSample?.sampleNumber || "Unknown"} />
                    <RecordField label="Report Date" value={report.reportDate ? formatDate(report.reportDate) : "Pending"} />
                    <RecordField label="Delivered" value={report.deliveredDate ? formatDate(report.deliveredDate) : "Not delivered"} />
                    <RecordField label="Delivery Method" value={report.deliveryMethod || "Not available"} />
                    {report.fileReference && <RecordField label="File Reference" value={report.fileReference} />}
                  </div>
                  <RecordFooter left={report.deliveredDate ? `Delivered ${formatDate(report.deliveredDate)}` : "Delivery pending"} href={`/admin/reports/${report.id}`} label="View Report" />
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon={<FileCheck2 size={29} />} title="No reports yet" description={`No laboratory report is linked to ${company.name}.`} actionHref="/admin/reports/new" actionLabel="Add Report" />}
      </Section>

      <Section eyebrow="Collections" title="Payments" description="Actual company payment records used for collection and pending calculations." icon={<Banknote size={19} />}>
        {payments.length ? (
          <>
            <div className="company360-money-strip">
              <MoneySummary label="Order Value" value={totalOrderValue} icon={<ClipboardCheck size={18} />} />
              <MoneySummary label="Collected" value={amountCollected} icon={<CheckCircle2 size={18} />} positive />
              <MoneySummary label="Pending" value={pendingAmount} icon={<Clock3 size={18} />} warning={pendingAmount > 0} />
            </div>
            <div className="company360-table-wrap company360-payment-table">
              <table className="company360-table">
                <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead>
                <tbody>{payments.map((payment) => <tr key={payment.id}><td>{formatDate(payment.paymentDate)}</td><td><strong>{formatCurrency(payment.amount)}</strong></td><td>{payment.paymentMethod || "â€”"}</td><td>{payment.reference || "â€”"}</td><td><span className={`company360-inline-status ${statusClass(payment.status)}`}>{payment.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          </>
        ) : <EmptyState icon={<Banknote size={29} />} title="No payments yet" description="No Payment records are linked to this company." />}
      </Section>

      <Section eyebrow="Recurring Operations" title="Recurring Services" description="Active monthly service commitments and recurring sample volume." icon={<RefreshCcw size={19} />}>
        {recurringServices.length ? (
          <div className="company360-card-grid two">
            {recurringServices.map((service) => {
              const linkedLocation = locations.find((location) => location.id === service.locationId);
              return (
                <article className="company360-record-card" key={service.id}>
                  <RecordHead icon={<RefreshCcw size={18} />} title={service.service} subtitle={service.sampleType} status={service.status} />
                  <div className="company360-recurring-number"><strong>{service.samplesPerMonth}</strong><span>samples / month</span></div>
                  <div className="company360-record-body">
                    <RecordField label="Frequency" value={service.frequency} />
                    <RecordField label="Location" value={linkedLocation?.name || "Company level"} />
                    <RecordField label="Start" value={service.startDate ? formatDate(service.startDate) : "Not specified"} />
                    <RecordField label="End" value={service.endDate ? formatDate(service.endDate) : "Ongoing / not specified"} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon={<RefreshCcw size={29} />} title="No recurring services yet" description="Recurring Service records will appear here when monthly commitments are added." />}
      </Section>

            <CompanyDocumentsSection
        companyId={company.id}
      />
<Section eyebrow="360Â° History" title="Recent Client Timeline" description="Latest activity across engagement, quotations, orders, samples, reports and payments." icon={<PackageCheck size={19} />}>
        {timeline.length ? (
          <div className="company360-master-timeline">
            {timeline.map((entry) => (
              <div className="company360-master-timeline-row" key={entry.id}>
                <div className="company360-master-dot" />
                <div className="company360-master-date">{formatDate(entry.date)}</div>
                <div className="company360-master-content"><span>{entry.kind}</span><h3>{entry.title}</h3><p>{entry.detail}</p></div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={<PackageCheck size={29} />} title="No client history yet" description="The combined timeline will build automatically from real CRM records." />}
      </Section>
    </div>
  );
}

function MetricCard({ label, value, caption, icon, tone, money = false }: {
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
  tone: "blue" | "purple" | "cyan" | "orange" | "green" | "sky" | "indigo" | "teal" | "red" | "slate";
  money?: boolean;
}) {
  return <article className={`company360-kpi ${tone}`}><div className="company360-kpi-icon">{icon}</div><div className="company360-kpi-copy"><span>{label}</span><strong className={money ? "money" : ""}>{value}</strong><small>{caption}</small></div></article>;
}

function PanelCard({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <article className="company360-panel-card"><div className="company360-panel-head"><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{children}</article>;
}

function Section({ eyebrow, title, description, icon, action, children }: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return <section className="company360-section"><div className="company360-section-head"><div className="company360-section-heading"><div className="company360-section-icon">{icon}</div><div><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div></div>{action}</div>{children}</section>;
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <div className="company360-info-item"><div className="company360-info-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function RecordHead({ icon, title, subtitle, status }: { icon: ReactNode; title: string; subtitle: string; status: string }) {
  return <div className="company360-record-head"><div className="company360-record-icon">{icon}</div><div className="company360-record-title"><h3>{title}</h3><p>{subtitle}</p></div><span className={`company360-inline-status ${statusClass(status)}`}>{status}</span></div>;
}

function RecordField({ label, value }: { label: string; value: ReactNode }) {
  return <div className="company360-record-field"><span>{label}</span><p>{value}</p></div>;
}

function RecordFooter({ left, href, label }: { left: string; href: string; label: string }) {
  return <div className="company360-record-footer"><span>{left}</span><Link href={href}>{label}<ArrowRight size={14} /></Link></div>;
}

function MoneyCell({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className={`company360-summary-cell ${strong ? "strong" : ""}`}><span>{label}</span><strong>{formatCurrency(value)}</strong></div>;
}

function MoneySummary({ label, value, icon, positive = false, warning = false }: {
  label: string;
  value: number;
  icon: ReactNode;
  positive?: boolean;
  warning?: boolean;
}) {
  return <div className={`company360-money-summary ${positive ? "positive" : warning ? "warning" : ""}`}><div>{icon}</div><span>{label}</span><strong>{formatCurrency(value)}</strong></div>;
}

function EmptyState({ icon, title, description, actionHref, actionLabel }: {
  icon: ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return <div className="company360-empty"><div className="company360-empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{actionHref && actionLabel && <Link href={actionHref}>{actionLabel}<ArrowRight size={14} /></Link>}</div>;
}

