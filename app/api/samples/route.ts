import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const runtime = "nodejs";

type SampleRequestBody = {
  id?: string;
  companyId?: string;
  quotationId?: string;

  sampleNumber?: string;
  sampleType?: string;
  sampleCount?: number;

  collectionDate?: string;
  collectedBy?: string;

  status?: string;

  testingLocation?: string;
  expectedCompletionDate?: string;

  reportStatus?: string;
  reportDeliveredDate?: string;

  notes?: string;
};

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
          (sample) =>
            sample.createdAt.desc()
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
        message:
          "Unable to load samples.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
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

    const companyId =
      body.companyId?.trim() ?? "";

    const quotationId =
      body.quotationId?.trim() || null;

    const sampleNumber =
      body.sampleNumber?.trim() ?? "";

    const sampleType =
      body.sampleType?.trim() ?? "";

    const sampleCount =
      Number(
        body.sampleCount ?? 1
      );

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

    if (
      !Number.isFinite(
        sampleCount
      ) ||
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
        quotation.companyId !==
        companyId
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

    const sample =
      await db.orm.public.Sample.create(
        {
          companyId,
          quotationId,

          sampleNumber,
          sampleType,
          sampleCount,

          collectionDate:
            body.collectionDate?.trim() ||
            null,

          collectedBy:
            body.collectedBy?.trim() ||
            null,

          status:
            body.status?.trim() ||
            "Planned",

          testingLocation:
            body.testingLocation?.trim() ||
            null,

          expectedCompletionDate:
            body.expectedCompletionDate?.trim() ||
            null,

          reportStatus:
            body.reportStatus?.trim() ||
            "Pending",

          reportDeliveredDate:
            body.reportDeliveredDate?.trim() ||
            null,

          notes:
            body.notes?.trim() ||
            null,
        }
      );

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

export async function PUT(
  request: Request
) {
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
      body.id?.trim();

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

    const existingSample =
      await db.orm.public.Sample
        .where({ id })
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

    const companyId =
      body.companyId?.trim() ||
      existingSample.companyId;

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

    const quotationId =
      body.quotationId !==
      undefined
        ? body.quotationId.trim() ||
          null
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
        quotation.companyId !==
        companyId
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

    const sampleNumber =
      body.sampleNumber?.trim() ||
      existingSample.sampleNumber;

    const sampleType =
      body.sampleType?.trim() ||
      existingSample.sampleType;

    const sampleCount =
      body.sampleCount !== undefined
        ? Number(
            body.sampleCount
          )
        : existingSample.sampleCount;

    if (
      !Number.isFinite(
        sampleCount
      ) ||
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

    const collectionDate =
      body.collectionDate !==
      undefined
        ? body.collectionDate.trim() ||
          null
        : existingSample.collectionDate;

    const collectedBy =
      body.collectedBy !==
      undefined
        ? body.collectedBy.trim() ||
          null
        : existingSample.collectedBy;

    const status =
      body.status?.trim() ||
      existingSample.status;

    const testingLocation =
      body.testingLocation !==
      undefined
        ? body.testingLocation.trim() ||
          null
        : existingSample.testingLocation;

    const expectedCompletionDate =
      body.expectedCompletionDate !==
      undefined
        ? body.expectedCompletionDate.trim() ||
          null
        : existingSample.expectedCompletionDate;

    const reportStatus =
      body.reportStatus?.trim() ||
      existingSample.reportStatus;

    const reportDeliveredDate =
      body.reportDeliveredDate !==
      undefined
        ? body.reportDeliveredDate.trim() ||
          null
        : existingSample.reportDeliveredDate;

    const notes =
      body.notes !== undefined
        ? body.notes.trim() ||
          null
        : existingSample.notes;

    const updatedSample =
      await db.orm.public.Sample
        .where({ id })
        .update({
          companyId,
          quotationId,

          sampleNumber,
          sampleType,
          sampleCount,

          collectionDate,
          collectedBy,

          status,

          testingLocation,
          expectedCompletionDate,

          reportStatus,
          reportDeliveredDate,

          notes,
        });

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