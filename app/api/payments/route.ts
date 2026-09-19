import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   GET PAYMENTS
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
      const payments =
        await db.orm.public.Payment
          .where({
            companyId,
          })
          .orderBy(
            (payment) =>
              payment.paymentDate.desc()
          )
          .all();

      return NextResponse.json(payments);
    }

    const payments =
      await db.orm.public.Payment
        .orderBy(
          (payment) =>
            payment.paymentDate.desc()
        )
        .all();

    return NextResponse.json(payments);
  } catch (error) {
    console.error(
      "GET payments error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load payments.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE PAYMENT
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

    const workOrderId =
      typeof body.workOrderId === "string" &&
      body.workOrderId.trim()
        ? body.workOrderId.trim()
        : null;

    const amount =
      Number(body.amount);

    const paymentDate =
      typeof body.paymentDate === "string"
        ? body.paymentDate.trim()
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

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Payment amount must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        {
          error:
            "Payment date is required.",
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

    /* VERIFY WORK ORDER */

    if (workOrderId) {
      const workOrder =
        await db.orm.public.WorkOrder
          .where({
            id: workOrderId,
          })
          .first();

      if (!workOrder) {
        return NextResponse.json(
          {
            error:
              "Selected work order was not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        workOrder.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            error:
              "Selected work order does not belong to this client.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const payment =
      await db.orm.public.Payment.create({
        companyId,
        quotationId,
        workOrderId,

        amount,

        paymentDate,

        paymentMethod:
          typeof body.paymentMethod ===
            "string" &&
          body.paymentMethod.trim()
            ? body.paymentMethod.trim()
            : null,

        reference:
          typeof body.reference ===
            "string" &&
          body.reference.trim()
            ? body.reference.trim()
            : null,

        status:
          typeof body.status === "string" &&
          body.status.trim()
            ? body.status.trim()
            : "Received",

        notes:
          typeof body.notes === "string" &&
          body.notes.trim()
            ? body.notes.trim()
            : null,
      });

    return NextResponse.json(
      payment,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST payment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create payment.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE PAYMENT
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
            "Payment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.orm.public.Payment
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Payment not found.",
        },
        {
          status: 404,
        }
      );
    }

    const workOrderId =
      body.workOrderId !== undefined
        ? typeof body.workOrderId ===
              "string" &&
          body.workOrderId.trim()
          ? body.workOrderId.trim()
          : null
        : existing.workOrderId;

    const quotationId =
      body.quotationId !== undefined
        ? typeof body.quotationId ===
              "string" &&
          body.quotationId.trim()
          ? body.quotationId.trim()
          : null
        : existing.quotationId;

    if (workOrderId) {
      const workOrder =
        await db.orm.public.WorkOrder
          .where({
            id: workOrderId,
          })
          .first();

      if (!workOrder) {
        return NextResponse.json(
          {
            error:
              "Selected work order was not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        workOrder.companyId !==
        existing.companyId
      ) {
        return NextResponse.json(
          {
            error:
              "Selected work order does not belong to this client.",
          },
          {
            status: 400,
          }
        );
      }
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

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Payment amount must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    const payment =
      await db.orm.public.Payment
        .where({
          id,
        })
        .update({
          quotationId,
          workOrderId,

          amount,

          paymentDate:
            body.paymentDate ||
            existing.paymentDate,

          paymentMethod:
            body.paymentMethod !== undefined
              ? typeof body.paymentMethod ===
                    "string" &&
                  body.paymentMethod.trim()
                ? body.paymentMethod.trim()
                : null
              : existing.paymentMethod,

          reference:
            body.reference !== undefined
              ? typeof body.reference ===
                    "string" &&
                  body.reference.trim()
                ? body.reference.trim()
                : null
              : existing.reference,

          status:
            typeof body.status === "string"
              ? body.status.trim() ||
                existing.status
              : existing.status,

          notes:
            body.notes !== undefined
              ? typeof body.notes ===
                    "string" &&
                  body.notes.trim()
                ? body.notes.trim()
                : null
              : existing.notes,
        });

    return NextResponse.json(payment);
  } catch (error) {
    console.error(
      "PUT payment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update payment.",
      },
      {
        status: 500,
      }
    );
  }
}