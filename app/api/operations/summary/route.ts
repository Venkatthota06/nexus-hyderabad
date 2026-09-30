import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Sample = {
  id: string;
  companyId: string;
  locationId: string | null;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  collectionDate: string | null;
  status: string;
  reportStatus: string;
  testingLocation: string | null;
  expectedCompletionDate: string | null;
  reportDeliveredDate: string | null;
};

type Company = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
};

type QueueItem = {
  id: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  companyName: string;
  locationName: string;
  status: string;
  reportStatus: string;
  testingLocation: string;
  collectionDate: string | null;
  expectedCompletionDate: string | null;
  daysUntilDue: number | null;
  daysOverdue: number | null;
};

function dayStart(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysFromToday(value: string, now: Date) {
  const target = dayStart(new Date(value));
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - dayStart(now).getTime()) / 86_400_000);
}

function normalized(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function isDelivered(sample: Sample) {
  return normalized(sample.reportStatus).includes("deliver");
}

function isReady(sample: Sample) {
  const value = normalized(sample.reportStatus);
  return value.includes("ready") || value.includes("approved");
}

function isPendingReport(sample: Sample) {
  return !isDelivered(sample);
}

function statusBucket(status: string) {
  const value = normalized(status);
  if (value === "planned") return "planned";
  if (value === "collected") return "collected";
  if (value === "dispatched") return "dispatched";
  if (value === "received at lab") return "receivedAtLab";
  if (value === "testing") return "testing";
  if (value === "completed") return "completed";
  if (value === "report delivered") return "reportDelivered";
  return "other";
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const [samplesRaw, companiesRaw, locationsRaw] = await Promise.all([
      db.orm.public.Sample.all(),
      db.orm.public.Company.all(),
      db.orm.public.Location.all(),
    ]);

    const samples = samplesRaw as Sample[];
    const companies = companiesRaw as Company[];
    const locations = locationsRaw as Location[];

    const companyMap = new Map(companies.map((company) => [company.id, company.name]));
    const locationMap = new Map(locations.map((location) => [location.id, location.name]));
    const now = new Date();

    const workflow = {
      planned: { records: 0, quantity: 0 },
      collected: { records: 0, quantity: 0 },
      dispatched: { records: 0, quantity: 0 },
      receivedAtLab: { records: 0, quantity: 0 },
      testing: { records: 0, quantity: 0 },
      completed: { records: 0, quantity: 0 },
      reportDelivered: { records: 0, quantity: 0 },
      other: { records: 0, quantity: 0 },
    };

    let physicalSamples = 0;
    let pendingReportRecords = 0;
    let pendingReportQuantity = 0;
    let deliveredRecords = 0;
    let deliveredQuantity = 0;
    let overdueRecords = 0;
    let overdueQuantity = 0;
    let dueSoonRecords = 0;
    let dueSoonQuantity = 0;
    let missingExpectedDateRecords = 0;
    let missingExpectedDateQuantity = 0;
    let missingTestingLocationRecords = 0;
    let readyToDeliverRecords = 0;
    let readyToDeliverQuantity = 0;

    const overdue: QueueItem[] = [];
    const dueSoon: QueueItem[] = [];
    const missingDueDate: QueueItem[] = [];
    const awaitingLab: QueueItem[] = [];
    const inTesting: QueueItem[] = [];
    const readyToDeliver: QueueItem[] = [];
    const missingTestingLocation: QueueItem[] = [];

    for (const sample of samples) {
      const quantity = Math.max(0, Number(sample.sampleCount || 0));
      physicalSamples += quantity;

      const bucket = statusBucket(sample.status) as keyof typeof workflow;
      workflow[bucket].records += 1;
      workflow[bucket].quantity += quantity;

      const days = sample.expectedCompletionDate
        ? daysFromToday(sample.expectedCompletionDate, now)
        : null;

      const item: QueueItem = {
        id: sample.id,
        sampleNumber: sample.sampleNumber,
        sampleType: sample.sampleType,
        sampleCount: quantity,
        companyName: companyMap.get(sample.companyId) || "Unknown Company",
        locationName: sample.locationId
          ? locationMap.get(sample.locationId) || "Unknown Location"
          : "No Location",
        status: sample.status,
        reportStatus: sample.reportStatus,
        testingLocation: sample.testingLocation || "",
        collectionDate: sample.collectionDate,
        expectedCompletionDate: sample.expectedCompletionDate,
        daysUntilDue: days !== null && days >= 0 ? days : null,
        daysOverdue: days !== null && days < 0 ? Math.abs(days) : null,
      };

      const delivered = isDelivered(sample);
      const ready = isReady(sample);
      const status = normalized(sample.status);

      if (delivered) {
        deliveredRecords += 1;
        deliveredQuantity += quantity;
      } else {
        pendingReportRecords += 1;
        pendingReportQuantity += quantity;
      }

      if (!delivered && ready) {
        readyToDeliverRecords += 1;
        readyToDeliverQuantity += quantity;
        readyToDeliver.push(item);
      }

      if (!delivered && status !== "planned") {
        if (!sample.expectedCompletionDate) {
          missingExpectedDateRecords += 1;
          missingExpectedDateQuantity += quantity;
          missingDueDate.push(item);
        } else if (days !== null && days < 0) {
          overdueRecords += 1;
          overdueQuantity += quantity;
          overdue.push(item);
        } else if (days !== null && days <= 2) {
          dueSoonRecords += 1;
          dueSoonQuantity += quantity;
          dueSoon.push(item);
        }
      }

      if (status === "collected" || status === "dispatched") {
        awaitingLab.push(item);
      }

      if (status === "testing") {
        inTesting.push(item);
      }

      if (
        !delivered &&
        ["received at lab", "testing", "completed"].includes(status) &&
        !sample.testingLocation?.trim()
      ) {
        missingTestingLocationRecords += 1;
        missingTestingLocation.push(item);
      }
    }

    overdue.sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0));
    dueSoon.sort((a, b) => (a.daysUntilDue ?? 9999) - (b.daysUntilDue ?? 9999));
    missingDueDate.sort((a, b) => a.companyName.localeCompare(b.companyName));
    readyToDeliver.sort((a, b) => a.companyName.localeCompare(b.companyName));
    awaitingLab.sort((a, b) => a.companyName.localeCompare(b.companyName));
    inTesting.sort((a, b) => (a.daysUntilDue ?? 9999) - (b.daysUntilDue ?? 9999));

    return NextResponse.json({
      success: true,
      generatedAt: now.toISOString(),
      totals: {
        records: samples.length,
        physicalSamples,
        pendingReports: pendingReportQuantity,
        pendingReportRecords,
        deliveredReports: deliveredQuantity,
        deliveredReportRecords: deliveredRecords,
        missingExpectedCompletionDate: missingExpectedDateRecords,
        missingExpectedCompletionQuantity: missingExpectedDateQuantity,
        missingTestingLocation: missingTestingLocationRecords,
        dueSoon: dueSoonQuantity,
        dueSoonRecords,
        overdue: overdueQuantity,
        overdueRecords,
        readyToDeliver: readyToDeliverQuantity,
        readyToDeliverRecords,
      },
      workflow,
      queues: {
        overdue: overdue.slice(0, 50),
        dueSoon: dueSoon.slice(0, 50),
        missingDueDate: missingDueDate.slice(0, 50),
        awaitingLab: awaitingLab.slice(0, 50),
        inTesting: inTesting.slice(0, 50),
        readyToDeliver: readyToDeliver.slice(0, 50),
        missingTestingLocation: missingTestingLocation.slice(0, 50),
      },
      // Keep these top-level queues for backwards compatibility with the first V3 UI.
      overdue: overdue.slice(0, 25),
      dueSoon: dueSoon.slice(0, 25),
    });
  } catch (error) {
    console.error("GET /api/operations/summary error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load operations summary." },
      { status: 500 },
    );
  }
}
