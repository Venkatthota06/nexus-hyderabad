import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function text(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function amount(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function dateValue(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function inMonth(value: unknown, start: Date, end: Date) {
  const date = dateValue(value);
  return Boolean(date && date >= start && date < end);
}

function activeRecurring(service: any, end: Date) {
  if (text(service.status) !== "active") return false;
  const startDate = dateValue(service.startDate);
  const endDate = dateValue(service.endDate);
  return (!startDate || startDate < end) && (!endDate || endDate >= new Date(end.getFullYear(), end.getMonth() - 1, 1));
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const monthParam = url.searchParams.get("month");
    const parsed = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? new Date(`${monthParam}-01T00:00:00`)
      : new Date();
    const monthStart = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    const monthEnd = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 1);

    const [samples, companies, locations, recurring, workOrders, payments, reports, quotations] = await Promise.all([
      db.orm.public.Sample.all(),
      db.orm.public.Company.all(),
      db.orm.public.Location.all(),
      db.orm.public.RecurringService.all(),
      db.orm.public.WorkOrder.all(),
      db.orm.public.Payment.all(),
      db.orm.public.Report.all(),
      db.orm.public.Quotation.all(),
    ]);

    const companyMap = new Map(companies.map((row: any) => [row.id, row.name]));
    const locationMap = new Map(locations.map((row: any) => [row.id, row.name]));
    const recurringRows = recurring.filter((row: any) => activeRecurring(row, monthEnd));
    const recurringTarget = recurringRows.reduce((sum: number, row: any) => sum + amount(row.samplesPerMonth), 0);

    const monthSamples = samples.filter((row: any) => inMonth(row.collectionDate, monthStart, monthEnd));
    const collectedQuantity = monthSamples.reduce((sum: number, row: any) => sum + amount(row.sampleCount), 0);

    const recurringByKey = new Map<string, number>();
    for (const row of recurringRows as any[]) {
      const key = `${row.companyId}|${row.locationId || ""}|${text(row.sampleType)}`;
      recurringByKey.set(key, (recurringByKey.get(key) || 0) + amount(row.samplesPerMonth));
    }

    const recurringCollectedByKey = new Map<string, number>();
    let recurringCollected = 0;
    let oneTimeSamples = 0;
    for (const sample of monthSamples as any[]) {
      const key = `${sample.companyId}|${sample.locationId || ""}|${text(sample.sampleType)}`;
      const target = recurringByKey.get(key) || 0;
      const used = recurringCollectedByKey.get(key) || 0;
      const qty = amount(sample.sampleCount);
      const recurringQty = Math.min(qty, Math.max(0, target - used));
      recurringCollected += recurringQty;
      oneTimeSamples += qty - recurringQty;
      recurringCollectedByKey.set(key, used + recurringQty);
    }

    const recurringProgress = recurringRows.map((row: any) => {
      const key = `${row.companyId}|${row.locationId || ""}|${text(row.sampleType)}`;
      const target = amount(row.samplesPerMonth);
      const collected = Math.min(target, recurringCollectedByKey.get(key) || 0);
      return {
        id: row.id,
        companyName: companyMap.get(row.companyId) || "Unknown Company",
        locationName: row.locationId ? locationMap.get(row.locationId) || "Unknown Location" : "No Location",
        service: row.service,
        sampleType: row.sampleType,
        target,
        collected,
        remaining: Math.max(0, target - collected),
        completionPercent: target ? Math.min(100, Math.round((collected / target) * 100)) : 0,
      };
    });

    const sampleMix: Record<string, number> = {};
    for (const row of monthSamples as any[]) {
      const key = row.sampleType || "Other";
      sampleMix[key] = (sampleMix[key] || 0) + amount(row.sampleCount);
    }

    const monthOrders = workOrders.filter((row: any) => inMonth(row.confirmedDate, monthStart, monthEnd));
    const orderValue = monthOrders.reduce((sum: number, row: any) => sum + amount(row.totalAmount), 0);
    const receivedStatuses = new Set(["received", "paid", "collected", "completed"]);
    const receivedPayments = payments.filter((row: any) => receivedStatuses.has(text(row.status)));
    const monthPayments = receivedPayments.filter((row: any) => inMonth(row.paymentDate, monthStart, monthEnd));
    const paymentsReceived = monthPayments.reduce((sum: number, row: any) => sum + amount(row.amount), 0);

    const paymentByOrder = new Map<string, number>();
    for (const payment of receivedPayments as any[]) {
      if (payment.workOrderId) paymentByOrder.set(payment.workOrderId, (paymentByOrder.get(payment.workOrderId) || 0) + amount(payment.amount));
    }
    const pendingPayments = (workOrders as any[]).map((order) => ({
      id: order.id,
      workOrderNumber: order.workOrderNumber,
      companyName: companyMap.get(order.companyId) || "Unknown Company",
      totalAmount: amount(order.totalAmount),
      receivedAmount: paymentByOrder.get(order.id) || 0,
      pendingAmount: Math.max(0, amount(order.totalAmount) - (paymentByOrder.get(order.id) || 0)),
    })).filter((row) => row.pendingAmount > 0.01);

    const duplicateNumbers = new Map<string, any[]>();
    for (const sample of samples as any[]) {
      const key = text(sample.sampleNumber);
      if (!key) continue;
      duplicateNumbers.set(key, [...(duplicateNumbers.get(key) || []), sample]);
    }

    const dataQuality = {
      missingExpectedDate: (samples as any[]).filter((row) => text(row.status) !== "planned" && !text(row.reportStatus).includes("deliver") && !row.expectedCompletionDate).length,
      missingTestingLocation: (samples as any[]).filter((row) => ["received at lab", "testing", "completed"].includes(text(row.status)) && !String(row.testingLocation || "").trim()).length,
      deliveredWithoutDate: (samples as any[]).filter((row) => text(row.reportStatus).includes("deliver") && !row.reportDeliveredDate).length,
      duplicateSampleNumbers: [...duplicateNumbers.values()].filter((rows) => rows.length > 1).length,
      ordersWithoutQuotation: (workOrders as any[]).filter((row) => !row.quotationId).length,
      paymentsWithoutReference: (payments as any[]).filter((row) => !row.workOrderId && !row.quotationId).length,
      recurringWithoutLocation: (recurringRows as any[]).filter((row) => !row.locationId).length,
      invalidSampleQuantity: (samples as any[]).filter((row) => amount(row.sampleCount) <= 0).length,
    };

    const reportReady = (samples as any[]).filter((row) => ["ready", "approved"].some((status) => text(row.reportStatus).includes(status)) && !text(row.reportStatus).includes("deliver")).length;
    const reportDelivered = (samples as any[]).filter((row) => text(row.reportStatus).includes("deliver")).length;
    const testingPending = (samples as any[]).filter((row) => ["received at lab", "testing"].includes(text(row.status))).length;
    const reportsPending = (samples as any[]).filter((row) => text(row.status) !== "planned" && !text(row.reportStatus).includes("deliver")).length;

    return NextResponse.json({
      success: true,
      month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      generatedAt: new Date().toISOString(),
      monthly: {
        recurringTarget,
        recurringCollected,
        recurringRemaining: Math.max(0, recurringTarget - recurringCollected),
        recurringCompletionPercent: recurringTarget ? Math.min(100, Math.round((recurringCollected / recurringTarget) * 100)) : 0,
        oneTimeSamples,
        totalCollected: collectedQuantity,
        testingPending,
        reportsPending,
        reportsReady: reportReady,
        reportsDelivered: reportDelivered,
        ordersReceived: monthOrders.length,
        orderValue,
        paymentsReceived,
        pendingPaymentValue: pendingPayments.reduce((sum, row) => sum + row.pendingAmount, 0),
      },
      sampleMix,
      recurringProgress,
      pendingPayments: pendingPayments.sort((a, b) => b.pendingAmount - a.pendingAmount).slice(0, 50),
      dataQuality,
      counts: { companies: companies.length, quotations: quotations.length, reports: reports.length },
    });
  } catch (error) {
    console.error("GET /api/business/summary error:", error);
    return NextResponse.json({ success: false, message: "Unable to load business summary." }, { status: 500 });
  }
}
