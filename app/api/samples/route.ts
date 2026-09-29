import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

type SampleRequestBody = {
  id?: string;
  companyId?: string;
  locationId?: string;
  quotationId?: string;

  sampleNumber?: string;
  sampleType?: string;
  sampleCount?: number;

  collectionDate?: string;
  collectionMonth?: string;
  collectedBy?: string;

  status?: string;

  testingLocation?: string;
  expectedCompletionDate?: string;

  reportStatus?: string;
  reportDeliveredDate?: string;

  notes?: string;
};

/* =========================================================
   ALLOWED WORKFLOW VALUES
========================================================= */

const SAMPLE_STATUSES = [
  "Planned",
  "Collected",
  "Dispatched",
  "Received at Lab",
  "Testing",
  "Completed",
  "Report Delivered",
] as const;

const REPORT_STATUSES = [
  "Pending",
  "Partial Report",
  "Ready",
  "Delivered",
] as const;

/* =========================================================
   HELPERS
========================================================= */

function isValidSampleStatus(value: string) {
  return SAMPLE_STATUSES.includes(
    value as (typeof SAMPLE_STATUSES)[number]
  );
}

function isValidReportStatus(value: string) {
  return REPORT_STATUSES.includes(
    value as (typeof REPORT_STATUSES)[number]
  );
}

/*
 * Returns YYYY-MM.
 *
 * If collectionMonth is explicitly supplied, it is used.
 * Otherwise, collectionDate is used to derive the month.
 *
 * Examples:
 * 2026-09 -> 2026-09
 * 2026-09-03 -> 2026-09
 */
function normalizeCollectionMonth(
  collectionMonth?: string | null,
  collectionDate?: string | null
) {
  const explicitMonth =
    typeof collectionMonth === "string"
      ? collectionMonth.trim()
      : "";

  if (explicitMonth) {
    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(
        explicitMonth
      )
    ) {
      return {
        valid: false as const,
        value: null,
      };
    }

    return {
      valid: true as const,
      value: explicitMonth,
    };
  }

  const date =
    typeof collectionDate === "string"
      ? collectionDate.trim()
      : "";

  if (date) {
    const match = date.match(
      /^(\d{4})-(0[1-9]|1[0-2])/
    );

    if (match) {
      return {
        valid: true as const,
        value: `${match[1]}-${match[2]}`,
      };
    }
  }

  return {
    valid: true as const,
    value: null,
  };
}

/* =========================================================
   NOTIFICATION HELPER
========================================================= */

async function createSampleNotification({
  sampleId,
  companyName,
  sampleNumber,
  sampleType,
  sampleCount,
  status,
  type,
  title,
}: {
  sampleId: string;
  companyName: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  status: string;
  type:
    | "SAMPLE_CREATED"
    | "SAMPLE_STATUS_CHANGED";
  title: string;
}) {
  try {
    await db.orm.public.Notification.create({
      type,
      title,
      message:
        `${companyName} - ${sampleNumber} - ` +
        `${sampleType} - ${sampleCount} sample${
          sampleCount === 1 ? "" : "s"
        } - ${status}`,
      entityType: "Sample",
      entityId: sampleId,
      actionUrl: `/admin/samples/${sampleId}`,
      isRead: false,
    });
  } catch (error) {
    /*
     * Notification failure must never cause the
     * sample operation itself to fail.
     */
    console.error(
      "Sample notification creation error:",
      error
    );
  }
}

/* =========================================================
   GET
========================================================= */

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const samples =
      await db.orm.public.Sample
        .orderBy(
          (sample) => sample.createdAt.desc()
        )
        .all();

    return NextResponse.json(samples);
  } catch (error) {
    console.error(
      "GET /api/samples error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load samples.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body: SampleRequestBody =
      await request.json();

    /* =====================================================
       BASIC VALUES
    ===================================================== */

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const locationId =
      typeof body.locationId === "string" &&
      body.locationId.trim()
        ? body.locationId.trim()
        : null;

    const quotationId =
      typeof body.quotationId === "string" &&
      body.quotationId.trim()
        ? body.quotationId.trim()
        : null;

    const sampleNumber =
      typeof body.sampleNumber === "string"
        ? body.sampleNumber.trim()
        : "";

    const sampleType =
      typeof body.sampleType === "string"
        ? body.sampleType.trim()
        : "";

    const sampleCount = Number(
      body.sampleCount ?? 1
    );

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    if (
      !companyId ||
      !sampleNumber ||
      !sampleType
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Company, sample number and sample type are required.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       SAMPLE COUNT VALIDATION
    ===================================================== */

    if (
      !Number.isFinite(sampleCount) ||
      sampleCount < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sample count must be at least 1.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       DUPLICATE SAMPLE NUMBER CHECK
    ===================================================== */

    const duplicateSample =
      await db.orm.public.Sample
        .where({
          sampleNumber,
        })
        .first();

    if (duplicateSample) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This sample number already exists. Please use a unique sample reference.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       COMPANY VALIDATION
    ===================================================== */

    const company =
      await db.orm.public.Company
        .where({
          id: companyId,
        })
        .first();

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected company was not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       LOCATION VALIDATION
    ===================================================== */

    if (locationId) {
      const location =
        await db.orm.public.Location
          .where({
            id: locationId,
          })
          .first();

      if (!location) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected location was not found.",
          },
          { status: 404 }
        );
      }

      if (
        location.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected location does not belong to the selected company.",
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       QUOTATION VALIDATION
    ===================================================== */

    if (quotationId) {
      const quotation =
        await db.orm.public.Quotation
          .where({
            id: quotationId,
          })
          .first();

      if (!quotation) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected quotation was not found.",
          },
          { status: 404 }
        );
      }

      if (
        quotation.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected quotation does not belong to the selected company.",
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       STATUS VALIDATION
    ===================================================== */

    let status =
      typeof body.status === "string" &&
      body.status.trim()
        ? body.status.trim()
        : "Planned";

    const reportStatus =
      typeof body.reportStatus === "string" &&
      body.reportStatus.trim()
        ? body.reportStatus.trim()
        : "Pending";

    if (!isValidSampleStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sample status.",
        },
        { status: 400 }
      );
    }

    if (
      !isValidReportStatus(reportStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report status.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       REPORT CONSISTENCY
    ===================================================== */

    let reportDeliveredDate =
      typeof body.reportDeliveredDate ===
        "string" &&
      body.reportDeliveredDate.trim()
        ? body.reportDeliveredDate.trim()
        : null;

    if (reportStatus !== "Delivered") {
      reportDeliveredDate = null;
    }

    if (reportStatus === "Delivered") {
      status = "Report Delivered";
    }

    /* =====================================================
       COLLECTION DETAILS
    ===================================================== */

    const collectionDate =
      typeof body.collectionDate ===
        "string" &&
      body.collectionDate.trim()
        ? body.collectionDate.trim()
        : null;

    const normalizedCollectionMonth =
      normalizeCollectionMonth(
        body.collectionMonth,
        collectionDate
      );

    if (!normalizedCollectionMonth.valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Collection month must use YYYY-MM format.",
        },
        { status: 400 }
      );
    }

    const collectionMonth =
      normalizedCollectionMonth.value;

    const collectedBy =
      typeof body.collectedBy === "string" &&
      body.collectedBy.trim()
        ? body.collectedBy.trim()
        : null;

    /* =====================================================
       CREATE SAMPLE
    ===================================================== */

    const sample =
      await db.orm.public.Sample.create({
        companyId,
        locationId,
        quotationId,

        sampleNumber,
        sampleType,
        sampleCount,

        collectionDate,
        collectionMonth,
        collectedBy,

        status,

        testingLocation:
          typeof body.testingLocation ===
            "string" &&
          body.testingLocation.trim()
            ? body.testingLocation.trim()
            : null,

        expectedCompletionDate:
          typeof body.expectedCompletionDate ===
            "string" &&
          body.expectedCompletionDate.trim()
            ? body.expectedCompletionDate.trim()
            : null,

        reportStatus,
        reportDeliveredDate,

        notes:
          typeof body.notes === "string" &&
          body.notes.trim()
            ? body.notes.trim()
            : null,
      });

    /* =====================================================
       CREATE NOTIFICATION
    ===================================================== */

    await createSampleNotification({
      sampleId: sample.id,
      companyName: company.name,
      sampleNumber,
      sampleType,
      sampleCount,
      status,
      type: "SAMPLE_CREATED",
      title: "Sample created",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Sample created successfully.",
        sample,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/samples error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create sample.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT
========================================================= */

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body: SampleRequestBody =
      await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    /* =====================================================
       SAMPLE ID VALIDATION
    ===================================================== */

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sample ID is required.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       EXISTING SAMPLE
    ===================================================== */

    const existingSample =
      await db.orm.public.Sample
        .where({
          id,
        })
        .first();

    if (!existingSample) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sample not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       COMPANY
    ===================================================== */

    const companyId =
      typeof body.companyId === "string" &&
      body.companyId.trim()
        ? body.companyId.trim()
        : existingSample.companyId;

    const company =
      await db.orm.public.Company
        .where({
          id: companyId,
        })
        .first();

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected company was not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       QUOTATION
    ===================================================== */

    const quotationId =
      body.quotationId !== undefined
        ? typeof body.quotationId ===
              "string" &&
          body.quotationId.trim()
          ? body.quotationId.trim()
          : null
        : existingSample.quotationId;

    if (quotationId) {
      const quotation =
        await db.orm.public.Quotation
          .where({
            id: quotationId,
          })
          .first();

      if (!quotation) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected quotation was not found.",
          },
          { status: 404 }
        );
      }

      if (
        quotation.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected quotation does not belong to the selected company.",
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       LOCATION
    ===================================================== */

    const locationId =
      body.locationId !== undefined
        ? typeof body.locationId ===
              "string" &&
          body.locationId.trim()
          ? body.locationId.trim()
          : null
        : existingSample.locationId;

    if (locationId) {
      const location =
        await db.orm.public.Location
          .where({
            id: locationId,
          })
          .first();

      if (!location) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected location was not found.",
          },
          { status: 404 }
        );
      }

      if (
        location.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected location does not belong to the selected company.",
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       SAMPLE NUMBER
    ===================================================== */

    const sampleNumber =
      typeof body.sampleNumber === "string" &&
      body.sampleNumber.trim()
        ? body.sampleNumber.trim()
        : existingSample.sampleNumber;

    if (
      sampleNumber !==
      existingSample.sampleNumber
    ) {
      const duplicateSample =
        await db.orm.public.Sample
          .where({
            sampleNumber,
          })
          .first();

      if (
        duplicateSample &&
        duplicateSample.id !== id
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This sample number already exists. Please use a unique sample reference.",
          },
          { status: 409 }
        );
      }
    }

    /* =====================================================
       SAMPLE TYPE
    ===================================================== */

    const sampleType =
      typeof body.sampleType === "string" &&
      body.sampleType.trim()
        ? body.sampleType.trim()
        : existingSample.sampleType;

    /* =====================================================
       SAMPLE COUNT
    ===================================================== */

    const sampleCount =
      body.sampleCount !== undefined
        ? Number(body.sampleCount)
        : existingSample.sampleCount;

    if (
      !Number.isFinite(sampleCount) ||
      sampleCount < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sample count must be at least 1.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       COLLECTION DETAILS
    ===================================================== */

    const collectionDate =
      body.collectionDate !== undefined
        ? typeof body.collectionDate ===
              "string" &&
          body.collectionDate.trim()
          ? body.collectionDate.trim()
          : null
        : existingSample.collectionDate;

    /*
     * If collectionMonth is explicitly supplied,
     * validate and use it.
     *
     * If collectionDate was changed but month was
     * not supplied, derive YYYY-MM from the date.
     *
     * If neither field changed, preserve the
     * existing collectionMonth.
     */
    let collectionMonth: string | null;

    if (
      body.collectionMonth !== undefined
    ) {
      const normalized =
        normalizeCollectionMonth(
          body.collectionMonth,
          collectionDate
        );

      if (!normalized.valid) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Collection month must use YYYY-MM format.",
          },
          { status: 400 }
        );
      }

      collectionMonth = normalized.value;
    } else if (
      body.collectionDate !== undefined
    ) {
      const normalized =
        normalizeCollectionMonth(
          null,
          collectionDate
        );

      collectionMonth = normalized.value;
    } else {
      collectionMonth =
        existingSample.collectionMonth;
    }

    const collectedBy =
      body.collectedBy !== undefined
        ? typeof body.collectedBy ===
              "string" &&
          body.collectedBy.trim()
          ? body.collectedBy.trim()
          : null
        : existingSample.collectedBy;

    /* =====================================================
       SAMPLE STATUS
    ===================================================== */

    let status =
      typeof body.status === "string" &&
      body.status.trim()
        ? body.status.trim()
        : existingSample.status;

    if (!isValidSampleStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid sample status.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       TESTING DETAILS
    ===================================================== */

    const testingLocation =
      body.testingLocation !== undefined
        ? typeof body.testingLocation ===
              "string" &&
          body.testingLocation.trim()
          ? body.testingLocation.trim()
          : null
        : existingSample.testingLocation;

    const expectedCompletionDate =
      body.expectedCompletionDate !==
      undefined
        ? typeof body.expectedCompletionDate ===
              "string" &&
          body.expectedCompletionDate.trim()
          ? body.expectedCompletionDate.trim()
          : null
        : existingSample
            .expectedCompletionDate;

    /* =====================================================
       REPORT STATUS
    ===================================================== */

    const reportStatus =
      typeof body.reportStatus === "string" &&
      body.reportStatus.trim()
        ? body.reportStatus.trim()
        : existingSample.reportStatus;

    if (
      !isValidReportStatus(reportStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid report status.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       REPORT DELIVERY
    ===================================================== */

    let reportDeliveredDate =
      body.reportDeliveredDate !== undefined
        ? typeof body.reportDeliveredDate ===
              "string" &&
          body.reportDeliveredDate.trim()
          ? body.reportDeliveredDate.trim()
          : null
        : existingSample.reportDeliveredDate;

    if (reportStatus !== "Delivered") {
      reportDeliveredDate = null;
    }

    if (reportStatus === "Delivered") {
      status = "Report Delivered";
    }

    /* =====================================================
       NOTES
    ===================================================== */

    const notes =
      body.notes !== undefined
        ? typeof body.notes === "string" &&
          body.notes.trim()
          ? body.notes.trim()
          : null
        : existingSample.notes;

    /*
     * Capture whether the actual sample workflow status
     * changed before performing the update.
     */
    const statusChanged =
      existingSample.status !== status;

    /* =====================================================
       UPDATE SAMPLE
    ===================================================== */

    const updatedSample =
      await db.orm.public.Sample
        .where({
          id,
        })
        .update({
          companyId,
          locationId,
          quotationId,

          sampleNumber,
          sampleType,
          sampleCount,

          collectionDate,
          collectionMonth,
          collectedBy,

          status,

          testingLocation,
          expectedCompletionDate,

          reportStatus,
          reportDeliveredDate,

          notes,
        });

    /* =====================================================
       STATUS CHANGE NOTIFICATION
    ===================================================== */

    if (statusChanged) {
      await createSampleNotification({
        sampleId: id,
        companyName: company.name,
        sampleNumber,
        sampleType,
        sampleCount,
        status,
        type: "SAMPLE_STATUS_CHANGED",
        title: `Sample status: ${status}`,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Sample updated successfully.",
      sample: updatedSample,
    });
  } catch (error) {
    console.error(
      "PUT /api/samples error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update sample.",
      },
      { status: 500 }
    );
  }
}