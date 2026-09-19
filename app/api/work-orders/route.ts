import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   GET WORK ORDERS
========================================================= */

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);

    const companyId =
      url.searchParams.get("companyId");

    if (companyId) {
      const workOrders =
        await db.orm.public.WorkOrder
          .where({
            companyId,
          })
          .orderBy(
            (row) =>
              row.confirmedDate.desc()
          )
          .all();

      return NextResponse.json(workOrders);
    }

    const workOrders =
      await db.orm.public.WorkOrder
        .orderBy(
          (row) =>
            row.confirmedDate.desc()
        )
        .all();

    return NextResponse.json(workOrders);
  } catch (error) {
    console.error(
      "GET work orders error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load work orders.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE WORK ORDER
========================================================= */

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const quotationId =
      typeof body.quotationId === "string" &&
      body.quotationId.trim()
        ? body.quotationId.trim()
        : null;

    const workOrderNumber =
      typeof body.workOrderNumber ===
        "string"
        ? body.workOrderNumber.trim()
        : "";

    const service =
      typeof body.service === "string"
        ? body.service.trim()
        : "";

    const amount = Number(body.amount);

    const gstPercent =
      body.gstPercent !== undefined
        ? Number(body.gstPercent)
        : 18;

    const confirmedDate =
      typeof body.confirmedDate ===
        "string"
        ? body.confirmedDate.trim()
        : "";

    if (!companyId) {
      return NextResponse.json(
        {
          error: "Company is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!workOrderNumber) {
      return NextResponse.json(
        {
          error:
            "Work order / PO number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!service) {
      return NextResponse.json(
        {
          error: "Service is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid base amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(gstPercent) ||
      gstPercent < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid GST percentage.",
        },
        {
          status: 400,
        }
      );
    }

    if (!confirmedDate) {
      return NextResponse.json(
        {
          error:
            "Confirmed date is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* VERIFY COMPANY */

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

    /* VERIFY QUOTATION */

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
            error:
              "Selected quotation was not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        quotation.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            error:
              "Selected quotation does not belong to this client.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* CALCULATE VALUES */

    const gstAmount =
      amount * (gstPercent / 100);

    const totalAmount =
      amount + gstAmount;

    const workOrder =
      await db.orm.public.WorkOrder.create({
        companyId,
        quotationId,

        workOrderNumber,
        service,

        description:
          typeof body.description ===
            "string" &&
          body.description.trim()
            ? body.description.trim()
            : null,

        amount,
        gstPercent,
        gstAmount,
        totalAmount,

        status:
          typeof body.status === "string" &&
          body.status.trim()
            ? body.status.trim()
            : "Confirmed",

        confirmedDate,

        expectedStart:
          body.expectedStart || null,

        expectedEnd:
          body.expectedEnd || null,

        notes:
          typeof body.notes === "string" &&
          body.notes.trim()
            ? body.notes.trim()
            : null,
      });

    return NextResponse.json(
      workOrder,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST work order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create work order.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE WORK ORDER
========================================================= */

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Work order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.orm.public.WorkOrder
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Work order not found.",
        },
        {
          status: 404,
        }
      );
    }

    const quotationId =
      body.quotationId !== undefined
        ? typeof body.quotationId ===
              "string" &&
          body.quotationId.trim()
          ? body.quotationId.trim()
          : null
        : existing.quotationId;

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
            error:
              "Selected quotation was not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        quotation.companyId !==
        existing.companyId
      ) {
        return NextResponse.json(
          {
            error:
              "Selected quotation does not belong to this client.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const amount =
      body.amount !== undefined
        ? Number(body.amount)
        : Number(existing.amount);

    const gstPercent =
      body.gstPercent !== undefined
        ? Number(body.gstPercent)
        : Number(existing.gstPercent);

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid base amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(gstPercent) ||
      gstPercent < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid GST percentage.",
        },
        {
          status: 400,
        }
      );
    }

    const gstAmount =
      amount * (gstPercent / 100);

    const totalAmount =
      amount + gstAmount;

    const workOrder =
      await db.orm.public.WorkOrder
        .where({
          id,
        })
        .update({
          quotationId,

          workOrderNumber:
            typeof body.workOrderNumber ===
              "string"
              ? body.workOrderNumber.trim() ||
                existing.workOrderNumber
              : existing.workOrderNumber,

          service:
            typeof body.service === "string"
              ? body.service.trim() ||
                existing.service
              : existing.service,

          description:
            body.description !== undefined
              ? typeof body.description ===
                    "string" &&
                  body.description.trim()
                ? body.description.trim()
                : null
              : existing.description,

          amount,
          gstPercent,
          gstAmount,
          totalAmount,

          status:
            typeof body.status === "string"
              ? body.status.trim() ||
                existing.status
              : existing.status,

          confirmedDate:
            body.confirmedDate ||
            existing.confirmedDate,

          expectedStart:
            body.expectedStart !== undefined
              ? body.expectedStart || null
              : existing.expectedStart,

          expectedEnd:
            body.expectedEnd !== undefined
              ? body.expectedEnd || null
              : existing.expectedEnd,

          notes:
            body.notes !== undefined
              ? typeof body.notes ===
                    "string" &&
                  body.notes.trim()
                ? body.notes.trim()
                : null
              : existing.notes,
        });

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error(
      "PUT work order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update work order.",
      },
      {
        status: 500,
      }
    );
  }
}