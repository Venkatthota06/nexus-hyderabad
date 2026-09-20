import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

const PAYMENT_STATUSES = [
  "Received",
  "Paid",
  "Collected",
  "Completed",
  "Pending Verification",
  "Failed",
] as const;

function cleanOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidPaymentStatus(value: string) {
  return PAYMENT_STATUSES.includes(
    value as (typeof PAYMENT_STATUSES)[number],
  );
}

function parseRequiredDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value.trim());

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return value.trim();
}

async function validateRelations(
  companyId: string,
  quotationId: string | null,
  workOrderId: string | null,
) {
  const company = await db.orm.public.Company
    .where({ id: companyId })
    .first();

  if (!company) {
    return {
      error: "Selected company was not found.",
      status: 404,
    };
  }

  if (quotationId) {
    const quotation = await db.orm.public.Quotation
      .where({ id: quotationId })
      .first();

    if (!quotation) {
      return {
        error: "Selected quotation was not found.",
        status: 404,
      };
    }

    if (quotation.companyId !== companyId) {
      return {
        error: "Selected quotation does not belong to this client.",
        status: 400,
      };
    }
  }

  if (workOrderId) {
    const workOrder = await db.orm.public.WorkOrder
      .where({ id: workOrderId })
      .first();

    if (!workOrder) {
      return {
        error: "Selected work order was not found.",
        status: 404,
      };
    }

    if (workOrder.companyId !== companyId) {
      return {
        error: "Selected work order does not belong to this client.",
        status: 400,
      };
    }
  }

  return null;
}

async function hasDuplicatePayment({
  companyId,
  quotationId,
  workOrderId,
  amount,
  paymentDate,
  excludeId,
}: {
  companyId: string;
  quotationId: string | null;
  workOrderId: string | null;
  amount: number;
  paymentDate: string;
  excludeId?: string;
}) {
  const companyPayments = await db.orm.public.Payment
    .where({ companyId })
    .all();

  const targetTime = new Date(paymentDate).getTime();

  return companyPayments.some((payment) => {
    if (excludeId && payment.id === excludeId) {
      return false;
    }

    const sameDate =
      new Date(payment.paymentDate).getTime() === targetTime;

    return (
      Number(payment.amount) === amount &&
      payment.quotationId === quotationId &&
      payment.workOrderId === workOrderId &&
      sameDate
    );
  });
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId");

    const payments = companyId
      ? await db.orm.public.Payment
          .where({ companyId })
          .orderBy((payment) => payment.paymentDate.desc())
          .all()
      : await db.orm.public.Payment
          .orderBy((payment) => payment.paymentDate.desc())
          .all();

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET payments error:", error);

    return NextResponse.json(
      { error: "Failed to load payments." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const quotationId = cleanOptionalString(body.quotationId);
    const workOrderId = cleanOptionalString(body.workOrderId);
    const amount = Number(body.amount);
    const paymentDate = parseRequiredDate(body.paymentDate);

    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "Received";

    if (!companyId) {
      return NextResponse.json(
        { error: "Company is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0." },
        { status: 400 },
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        { error: "A valid payment date is required." },
        { status: 400 },
      );
    }

    if (!isValidPaymentStatus(status)) {
      return NextResponse.json(
        { error: "Invalid payment status." },
        { status: 400 },
      );
    }

    const relationError = await validateRelations(
      companyId,
      quotationId,
      workOrderId,
    );

    if (relationError) {
      return NextResponse.json(
        { error: relationError.error },
        { status: relationError.status },
      );
    }

    if (
      await hasDuplicatePayment({
        companyId,
        quotationId,
        workOrderId,
        amount,
        paymentDate,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "A matching payment already exists for this client, amount, date and linked record.",
        },
        { status: 409 },
      );
    }

    const payment = await db.orm.public.Payment.create({
      companyId,
      quotationId,
      workOrderId,
      amount,
      paymentDate,
      paymentMethod: cleanOptionalString(body.paymentMethod),
      reference: cleanOptionalString(body.reference),
      status,
      notes: cleanOptionalString(body.notes),
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST payment error:", error);

    return NextResponse.json(
      { error: "Failed to create payment." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const id =
      typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required." },
        { status: 400 },
      );
    }

    const existing = await db.orm.public.Payment
      .where({ id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 },
      );
    }

    const quotationId =
      body.quotationId !== undefined
        ? cleanOptionalString(body.quotationId)
        : existing.quotationId;

    const workOrderId =
      body.workOrderId !== undefined
        ? cleanOptionalString(body.workOrderId)
        : existing.workOrderId;

    const amount =
      body.amount !== undefined
        ? Number(body.amount)
        : Number(existing.amount);

    const paymentDate =
      body.paymentDate !== undefined
        ? parseRequiredDate(body.paymentDate)
        : existing.paymentDate;

    const status =
      body.status !== undefined
        ? typeof body.status === "string"
          ? body.status.trim()
          : ""
        : existing.status;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0." },
        { status: 400 },
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        { error: "A valid payment date is required." },
        { status: 400 },
      );
    }

    if (!isValidPaymentStatus(status)) {
      return NextResponse.json(
        { error: "Invalid payment status." },
        { status: 400 },
      );
    }

    const relationError = await validateRelations(
      existing.companyId,
      quotationId,
      workOrderId,
    );

    if (relationError) {
      return NextResponse.json(
        { error: relationError.error },
        { status: relationError.status },
      );
    }

    if (
      await hasDuplicatePayment({
        companyId: existing.companyId,
        quotationId,
        workOrderId,
        amount,
        paymentDate,
        excludeId: id,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "Another matching payment already exists for this client, amount, date and linked record.",
        },
        { status: 409 },
      );
    }

    const payment = await db.orm.public.Payment
      .where({ id })
      .update({
        quotationId,
        workOrderId,
        amount,
        paymentDate,
        paymentMethod:
          body.paymentMethod !== undefined
            ? cleanOptionalString(body.paymentMethod)
            : existing.paymentMethod,
        reference:
          body.reference !== undefined
            ? cleanOptionalString(body.reference)
            : existing.reference,
        status,
        notes:
          body.notes !== undefined
            ? cleanOptionalString(body.notes)
            : existing.notes,
      });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("PUT payment error:", error);

    return NextResponse.json(
      { error: "Failed to update payment." },
      { status: 500 },
    );
  }
}
