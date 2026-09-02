import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   GET REPORTS
========================================================= */

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const reports =
      await db.orm.public.Report
        .orderBy(
          (report) =>
            report.createdAt.desc()
        )
        .all();

    return NextResponse.json(
      reports
    );
  } catch (error) {
    console.error(
      "GET reports error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load reports.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE REPORT
========================================================= */

export async function POST(
  request: Request
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await request.json();

    const companyId =
      typeof body.companyId ===
        "string"
        ? body.companyId.trim()
        : "";

    const sampleId =
      typeof body.sampleId ===
        "string"
        ? body.sampleId.trim()
        : "";

    const reportNumber =
      typeof body.reportNumber ===
        "string"
        ? body.reportNumber.trim()
        : "";

    if (!companyId) {
      return NextResponse.json(
        {
          error:
            "Company is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!sampleId) {
      return NextResponse.json(
        {
          error:
            "Sample is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!reportNumber) {
      return NextResponse.json(
        {
          error:
            "Report number is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       VERIFY COMPANY
    ----------------------------------------------------- */

    const company =
      await db.orm.public.Company
        .where({
          id: companyId,
        })
        .first();

    if (!company) {
      return NextResponse.json(
        {
          error:
            "Selected company was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------------------------------
       VERIFY SAMPLE
    ----------------------------------------------------- */

    const sample =
      await db.orm.public.Sample
        .where({
          id: sampleId,
        })
        .first();

    if (!sample) {
      return NextResponse.json(
        {
          error:
            "Selected sample was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      sample.companyId !==
      companyId
    ) {
      return NextResponse.json(
        {
          error:
            "Selected sample does not belong to the selected company.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

    const report =
      await db.orm.public.Report.create(
        {
          companyId,
          sampleId,
          reportNumber,

          reportType:
            typeof body.reportType ===
              "string" &&
            body.reportType.trim()
              ? body.reportType.trim()
              : "Final Report",

          reportDate:
            body.reportDate ||
            null,

          status:
            typeof body.status ===
              "string" &&
            body.status.trim()
              ? body.status.trim()
              : "Pending",

          deliveredDate:
            body.deliveredDate ||
            null,

          deliveryMethod:
            typeof body.deliveryMethod ===
              "string" &&
            body.deliveryMethod.trim()
              ? body.deliveryMethod.trim()
              : null,

          fileReference:
            typeof body.fileReference ===
              "string" &&
            body.fileReference.trim()
              ? body.fileReference.trim()
              : null,

          notes:
            typeof body.notes ===
              "string" &&
            body.notes.trim()
              ? body.notes.trim()
              : null,
        }
      );

    return NextResponse.json(
      report,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST report error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create report.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE REPORT
========================================================= */

export async function PUT(
  request: Request
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Report ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingReport =
      await db.orm.public.Report
        .where({
          id,
        })
        .first();

    if (!existingReport) {
      return NextResponse.json(
        {
          error:
            "Report not found.",
        },
        {
          status: 404,
        }
      );
    }

    const companyId =
      typeof body.companyId ===
        "string"
        ? body.companyId.trim()
        : existingReport.companyId;

    const sampleId =
      typeof body.sampleId ===
        "string"
        ? body.sampleId.trim()
        : existingReport.sampleId;

    const reportNumber =
      typeof body.reportNumber ===
        "string"
        ? body.reportNumber.trim()
        : existingReport.reportNumber;

    if (!companyId) {
      return NextResponse.json(
        {
          error:
            "Company is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!sampleId) {
      return NextResponse.json(
        {
          error:
            "Sample is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!reportNumber) {
      return NextResponse.json(
        {
          error:
            "Report number is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       VERIFY COMPANY
    ----------------------------------------------------- */

    const company =
      await db.orm.public.Company
        .where({
          id: companyId,
        })
        .first();

    if (!company) {
      return NextResponse.json(
        {
          error:
            "Selected company was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------------------------------
       VERIFY SAMPLE
    ----------------------------------------------------- */

    const sample =
      await db.orm.public.Sample
        .where({
          id: sampleId,
        })
        .first();

    if (!sample) {
      return NextResponse.json(
        {
          error:
            "Selected sample was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      sample.companyId !==
      companyId
    ) {
      return NextResponse.json(
        {
          error:
            "Selected sample does not belong to the selected company.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    const report =
      await db.orm.public.Report
        .where({
          id,
        })
        .update({
          companyId,
          sampleId,
          reportNumber,

          reportType:
            typeof body.reportType ===
              "string"
              ? body.reportType.trim() ||
                existingReport.reportType
              : existingReport.reportType,

          reportDate:
            body.reportDate !==
            undefined
              ? body.reportDate ||
                null
              : existingReport.reportDate,

          status:
            typeof body.status ===
              "string"
              ? body.status.trim() ||
                existingReport.status
              : existingReport.status,

          deliveredDate:
            body.deliveredDate !==
            undefined
              ? body.deliveredDate ||
                null
              : existingReport.deliveredDate,

          deliveryMethod:
            body.deliveryMethod !==
            undefined
              ? typeof body.deliveryMethod ===
                  "string" &&
                body.deliveryMethod.trim()
                ? body.deliveryMethod.trim()
                : null
              : existingReport.deliveryMethod,

          fileReference:
            body.fileReference !==
            undefined
              ? typeof body.fileReference ===
                  "string" &&
                body.fileReference.trim()
                ? body.fileReference.trim()
                : null
              : existingReport.fileReference,

          notes:
            body.notes !== undefined
              ? typeof body.notes ===
                  "string" &&
                body.notes.trim()
                ? body.notes.trim()
                : null
              : existingReport.notes,
        });

    return NextResponse.json(
      report
    );
  } catch (error) {
    console.error(
      "PUT report error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update report.",
      },
      {
        status: 500,
      }
    );
  }
}