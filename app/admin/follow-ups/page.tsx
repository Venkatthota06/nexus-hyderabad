import Link from "next/link";
import { db } from "@/src/prisma/db";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  ReceiptText,
  UserRound,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  companyId: string | null;
  name: string;
  company: string;
  service: string;
  status: string;
  notes: string | null;
  nextFollowUp: string | null;
};

type Activity = {
  id: string;
  companyId: string;
  type: string;
  title: string;
  outcome: string | null;
  nextAction: string | null;
  nextFollowUp: string | null;
};

type Quotation = {
  id: string;
  companyId: string;
  quotationNumber: string;
  service: string;
  totalAmount: number;
  status: string;
  notes: string | null;
  nextFollowUp: string | null;
};

type Company = {
  id: string;
  name: string;
};

type FollowUpItem = {
  id: string;
  source: "Lead" | "Activity" | "Quotation";
  title: string;
  subtitle: string;
  companyName: string;
  status: string;
  nextFollowUp: string | null;
  notes: string | null;
  href: string;
};

/* =========================================================
   DATABASE
========================================================= */

async function getLeads(): Promise<Lead[]> {
  try {
    const leads =
      await db.orm.public.Lead.all();

    return leads as Lead[];
  } catch (error) {
    console.error(
      "Follow-ups leads error:",
      error
    );

    return [];
  }
}

async function getActivities(): Promise<Activity[]> {
  try {
    const activities =
      await db.orm.public.Activity.all();

    return activities as Activity[];
  } catch (error) {
    console.error(
      "Follow-ups activities error:",
      error
    );

    return [];
  }
}

async function getQuotations(): Promise<Quotation[]> {
  try {
    const quotations =
      await db.orm.public.Quotation.all();

    return quotations as Quotation[];
  } catch (error) {
    console.error(
      "Follow-ups quotations error:",
      error
    );

    return [];
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    const companies =
      await db.orm.public.Company.all();

    return companies as Company[];
  } catch (error) {
    console.error(
      "Follow-ups companies error:",
      error
    );

    return [];
  }
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeDate(value: string) {
  return value.slice(0, 10);
}

function todayString() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const raw = normalizeDate(value);

  const [year, month, day] =
    raw.split("-").map(Number);

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function sourceIcon(
  source: FollowUpItem["source"]
) {
  if (source === "Activity") {
    return <ClipboardList size={16} />;
  }

  if (source === "Quotation") {
    return <ReceiptText size={16} />;
  }

  return <UserRound size={16} />;
}

function buttonText(
  source: FollowUpItem["source"]
) {
  if (source === "Activity") {
    return "View Company";
  }

  if (source === "Quotation") {
    return "View Quotation";
  }

  return "View Lead";
}

function sourceClass(
  source: FollowUpItem["source"]
) {
  if (source === "Activity") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (source === "Quotation") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function statusClass(status: string) {
  if (
    status === "Won" ||
    status === "Accepted"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    status === "Lost" ||
    status === "Rejected"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    status === "Sent" ||
    status === "Contacted"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    status === "Under Review" ||
    status === "Requirement Identified"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}

/* =========================================================
   FOLLOW-UP CARD
========================================================= */

function FollowUpCard({
  item,
}: {
  item: FollowUpItem;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
        {/* LEFT */}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${sourceClass(
                item.source
              )}`}
            >
              {sourceIcon(item.source)}
              {item.source}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${statusClass(
                item.status
              )}`}
            >
              {item.status}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900">
              {item.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {item.subtitle}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Building2
              size={15}
              className="shrink-0 text-slate-400"
            />

            <span>
              {item.companyName}
            </span>
          </div>

          {item.notes && (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
              {item.notes}
            </p>
          )}
        </div>

        {/* RIGHT */}

        <div>
          {item.nextFollowUp ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Next Follow-up
              </span>

              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <CalendarDays
                  size={16}
                  className="text-slate-400"
                />

                {formatDate(
                  item.nextFollowUp
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Next Follow-up
              </span>

              <p className="mt-2 text-sm font-semibold text-slate-400">
                Not scheduled
              </p>
            </div>
          )}

          <Link
  href={item.href}
  className={`
    group mt-3
    inline-flex w-full
    items-center justify-center
    gap-3
    rounded-xl
    px-4 py-3.5
    text-sm font-bold
    text-white
    shadow-sm
    transition-all duration-300
    hover:-translate-y-0.5
    hover:shadow-lg
    active:translate-y-0

    ${
      item.source === "Activity"
        ? "bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600"
        : item.source === "Quotation"
        ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700"
        : "bg-gradient-to-r from-slate-9900 to-[#0b3150] hover:from-[#0b3150] hover:to-[#0876c9]"
    }
  `}
>
  <span>
    {buttonText(item.source)}
  </span>

  <ArrowRight
    size={17}
    className="transition-transform duration-300 group-hover:translate-x-1.5"
  />
</Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SECTION
========================================================= */

function FollowUpSection({
  title,
  description,
  items,
  titleClass = "text-slate-900",
}: {
  title: string;
  description: string;
  items: FollowUpItem[];
  titleClass?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2
            className={`text-lg font-bold ${titleClass}`}
          >
            {title}
          </h2>

          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
            {items.length}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <FollowUpCard
            key={`${item.source}-${item.id}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function FollowUpsPage() {
  const [
    leads,
    activities,
    quotations,
    companies,
  ] = await Promise.all([
    getLeads(),
    getActivities(),
    getQuotations(),
    getCompanies(),
  ]);

  const companyMap =
    new Map(
      companies.map(
        (company) => [
          company.id,
          company.name,
        ]
      )
    );

  const activeLeadStatuses = [
    "New Lead",
    "Contacted",
    "Meeting",
    "Meeting Scheduled",
    "Requirement Identified",
    "Quotation Sent",
    "Follow-up",
  ];

  const leadItems: FollowUpItem[] =
    leads
      .filter((lead) =>
        activeLeadStatuses.includes(
          lead.status
        )
      )
      .map((lead) => ({
        id: lead.id,

        source: "Lead",

        title: lead.name,

        subtitle: lead.service,

        companyName:
          lead.companyId
            ? companyMap.get(
                lead.companyId
              ) ||
              lead.company
            : lead.company,

        status:
          lead.status,

        nextFollowUp:
          lead.nextFollowUp,

        notes:
          lead.notes,

        href:
          `/admin/leads/${lead.id}`,
      }));

  const activityItems: FollowUpItem[] =
    activities
      .filter(
        (activity) =>
          activity.nextFollowUp
      )
      .map((activity) => ({
        id: activity.id,

        source:
          "Activity",

        title:
          activity.title,

        subtitle:
          activity.nextAction ||
          activity.type,

        companyName:
          companyMap.get(
            activity.companyId
          ) ||
          "Unknown Company",

        status:
          activity.type,

        nextFollowUp:
          activity.nextFollowUp,

        notes:
          activity.outcome,

        href:
          `/admin/companies/${activity.companyId}`,
      }));

  const quotationItems: FollowUpItem[] =
    quotations
      .filter(
        (quotation) =>
          quotation.nextFollowUp &&
          quotation.status !==
            "Accepted" &&
          quotation.status !==
            "Rejected" &&
          quotation.status !==
            "Expired"
      )
      .map((quotation) => ({
        id: quotation.id,

        source:
          "Quotation",

        title:
          quotation.quotationNumber,

        subtitle:
          `${quotation.service} • ${formatCurrency(
            quotation.totalAmount
          )}`,

        companyName:
          companyMap.get(
            quotation.companyId
          ) ||
          "Unknown Company",

        status:
          quotation.status,

        nextFollowUp:
          quotation.nextFollowUp,

        notes:
          quotation.notes,

        href:
          `/admin/quotations/${quotation.id}`,
      }));

  const allItems = [
    ...leadItems,
    ...activityItems,
    ...quotationItems,
  ];

  const today =
    todayString();

  const overdue =
    allItems
      .filter(
        (item) =>
          item.nextFollowUp &&
          normalizeDate(
            item.nextFollowUp
          ) < today
      )
      .sort((a, b) =>
        normalizeDate(
          a.nextFollowUp!
        ).localeCompare(
          normalizeDate(
            b.nextFollowUp!
          )
        )
      );

  const dueToday =
    allItems.filter(
      (item) =>
        item.nextFollowUp &&
        normalizeDate(
          item.nextFollowUp
        ) === today
    );

  const upcoming =
    allItems
      .filter(
        (item) =>
          item.nextFollowUp &&
          normalizeDate(
            item.nextFollowUp
          ) > today
      )
      .sort((a, b) =>
        normalizeDate(
          a.nextFollowUp!
        ).localeCompare(
          normalizeDate(
            b.nextFollowUp!
          )
        )
      );

  const noFollowUp =
    leadItems.filter(
      (item) =>
        !item.nextFollowUp
    );

  const scheduledLeadFollowUps =
    leadItems.filter(
      (item) =>
        item.nextFollowUp
    ).length;

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      {/* HEADER */}

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#0876c9]">
            Nexus Hyderabad CRM
          </span>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
            Follow-ups
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Lead, activity and quotation follow-ups
            in one place.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-lime-500" />
          Follow-up Tracker
        </div>
      </header>

      {/* SUMMARY */}

      <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Overdue"
          value={overdue.length}
          type="danger"
        />

        <SummaryCard
          label="Due Today"
          value={dueToday.length}
          type="warning"
        />

        <SummaryCard
          label="Lead Follow-ups"
          value={
            scheduledLeadFollowUps
          }
        />

        <SummaryCard
          label="Activity Follow-ups"
          value={activityItems.length}
        />

        <SummaryCard
          label="Quotation Follow-ups"
          value={quotationItems.length}
        />
      </section>

      {/* SECTIONS */}

      <FollowUpSection
        title="Overdue"
        description="These follow-ups have already passed."
        items={overdue}
        titleClass="text-red-700"
      />

      <FollowUpSection
        title="Due Today"
        description="Follow-ups requiring attention today."
        items={dueToday}
        titleClass="text-amber-700"
      />

      <FollowUpSection
        title="Upcoming"
        description="Scheduled future follow-ups."
        items={upcoming}
      />

      <FollowUpSection
        title="Leads Without Follow-up Date"
        description="Active leads that currently have no next follow-up scheduled."
        items={noFollowUp}
      />

      {/* EMPTY */}

      {allItems.length === 0 && (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FileText size={26} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No follow-ups
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Follow-ups from leads, activities
            and quotations will appear here.
          </p>
        </section>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  type = "normal",
}: {
  label: string;
  value: number;
  type?: "normal" | "danger" | "warning";
}) {
  let border =
    "border-slate-200";

  let valueColor =
    "text-slate-900";

  if (type === "danger") {
    border =
      "border-red-200";

    valueColor =
      "text-red-600";
  }

  if (type === "warning") {
    border =
      "border-amber-200";

    valueColor =
      "text-amber-600";
  }

  return (
    <div
      className={`rounded-2xl border ${border} bg-white p-5 shadow-sm`}
    >
      <span className="text-sm font-semibold text-slate-500">
        {label}
      </span>

      <strong
        className={`mt-2 block text-3xl font-bold ${valueColor}`}
      >
        {value}
      </strong>
    </div>
  );
}