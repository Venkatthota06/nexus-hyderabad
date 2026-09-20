import Link from "next/link";

import type { ElementType } from "react";

import Next30DaysPlan from "./Next30DaysPlan";



import {

  Activity,

  ArrowRight,

  Building2,

  CalendarDays,

  CheckCircle2,

  CircleDollarSign,

  FileText,

  FlaskConical,

  MapPin,

  Search,

  Target,

  TrendingUp,

  Users,

  WalletCards,

} from "lucide-react";



import { db } from "@/src/prisma/db";



import "./admin-dashboard.css";



export const dynamic = "force-dynamic";



type Company = {

  id: string;

  name: string;

  industry: string | null;

  status: string;

  createdAt: string;

};



type Location = {

  id: string;

  companyId: string;

  name: string;

  status: string;

};



type RecurringService = {

  id: string;

  companyId: string;

  service: string;

  sampleType: string;

  samplesPerMonth: number;

  status: string;

};



type WorkOrder = {

  id: string;

  companyId: string;

  workOrderNumber: string;

  service: string;

  totalAmount: number;

  status: string;

  confirmedDate: string;

};



type Payment = {

  id: string;

  companyId: string;

  amount: number;

  paymentDate: string;

  status: string;

};



type Quotation = {

  id: string;

  companyId: string;

  quotationNumber: string;

  service: string;

  totalAmount: number;

  status: string;

  nextFollowUp: string | null;

  createdAt: string;

};



type ActivityRow = {

  id: string;

  companyId: string;

  type: string;

  title: string;

  description: string | null;

  activityDate: string;

  nextAction: string | null;

  nextFollowUp: string | null;

};



type Lead = {

  id: string;

  companyId: string | null;

  name: string;

  company: string;

  service: string;

  status: string;

  nextFollowUp: string | null;

  createdAt: string;

};



type Sample = {

  id: string;

  companyId: string;

  sampleNumber: string;

  sampleType: string;

  sampleCount: number;

  status: string;

  createdAt: string;

};



async function getCompanies(): Promise<Company[]> {

  try {

    return (await db.orm.public.Company

      .orderBy((row) => row.createdAt.desc())

      .all()) as Company[];

  } catch (error) {

    console.error("Dashboard companies:", error);

    return [];

  }

}



async function getLocations(): Promise<Location[]> {

  try {

    return (await db.orm.public.Location.all()) as Location[];

  } catch (error) {

    console.error("Dashboard locations:", error);

    return [];

  }

}



async function getRecurringServices(): Promise<

  RecurringService[]

> {

  try {

    return (await db.orm.public.RecurringService.all()) as RecurringService[];

  } catch (error) {

    console.error("Dashboard recurring:", error);

    return [];

  }

}



async function getWorkOrders(): Promise<WorkOrder[]> {

  try {

    return (await db.orm.public.WorkOrder

      .orderBy((row) => row.confirmedDate.desc())

      .all()) as WorkOrder[];

  } catch (error) {

    console.error("Dashboard work orders:", error);

    return [];

  }

}



async function getPayments(): Promise<Payment[]> {

  try {

    return (await db.orm.public.Payment

      .orderBy((row) => row.paymentDate.desc())

      .all()) as Payment[];

  } catch (error) {

    console.error("Dashboard payments:", error);

    return [];

  }

}



async function getQuotations(): Promise<Quotation[]> {

  try {

    return (await db.orm.public.Quotation

      .orderBy((row) => row.createdAt.desc())

      .all()) as Quotation[];

  } catch (error) {

    console.error("Dashboard quotations:", error);

    return [];

  }

}



async function getActivities(): Promise<ActivityRow[]> {

  try {

    return (await db.orm.public.Activity

      .orderBy((row) => row.activityDate.desc())

      .all()) as ActivityRow[];

  } catch (error) {

    console.error("Dashboard activities:", error);

    return [];

  }

}



async function getLeads(): Promise<Lead[]> {

  try {

    return (await db.orm.public.Lead

      .orderBy((row) => row.createdAt.desc())

      .all()) as Lead[];

  } catch (error) {

    console.error("Dashboard leads:", error);

    return [];

  }

}



async function getSamples(): Promise<Sample[]> {

  try {

    return (await db.orm.public.Sample

      .orderBy((row) => row.createdAt.desc())

      .all()) as Sample[];

  } catch (error) {

    console.error("Dashboard samples:", error);

    return [];

  }

}



function money(value: number) {

  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0,

  }).format(value);

}



function formatDate(value: string) {

  return new Intl.DateTimeFormat("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  }).format(new Date(value));

}



function isActiveStatus(status: string) {

  const value = status.toLowerCase();



  return ![

    "inactive",

    "cancelled",

    "canceled",

    "closed",

    "rejected",

    "void",

  ].includes(value);

}



function isOpenQuotation(status: string) {

  const value = status.toLowerCase();



  return ![

    "accepted",

    "approved",

    "won",

    "closed",

    "rejected",

    "cancelled",

    "canceled",

    "expired",

  ].includes(value);

}



function isValidWorkOrder(status: string) {

  const value = status.toLowerCase();



  return ![

    "cancelled",

    "canceled",

    "rejected",

    "void",

  ].includes(value);

}



function isReceivedPayment(status: string) {

  return [

    "received",

    "paid",

    "collected",

    "completed",

  ].includes(status.toLowerCase());

}



function Kpi({

  title,

  value,

  note,

  icon: Icon,

  tone,

}: {

  title: string;

  value: string | number;

  note: string;

  icon: ElementType;

  tone: string;

}) {

  return (

    <article className={`hyd-kpi hyd-kpi-${tone}`}>

      <span className="hyd-kpi-icon">

        <Icon size={21} />

      </span>



      <div>

        <p>{title}</p>

        <strong>{value}</strong>

        <span>{note}</span>

      </div>

    </article>

  );

}



export default async function AdminDashboardPage() {

  const [

    companies,

    locations,

    recurringServices,

    workOrders,

    payments,

    quotations,

    activities,

    leads,

    samples,

  ] = await Promise.all([

    getCompanies(),

    getLocations(),

    getRecurringServices(),

    getWorkOrders(),

    getPayments(),

    getQuotations(),

    getActivities(),

    getLeads(),

    getSamples(),

  ]);



  const companyMap = new Map(

    companies.map((company) => [

      company.id,

      company.name,

    ])

  );



  const activeLocations = locations.filter(

    (location) =>

      location.status.toLowerCase() === "active"

  );



  const activeRecurring = recurringServices.filter(

    (service) =>

      service.status.toLowerCase() === "active"

  );



  const recurringSamples = activeRecurring.reduce(

    (total, service) =>

      total +

      Number(service.samplesPerMonth || 0),

    0

  );



  const validOrders = workOrders.filter((order) =>

    isValidWorkOrder(order.status)

  );



  const businessValue = validOrders.reduce(

    (total, order) =>

      total + Number(order.totalAmount || 0),

    0

  );



  const receivedPayments = payments.filter((payment) =>

    isReceivedPayment(payment.status)

  );



  const collectedAmount = receivedPayments.reduce(

    (total, payment) =>

      total + Number(payment.amount || 0),

    0

  );



  const pendingAmount = Math.max(

    businessValue - collectedAmount,

    0

  );



  const collectionRate =

    businessValue > 0

      ? (collectedAmount / businessValue) * 100

      : 0;



  const openQuotations = quotations.filter(

    (quotation) =>

      isOpenQuotation(quotation.status)

  );



  const activeLeads = leads.filter((lead) =>

    isActiveStatus(lead.status)

  );



  const now = new Date();



  const monthSamples = samples.filter((sample) => {

    const date = new Date(sample.createdAt);



    return (

      date.getMonth() === now.getMonth() &&

      date.getFullYear() === now.getFullYear()

    );

  });



  const sampleMix = monthSamples.reduce(

    (result, sample) => {

      const type = sample.sampleType.toLowerCase();

      const count = Number(sample.sampleCount || 0);



      if (type.includes("water")) {

        result.water += count;

      } else if (

        type.includes("food") ||

        type.includes("meal")

      ) {

        result.food += count;

      } else if (type.includes("swab")) {

        result.swab += count;

      } else {

        result.other += count;

      }



      return result;

    },

    {

      water: 0,

      food: 0,

      swab: 0,

      other: 0,

    }

  );



  const monthSampleTotal =

    sampleMix.water +

    sampleMix.food +

    sampleMix.swab +

    sampleMix.other;



  const recentCompanies = companies.slice(0, 5);



  const recentQuotations =

    openQuotations.slice(0, 5);



  const recentActivities =

    activities.slice(0, 5);



  const followups = [

    ...leads

      .filter((lead) => lead.nextFollowUp)

      .map((lead) => ({

        id: `lead-${lead.id}`,

        title: lead.company || lead.name,

        subtitle: lead.service,

        date: lead.nextFollowUp!,

        href: `/admin/leads/${lead.id}`,

      })),



    ...activities

      .filter(

        (activity) => activity.nextFollowUp

      )

      .map((activity) => ({

        id: `activity-${activity.id}`,

        title:

          companyMap.get(activity.companyId) ||

          "Client",

        subtitle:

          activity.nextAction ||

          activity.title,

        date: activity.nextFollowUp!,

        href: `/admin/companies/${activity.companyId}`,

      })),



    ...quotations

      .filter(

        (quotation) =>

          quotation.nextFollowUp &&

          isOpenQuotation(

            quotation.status

          )

      )

      .map((quotation) => ({

        id: `quotation-${quotation.id}`,

        title:

          companyMap.get(quotation.companyId) ||

          "Client",

        subtitle: quotation.service,

        date: quotation.nextFollowUp!,

        href: `/admin/quotations/${quotation.id}`,

      })),

  ];



  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);



  const startOfTomorrow = new Date(startOfToday);

  startOfTomorrow.setDate(

    startOfTomorrow.getDate() + 1

  );



  const overdueFollowups = followups

    .filter(

      (followup) =>

        new Date(followup.date).getTime() <

        startOfToday.getTime()

    )

    .sort(

      (a, b) =>

        new Date(a.date).getTime() -

        new Date(b.date).getTime()

    );



  const todayFollowups = followups

    .filter((followup) => {

      const followupDate =

        new Date(followup.date).getTime();



      return (

        followupDate >= startOfToday.getTime() &&

        followupDate < startOfTomorrow.getTime()

      );

    })

    .sort(

      (a, b) =>

        new Date(a.date).getTime() -

        new Date(b.date).getTime()

    );



  const upcomingFollowups = followups

    .filter(

      (followup) =>

        new Date(followup.date).getTime() >=

        startOfTomorrow.getTime()

    )

    .sort(

      (a, b) =>

        new Date(a.date).getTime() -

        new Date(b.date).getTime()

    );



  const overdueCount = overdueFollowups.length;

  const todayCount = todayFollowups.length;

  const upcomingCount = upcomingFollowups.length;

  const activeLeadCount = activeLeads.length;



  const visibleFollowups = [

    ...overdueFollowups,

    ...todayFollowups,

    ...upcomingFollowups,

  ].slice(0, 5);



  return (

    <div className="hyd-dashboard">

      {/* TOP BAR */}



      <header className="hyd-topbar">

        <div className="hyd-top-search">

          <Search size={17} />

          <span>

            Hyderabad Operations Overview

          </span>

        </div>



        <div className="hyd-user">

          <div className="hyd-user-avatar">

            V

          </div>



          <div>

            <strong>Venkat</strong>

            <span>

              Hyderabad Operations

            </span>

          </div>

        </div>

      </header>



      {/* HERO */}



      <section className="hyd-hero">

        <div>

          <span className="hyd-eyebrow">

            NEXUS TEST LABS · HYDERABAD

          </span>



          <h1>

            Welcome back, Venkat 👋

          </h1>



          <h2>

            Hyderabad Operations Dashboard

          </h2>



          <p>

            Recurring operations, sales

            pipeline, collections, client

            activity and growth overview.

          </p>

        </div>



        <div className="hyd-hero-side">

          <MapPin size={22} />



          <div>

            <strong>

              Serving Hyderabad

            </strong>

            <span>

              Live CRM Operations

            </span>

          </div>

        </div>

      </section>



      {/* TODAY'S PRIORITIES */}



      <section className="hyd-priority-grid">

        <Kpi

          title="Overdue Follow-ups"

          value={overdueCount}

          note="Needs attention"

          icon={CalendarDays}

          tone="rose"

        />



        <Kpi

          title="Due Today"

          value={todayCount}

          note="Actions scheduled today"

          icon={Activity}

          tone="yellow"

        />



        <Kpi

          title="Upcoming"

          value={upcomingCount}

          note="Future follow-ups"

          icon={CalendarDays}

          tone="blue"

        />



        <Kpi

          title="Active Leads"

          value={activeLeadCount}

          note="Open sales opportunities"

          icon={Target}

          tone="green"

        />

      </section>



      {/* KPI */}



      <section className="hyd-kpi-grid">

        <Kpi

          title="Existing Customer Locations"

          value={activeLocations.length}

          note="Active recurring locations"

          icon={Building2}

          tone="blue"

        />



        <Kpi

          title="Recurring Samples / Month"

          value={recurringSamples}

          note="Active recurring services"

          icon={FlaskConical}

          tone="green"

        />



        <Kpi

          title="Orders Closed"

          value={validOrders.length}

          note={`${money(

            businessValue

          )} business value`}

          icon={CheckCircle2}

          tone="rose"

        />



        <Kpi

          title="Amount Collected"

          value={money(collectedAmount)}

          note={`${collectionRate.toFixed(

            1

          )}% collection rate`}

          icon={TrendingUp}

          tone="mint"

        />



        <Kpi

          title="Pending Amount"

          value={money(pendingAmount)}

          note="Against confirmed orders"

          icon={WalletCards}

          tone="yellow"

        />



        <Kpi

          title="Active Opportunities"

          value={openQuotations.length}

          note={`${activeLeads.length} active leads`}

          icon={Target}

          tone="purple"

        />

      </section>



      {/* OVERVIEW */}



      <section className="hyd-three-grid">

        <article className="hyd-panel">

          <div className="hyd-panel-head">

            <div>

              <span>

                Sample Operations

              </span>

              <h3>

                Monthly Sample Mix

              </h3>

            </div>



            <FlaskConical size={19} />

          </div>



          <div className="hyd-big-number">

            {monthSampleTotal}

          </div>



          <p className="hyd-muted">

            Samples recorded this month

          </p>



          <div className="hyd-stat-list">

            <div>

              <span>Water</span>

              <strong>

                {sampleMix.water}

              </strong>

            </div>



            <div>

              <span>Food</span>

              <strong>

                {sampleMix.food}

              </strong>

            </div>



            <div>

              <span>Swabs</span>

              <strong>

                {sampleMix.swab}

              </strong>

            </div>



            <div>

              <span>Other</span>

              <strong>

                {sampleMix.other}

              </strong>

            </div>

          </div>

        </article>



        <article className="hyd-panel">

          <div className="hyd-panel-head">

            <div>

              <span>

                Client Database

              </span>



              <h3>

                Client Overview

              </h3>

            </div>



            <Users size={19} />

          </div>



          <div className="hyd-big-number">

            {companies.length}

          </div>



          <p className="hyd-muted">

            Companies currently in CRM

          </p>



          <div className="hyd-stat-list">

            <div>

              <span>

                Active Locations

              </span>



              <strong>

                {activeLocations.length}

              </strong>

            </div>



            <div>

              <span>

                Active Leads

              </span>



              <strong>

                {activeLeads.length}

              </strong>

            </div>



            <div>

              <span>

                Open Quotations

              </span>



              <strong>

                {openQuotations.length}

              </strong>

            </div>



            <div>

              <span>

                Recurring Services

              </span>



              <strong>

                {activeRecurring.length}

              </strong>

            </div>

          </div>

        </article>



        <article className="hyd-panel">

          <div className="hyd-panel-head">

            <div>

              <span>

                Financial Position

              </span>



              <h3>

                Collection Status

              </h3>

            </div>



            <CircleDollarSign size={19} />

          </div>



          <div className="hyd-money-main">

            {money(businessValue)}

          </div>



          <p className="hyd-muted">

            Confirmed business value

          </p>



          <div className="hyd-finance-row">

            <div>

              <span>Collected</span>

              <strong>

                {money(collectedAmount)}

              </strong>

            </div>



            <div>

              <span>Pending</span>

              <strong>

                {money(pendingAmount)}

              </strong>

            </div>

          </div>

        </article>

      </section>



      {/* RECENT CONTENT */}



      <section className="hyd-content-grid">

        <article className="hyd-panel">

          <div className="hyd-section-title">

            <div>

              <Users size={18} />



              <div>

                <h3>

                  Recent Clients

                </h3>



                <span>

                  Latest company records

                </span>

              </div>

            </div>



            <Link href="/admin/companies">

              View All

              <ArrowRight size={14} />

            </Link>

          </div>



          <div className="hyd-list">

            {recentCompanies.length ? (

              recentCompanies.map(

                (company) => {

                  const companySamples =

                    samples

                      .filter(

                        (sample) =>

                          sample.companyId ===

                          company.id

                      )

                      .reduce(

                        (total, sample) =>

                          total +

                          Number(

                            sample.sampleCount ||

                              0

                          ),

                        0

                      );



                  return (

                    <Link

                      href={`/admin/companies/${company.id}`}

                      className="hyd-list-row"

                      key={company.id}

                    >

                      <div className="hyd-list-avatar">

                        {company.name

                          .charAt(0)

                          .toUpperCase()}

                      </div>



                      <div className="hyd-list-main">

                        <strong>

                          {company.name}

                        </strong>



                        <span>

                          {company.industry ||

                            "Industry not set"}

                        </span>

                      </div>



                      <div className="hyd-list-right">

                        <strong>

                          {companySamples}

                        </strong>



                        <span>

                          samples

                        </span>

                      </div>

                    </Link>

                  );

                }

              )

            ) : (

              <div className="hyd-empty">

                No client records yet.

              </div>

            )}

          </div>

        </article>



        <article className="hyd-panel">

          <div className="hyd-section-title">

            <div>

              <FileText size={18} />



              <div>

                <h3>

                  Active Quotations

                </h3>



                <span>

                  Current opportunities

                </span>

              </div>

            </div>



            <Link href="/admin/quotations">

              View All

              <ArrowRight size={14} />

            </Link>

          </div>



          <div className="hyd-list">

            {recentQuotations.length ? (

              recentQuotations.map(

                (quotation) => (

                  <Link

                    href={`/admin/quotations/${quotation.id}`}

                    className="hyd-list-row"

                    key={quotation.id}

                  >

                    <div className="hyd-list-avatar quote">

                      Q

                    </div>



                    <div className="hyd-list-main">

                      <strong>

                        {companyMap.get(

                          quotation.companyId

                        ) || "Client"}

                      </strong>



                      <span>

                        {quotation.service}

                      </span>

                    </div>



                    <div className="hyd-list-right">

                      <strong>

                        {money(

                          quotation.totalAmount

                        )}

                      </strong>



                      <span>

                        {quotation.status}

                      </span>

                    </div>

                  </Link>

                )

              )

            ) : (

              <div className="hyd-empty">

                No active quotations.

              </div>

            )}

          </div>

        </article>

      </section>



      <section className="hyd-content-grid">

        <article className="hyd-panel">

          <div className="hyd-section-title">

            <div>

              <Activity size={18} />



              <div>

                <h3>

                  Recent Activities

                </h3>



                <span>

                  CRM activity history

                </span>

              </div>

            </div>

          </div>



          <div className="hyd-list">

            {recentActivities.length ? (

              recentActivities.map(

                (activity) => (

                  <Link

                    href={`/admin/companies/${activity.companyId}`}

                    className="hyd-list-row"

                    key={activity.id}

                  >

                    <div className="hyd-activity-dot" />



                    <div className="hyd-list-main">

                      <strong>

                        {activity.title}

                      </strong>



                      <span>

                        {companyMap.get(

                          activity.companyId

                        ) || activity.type}

                      </span>

                    </div>



                    <div className="hyd-list-right">

                      <span>

                        {formatDate(

                          activity.activityDate

                        )}

                      </span>

                    </div>

                  </Link>

                )

              )

            ) : (

              <div className="hyd-empty">

                No recent activities.

              </div>

            )}

          </div>

        </article>



        <article className="hyd-panel">

          <div className="hyd-section-title">

            <div>

              <CalendarDays size={18} />



              <div>

                <h3>

                  Upcoming Follow-ups

                </h3>



                <span>

                  Next CRM actions

                </span>

              </div>

            </div>



            <Link href="/admin/follow-ups">

              View All

              <ArrowRight size={14} />

            </Link>

          </div>



          <div className="hyd-list">

            {visibleFollowups.length ? (

              visibleFollowups.map((followup) => (

                <Link

                  href={followup.href}

                  className="hyd-list-row"

                  key={followup.id}

                >

                  <div className="hyd-list-avatar follow">

                    <CalendarDays

                      size={15}

                    />

                  </div>



                  <div className="hyd-list-main">

                    <strong>

                      {followup.title}

                    </strong>



                    <span>

                      {followup.subtitle}

                    </span>

                  </div>



                  <div className="hyd-list-right">

                    <strong>

                      {formatDate(

                        followup.date

                      )}

                    </strong>

                  </div>

                </Link>

              ))

            ) : (

              <div className="hyd-empty">

                No follow-ups scheduled.

              </div>

            )}

          </div>

        </article>

      </section>



      <Next30DaysPlan />

      <footer className="hyd-footer">

        <span>

          © 2026 Nexus Test Labs Pvt. Ltd.

          · Hyderabad Operations

        </span>



        <strong>

          Testing for a Healthier Tomorrow

        </strong>

      </footer>

    </div>

  );

}