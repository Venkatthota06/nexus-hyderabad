import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const quotations =
      await db.orm.public.Quotation
        .orderBy(
          (quotation) =>
            quotation.createdAt.desc()
        )
        .all();

    return NextResponse.json(
      quotations
    );
  } catch (error) {
    console.error(
      "Failed to fetch quotations:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch quotations.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body =
      await request.json();

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const quotationNumber =
      typeof body.quotationNumber ===
        "string"
        ? body.quotationNumber.trim()
        : "";

    const service =
      typeof body.service === "string"
        ? body.service.trim()
        : "";

    const quotationDate =
      typeof body.quotationDate === "string"
        ? body.quotationDate.trim()
        : "";

    const amount =
      Number(body.amount);

    const gstPercent =
      body.gstPercent !== undefined
        ? Number(body.gstPercent)
        : 18;

    if (
      !companyId ||
      !quotationNumber ||
      !service ||
      !quotationDate ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !Number.isFinite(gstPercent) ||
      gstPercent < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Company, quotation number, service, quotation date, and valid amount are required.",
        },
        {
          status: 400,
        }
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
          error:
            "Company not found.",
        },
        {
          status: 404,
        }
      );
    }

    const gstAmount =
      (amount * gstPercent) / 100;

    const totalAmount =
      amount + gstAmount;

    const quotation =
      await db.orm.public.Quotation.create(
        {
          companyId,

          quotationNumber,

          service,

          description:
            typeof body.description ===
            "string"
              ? body.description.trim() ||
                null
              : null,

          amount,

          gstPercent,

          gstAmount,

          totalAmount,

          status:
            typeof body.status ===
              "string" &&
            body.status.trim()
              ? body.status.trim()
              : "Draft",

          quotationDate,

          sentDate:
            typeof body.sentDate ===
              "string" &&
            body.sentDate.trim()
              ? body.sentDate
              : null,

          nextFollowUp:
            typeof body.nextFollowUp ===
              "string" &&
            body.nextFollowUp.trim()
              ? body.nextFollowUp
              : null,

          notes:
            typeof body.notes ===
            "string"
              ? body.notes.trim() ||
                null
              : null,
        }
      );

    return NextResponse.json(
      quotation,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create quotation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create quotation.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
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
            "Quotation ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingQuotation =
      await db.orm.public.Quotation
        .where({
          id,
        })
        .first();

    if (!existingQuotation) {
      return NextResponse.json(
        {
          error:
            "Quotation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const companyId =
      typeof body.companyId ===
        "string" &&
      body.companyId.trim()
        ? body.companyId.trim()
        : existingQuotation.companyId;

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
            "Company not found.",
        },
        {
          status: 404,
        }
      );
    }

    const amount =
      body.amount !== undefined
        ? Number(body.amount)
        : existingQuotation.amount;

    const gstPercent =
      body.gstPercent !== undefined
        ? Number(body.gstPercent)
        : existingQuotation.gstPercent;

    if (
      !Number.isFinite(amount) ||
      amount < 0 ||
      !Number.isFinite(gstPercent) ||
      gstPercent < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Amount and GST must be valid numbers.",
        },
        {
          status: 400,
        }
      );
    }

    const gstAmount =
      (amount * gstPercent) / 100;

    const totalAmount =
      amount + gstAmount;

    const status =
      typeof body.status ===
        "string" &&
      body.status.trim()
        ? body.status.trim()
        : existingQuotation.status;

    const terminalStatuses = [
      "Accepted",
      "Rejected",
      "Expired",
    ];

    const nextFollowUp =
      terminalStatuses.includes(status)
        ? null
        : body.nextFollowUp !== undefined
          ? typeof body.nextFollowUp ===
              "string" &&
            body.nextFollowUp.trim()
            ? body.nextFollowUp
            : null
          : existingQuotation.nextFollowUp;

    await db.orm.public.Quotation
      .where({
        id,
      })
      .update({
        companyId,

        quotationNumber:
          typeof body.quotationNumber ===
            "string" &&
          body.quotationNumber.trim()
            ? body.quotationNumber.trim()
            : existingQuotation.quotationNumber,

        service:
          typeof body.service ===
            "string" &&
          body.service.trim()
            ? body.service.trim()
            : existingQuotation.service,

        description:
          body.description !== undefined
            ? typeof body.description ===
                "string"
              ? body.description.trim() ||
                null
              : null
            : existingQuotation.description,

        amount,

        gstPercent,

        gstAmount,

        totalAmount,

        status,

        quotationDate:
          typeof body.quotationDate ===
            "string" &&
          body.quotationDate.trim()
            ? body.quotationDate
            : existingQuotation.quotationDate,

        sentDate:
          body.sentDate !== undefined
            ? typeof body.sentDate ===
                "string" &&
              body.sentDate.trim()
              ? body.sentDate
              : null
            : existingQuotation.sentDate,

        nextFollowUp,

        notes:
          body.notes !== undefined
            ? typeof body.notes ===
                "string"
              ? body.notes.trim() ||
                null
              : null
            : existingQuotation.notes,
      });

    const updatedQuotation =
      await db.orm.public.Quotation
        .where({
          id,
        })
        .first();

    if (!updatedQuotation) {
      return NextResponse.json(
        {
          error:
            "Quotation could not be loaded after update.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      updatedQuotation
    );
  } catch (error) {
    console.error(
      "Failed to update quotation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update quotation.",
      },
      {
        status: 500,
      }
    );
  }
}