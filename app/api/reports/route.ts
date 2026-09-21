import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

const REPORT_STATUSES = [
  "Pending",
  "Under Preparation",
  "Ready",
  "Delivered",
] as const;

type ReportStatus =
  (typeof REPORT_STATUSES)[number];

type ReportRecord = {
  id: string;
  sampleId: string;
  status: string;
  deliveredDate: string | null;
};

function isReportStatus(
  value: string
): value is ReportStatus {
  return REPORT_STATUSES.includes(
    value as ReportStatus
  );
}

function sampleReportStatusFromReportStatus(
  status: ReportStatus
) {
  switch (status) {
    case "Delivered":
      return "Delivered";

    case "Ready":
      return "Ready";

    case "Under Preparation":
      return "Partial Report";

    default:
      return "Pending";
  }
}

function reportStatusRank(status: string) {
  switch (status) {
    case "Delivered":
      return 4;

    case "Ready":
      return 3;

    case "Under Preparation":
      return 2;

    case "Pending":
      return 1;

    default:
      return 0;
  }
}

/* =========================================================
   SAMPLE / REPORT SYNCHRONIZATION
========================================================= */

async function syncSampleReportState(
  sampleId: string
) {
  const sample =
    await db.orm.public.Sample
      .where({ id: sampleId })
      .first();

  if (!sample) {
    return;
  }

  const linkedReports =
    (await db.orm.public.Report
      .where({ sampleId })
      .all()) as ReportRecord[];

  if (linkedReports.length === 0) {
    await db.orm.public.Sample
      .where({ id: sampleId })
      .update({
        reportStatus: "Pending",
        reportDeliveredDate: null,
        status:
          sample.status === "Report Delivered"
            ? "Completed"
            : sample.status,
      });

    return;
  }

  const highestReport =
    [...linkedReports].sort(
      (a, b) =>
        reportStatusRank(b.status) -
        reportStatusRank(a.status)
    )[0];

  const highestStatus =
    isReportStatus(highestReport.status)
      ? highestReport.status
      : "Pending";

  const deliveredReports =
    linkedReports
      .filter(
        (report) =>
          report.status === "Delivered" &&
          report.deliveredDate
      )
      .sort((a, b) => {
        const aTime = a.deliveredDate
          ? new Date(
              a.deliveredDate
            ).getTime()
          : 0;

        const bTime = b.deliveredDate
          ? new Date(
              b.deliveredDate
            ).getTime()
          : 0;

        return bTime - aTime;
      });

  const hasDeliveredReport =
    linkedReports.some(
      (report) =>
        report.status === "Delivered"
    );

  await db.orm.public.Sample
    .where({ id: sampleId })
    .update({
      reportStatus:
        sampleReportStatusFromReportStatus(
          highestStatus
        ),

      reportDeliveredDate:
        deliveredReports[0]
          ?.deliveredDate || null,

      status: hasDeliveredReport
        ? "Report Delivered"
        : sample.status ===
            "Report Delivered"
          ? "Completed"
          : sample.status,
    });
}

/* =========================================================
   REPORT NUMBER DUPLICATE CHECK
========================================================= */

async function reportNumberExists(
  reportNumber: string,
  excludeId?: string
) {
  const reports =
    await db.orm.public.Report.all();

  return reports.some(
    (report) =>
      report.reportNumber
        .trim()
        .toLowerCase() ===
        reportNumber
          .trim()
          .toLowerCase() &&
      report.id !== excludeId
  );
}

/* =========================================================
   NOTIFICATION HELPER
========================================================= */

async function createReportNotification({
  reportId,
  companyName,
  reportNumber,
  sampleNumber,
  status,
  type,
  title,
}: {
  reportId: string;
  companyName: string;
  reportNumber: string;
  sampleNumber: string;
  status: string;
  type:
    | "REPORT_CREATED"
    | "REPORT_STATUS_CHANGED";
  title: string;
}) {
  try {
    await db.orm.public.Notification.create({
      type,
      title,

      message:
        `${companyName} - ${reportNumber} - ` +
        `Sample ${sampleNumber} - ${status}`,

      entityType: "Report",
      entityId: reportId,

      actionUrl:
        `/admin/reports/${reportId}`,

      isRead: false,
    });
  } catch (error) {
    /*
     * A notification failure must never cause a
     * successful report operation to fail.
     */
    console.error(
      "Report notification creation error:",
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

    return NextResponse.json(reports);
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
   POST
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
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const sampleId =
      typeof body.sampleId === "string"
        ? body.sampleId.trim()
        : "";

    const reportNumber =
      typeof body.reportNumber === "string"
        ? body.reportNumber.trim()
        : "";

    const status =
      typeof body.status === "string" &&
      body.status.trim()
        ? body.status.trim()
        : "Pending";

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

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

    /* =====================================================
       STATUS VALIDATION
    ===================================================== */

    if (!isReportStatus(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid report status.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DUPLICATE REPORT NUMBER
    ===================================================== */

    if (
      await reportNumberExists(
        reportNumber
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A report with this report number already exists.",
        },
        {
          status: 409,
        }
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
          error:
            "Selected company was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SAMPLE VALIDATION
    ===================================================== */

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
      sample.companyId !== companyId
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

    /* =====================================================
       DELIVERY DETAILS
    ===================================================== */

    const deliveredDate =
      status === "Delivered" &&
      body.deliveredDate
        ? body.deliveredDate
        : null;

    const deliveryMethod =
      status === "Delivered" &&
      typeof body.deliveryMethod ===
        "string" &&
      body.deliveryMethod.trim()
        ? body.deliveryMethod.trim()
        : null;

    /* =====================================================
       CREATE REPORT
    ===================================================== */

    const report =
      await db.orm.public.Report.create({
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
          body.reportDate || null,

        status,

        deliveredDate,
        deliveryMethod,

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
      });

    /*
     * Preserve the existing Sample ↔ Report
     * synchronization.
     */
    await syncSampleReportState(
      sampleId
    );

    /* =====================================================
       CREATE NOTIFICATION
    ===================================================== */

    await createReportNotification({
      reportId: report.id,
      companyName: company.name,
      reportNumber,
      sampleNumber:
        sample.sampleNumber,
      status,
      type: "REPORT_CREATED",
      title: "Report created",
    });

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
   PUT
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

    /* =====================================================
       EXISTING REPORT
    ===================================================== */

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

    const oldSampleId =
      existingReport.sampleId;

    /* =====================================================
       VALUES
    ===================================================== */

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : existingReport.companyId;

    const sampleId =
      typeof body.sampleId === "string"
        ? body.sampleId.trim()
        : existingReport.sampleId;

    const reportNumber =
      typeof body.reportNumber === "string"
        ? body.reportNumber.trim()
        : existingReport.reportNumber;

    const status =
      typeof body.status === "string"
        ? body.status.trim() ||
          existingReport.status
        : existingReport.status;

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

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

    /* =====================================================
       STATUS VALIDATION
    ===================================================== */

    if (!isReportStatus(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid report status.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DUPLICATE REPORT NUMBER
    ===================================================== */

    if (
      await reportNumberExists(
        reportNumber,
        id
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A report with this report number already exists.",
        },
        {
          status: 409,
        }
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
          error:
            "Selected company was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SAMPLE VALIDATION
    ===================================================== */

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
      sample.companyId !== companyId
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

    /* =====================================================
       DELIVERY DETAILS
    ===================================================== */

    const deliveredDate =
      status === "Delivered"
        ? body.deliveredDate !== undefined
          ? body.deliveredDate || null
          : existingReport.deliveredDate
        : null;

    const deliveryMethod =
      status === "Delivered"
        ? body.deliveryMethod !== undefined
          ? typeof body.deliveryMethod ===
              "string" &&
            body.deliveryMethod.trim()
            ? body.deliveryMethod.trim()
            : null
          : existingReport.deliveryMethod
        : null;

    /*
     * Capture the status transition before updating.
     * This prevents ordinary edits from generating
     * unnecessary notifications.
     */
    const statusChanged =
      existingReport.status !== status;

    /* =====================================================
       UPDATE REPORT
    ===================================================== */

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
            body.reportDate !== undefined
              ? body.reportDate || null
              : existingReport.reportDate,

          status,
          deliveredDate,
          deliveryMethod,

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

    /*
     * Synchronize the currently linked sample.
     */
    await syncSampleReportState(
      sampleId
    );

    /*
     * If the report was moved to another sample,
     * resynchronize the previous sample as well.
     */
    if (
      oldSampleId !== sampleId
    ) {
      await syncSampleReportState(
        oldSampleId
      );
    }

    /* =====================================================
       STATUS CHANGE NOTIFICATION
    ===================================================== */

    if (statusChanged) {
      await createReportNotification({
        reportId: id,
        companyName: company.name,
        reportNumber,
        sampleNumber:
          sample.sampleNumber,
        status,
        type:
          "REPORT_STATUS_CHANGED",
        title:
          status === "Delivered"
            ? "Report delivered"
            : `Report status: ${status}`,
      });
    }

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