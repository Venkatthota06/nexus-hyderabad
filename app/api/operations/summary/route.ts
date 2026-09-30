import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Sample = {
  id: string;
  companyId: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  status: string;
  reportStatus: string;
  expectedCompletionDate: string | null;
  reportDeliveredDate: string | null;
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

function isDelivered(sample: Sample) {
  return String(sample.reportStatus || "").toLowerCase().includes("deliver");
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
    const samples = (await db.orm.public.Sample.all()) as Sample[];
    const now = new Date();

    let overdueRecords = 0;
    let overdueQuantity = 0;
    let dueSoonRecords = 0;
    let dueSoonQuantity = 0;
    let pendingReportRecords = 0;
    let pendingReportQuantity = 0;
    let deliveredRecords = 0;
    let deliveredQuantity = 0;
    let missingExpectedDateRecords = 0;

    const overdue: Array<{
      id: string;
      sampleNumber: string;
      sampleType: string;
      sampleCount: number;
      expectedCompletionDate: string;
      daysOverdue: number;
    }> = [];

    const dueSoon: Array<{
      id: string;
      sampleNumber: string;
      sampleType: string;
      sampleCount: number;
      expectedCompletionDate: string;
      daysUntilDue: number;
    }> = [];

    for (const sample of samples) {
      const quantity = Number(sample.sampleCount || 0);

      if (isDelivered(sample)) {
        deliveredRecords += 1;
        deliveredQuantity += quantity;
        continue;
      }

      pendingReportRecords += 1;
      pendingReportQuantity += quantity;

      if (!sample.expectedCompletionDate) {
        missingExpectedDateRecords += 1;
        continue;
      }

      const days = daysFromToday(sample.expectedCompletionDate, now);
      if (days === null) continue;

      if (days < 0) {
        overdueRecords += 1;
        overdueQuantity += quantity;
        overdue.push({
          id: sample.id,
          sampleNumber: sample.sampleNumber,
          sampleType: sample.sampleType,
          sampleCount: quantity,
          expectedCompletionDate: sample.expectedCompletionDate,
          daysOverdue: Math.abs(days),
        });
      } else if (days <= 2) {
        dueSoonRecords += 1;
        dueSoonQuantity += quantity;
        dueSoon.push({
          id: sample.id,
          sampleNumber: sample.sampleNumber,
          sampleType: sample.sampleType,
          sampleCount: quantity,
          expectedCompletionDate: sample.expectedCompletionDate,
          daysUntilDue: days,
        });
      }
    }

    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
    dueSoon.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return NextResponse.json({
      success: true,
      generatedAt: now.toISOString(),
      totals: {
        sampleRecords: samples.length,
        physicalSamples: samples.reduce(
          (sum, sample) => sum + Number(sample.sampleCount || 0),
          0,
        ),
      },
      reports: {
        pendingRecords: pendingReportRecords,
        pendingQuantity: pendingReportQuantity,
        deliveredRecords,
        deliveredQuantity,
        missingExpectedDateRecords,
      },
      due: {
        overdueRecords,
        overdueQuantity,
        dueSoonRecords,
        dueSoonQuantity,
      },
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
