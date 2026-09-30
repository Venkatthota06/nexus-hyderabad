import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";

import {
  buildImportedSampleNumber,
  createImportNotes,
  getCollectionMonth,
  standardizeImportSampleRow,
  type ImportPreview,
} from "@/src/lib/identification-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function createImportNotification({
  sampleId,
  companyName,
  sampleNumber,
  sampleType,
  quantity,
}: {
  sampleId: string;
  companyName: string;
  sampleNumber: string;
  sampleType: string;
  quantity: number;
}) {
  try {
    await db.orm.public.Notification.create({
      type: "SAMPLE_CREATED",
      title: "Sample imported",
      message: `${companyName} - ${sampleNumber} - ${sampleType} - ${quantity} sample${quantity === 1 ? "" : "s"} - Collected`,
      entityType: "Sample",
      entityId: sampleId,
      actionUrl: `/admin/samples/${sampleId}`,
      isRead: false,
    });
  } catch (error) {
    // A notification must never make a successful sample import fail.
    console.error("Identification import notification error:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImportPreview;

    if (!body.companyId) {
      return NextResponse.json({ success: false, message: "Select a company before importing." }, { status: 400 });
    }

    if (!body.locationId) {
      return NextResponse.json({ success: false, message: "Select a location before importing." }, { status: 400 });
    }

    if (!body.collectionDate) {
      return NextResponse.json({ success: false, message: "Collection date is required." }, { status: 400 });
    }

    if (!body.collectedBy.trim()) {
      return NextResponse.json({ success: false, message: "Collected By is required." }, { status: 400 });
    }

    const collectionMonth = getCollectionMonth(body.collectionDate);
    if (!collectionMonth) {
      return NextResponse.json({ success: false, message: "Collection date is invalid." }, { status: 400 });
    }

    const validRows = body.samples
      .map(standardizeImportSampleRow)
      .filter(
        (row) =>
          row.sampleType.trim() &&
          Number.isFinite(Number(row.quantity)) &&
          Number(row.quantity) > 0,
      );

    if (validRows.length === 0) {
      return NextResponse.json({ success: false, message: "Add at least one valid sample." }, { status: 400 });
    }

    const company = await db.orm.public.Company.where({ id: body.companyId }).first();
    if (!company) {
      return NextResponse.json({ success: false, message: "Selected company was not found." }, { status: 404 });
    }

    const location = await db.orm.public.Location.where({ id: body.locationId }).first();
    if (!location) {
      return NextResponse.json({ success: false, message: "Selected location was not found." }, { status: 404 });
    }

    if (location.companyId !== company.id) {
      return NextResponse.json(
        { success: false, message: "The selected location does not belong to this company." },
        { status: 400 },
      );
    }

    const existingSamples = await db.orm.public.Sample.all();
    const existingSampleNumbers = new Set(existingSamples.map((sample) => sample.sampleNumber));

    const created: Array<{
      id: string;
      sampleNumber: string;
      sampleType: string;
      quantity: number;
    }> = [];

    const duplicates: Array<{ sampleNumber: string; sampleType: string }> = [];

    for (let index = 0; index < validRows.length; index += 1) {
      const row = validRows[index];
      const sampleNumber = buildImportedSampleNumber({
        fileFingerprint: body.fileFingerprint,
        rowIndex: index,
        labCode: row.labCode,
      });

      if (existingSampleNumbers.has(sampleNumber)) {
        duplicates.push({ sampleNumber, sampleType: row.sampleType });
        continue;
      }

      const createdSample = await db.orm.public.Sample.create({
        companyId: company.id,
        locationId: location.id,
        sampleNumber,
        sampleType: row.sampleType,
        sampleCount: row.quantity,
        collectionDate: new Date(`${body.collectionDate}T12:00:00`).toISOString(),
        collectionMonth,
        collectedBy: body.collectedBy.trim(),
        status: "Collected",
        reportStatus: "Pending",
        notes: createImportNotes({
          fileName: body.fileName,
          source: row.source,
          fileFingerprint: body.fileFingerprint,
        }),
      });

      existingSampleNumbers.add(sampleNumber);
      created.push({
        id: createdSample.id,
        sampleNumber,
        sampleType: createdSample.sampleType,
        quantity: createdSample.sampleCount,
      });

      await createImportNotification({
        sampleId: createdSample.id,
        companyName: company.name,
        sampleNumber,
        sampleType: createdSample.sampleType,
        quantity: createdSample.sampleCount,
      });
    }

    if (created.length === 0 && duplicates.length > 0) {
      return NextResponse.json({
        success: true,
        duplicateOnly: true,
        message: "This identification sheet has already been imported. No duplicate samples were created.",
        created,
        duplicates,
        collectionMonth,
      });
    }

    return NextResponse.json({
      success: true,
      duplicateOnly: false,
      message: `${created.length} sample record${created.length === 1 ? "" : "s"} imported successfully.`,
      created,
      duplicates,
      collectionMonth,
    });
  } catch (error) {
    console.error("Identification import confirmation error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to import the identification sheet." },
      { status: 500 },
    );
  }
}
