import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

const CLOSED_ORDER_STATUSES = ["Completed", "Cancelled", "Canceled"];

async function quotation(id: string | null, companyId: string) {
  if (!id) return null;
  const record = await db.orm.public.Quotation.where({ id }).first();
  if (!record) throw new Error("QUOTATION_NOT_FOUND");
  if (record.companyId !== companyId) throw new Error("QUOTATION_COMPANY");
  return record;
}

async function duplicateOrderNumber(workOrderNumber: string, excludeId?: string) {
  const orders = await db.orm.public.WorkOrder.all();
  return orders.find(
    (order) =>
      order.id !== excludeId &&
      String(order.workOrderNumber).trim().toLowerCase() ===
        workOrderNumber.trim().toLowerCase(),
  );
}

async function quotationAlreadyConverted(quotationId: string, excludeId?: string) {
  const orders = await db.orm.public.WorkOrder.all();
  return orders.find(
    (order) => order.id !== excludeId && order.quotationId === quotationId,
  );
}

async function notifyOrder(params: {
  id: string;
  companyName: string;
  workOrderNumber: string;
  service: string;
  totalAmount: number;
  title: string;
  type: string;
}) {
  try {
    await db.orm.public.Notification.create({
      type: params.type,
      title: params.title,
      message: `${params.companyName} - ${params.workOrderNumber} - ${params.service} - ₹${params.totalAmount.toLocaleString("en-IN")}`,
      entityType: "WorkOrder",
      entityId: params.id,
      actionUrl: `/admin/companies`,
      isRead: false,
    });
  } catch (error) {
    console.error("Work-order notification error:", error);
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const companyId = new URL(request.url).searchParams.get("companyId");
    const query = companyId
      ? db.orm.public.WorkOrder.where({ companyId })
      : db.orm.public.WorkOrder;
    return NextResponse.json(await query.orderBy((x) => x.confirmedDate.desc()).all());
  } catch (error) {
    console.error("GET work orders error:", error);
    return NextResponse.json({ error: "Failed to load work orders." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const companyId = String(body.companyId || "").trim();
    const quotationId = String(body.quotationId || "").trim() || null;
    const workOrderNumber = String(body.workOrderNumber || "").trim();
    const service = String(body.service || "").trim();
    const amount = Number(body.amount);
    const gstPercent = body.gstPercent !== undefined ? Number(body.gstPercent) : 18;
    const confirmedDate = String(body.confirmedDate || "").trim();

    if (!companyId || !workOrderNumber || !service || !confirmedDate || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(gstPercent) || gstPercent < 0) {
      return NextResponse.json({ error: "Company, work order number, service, amount and confirmed date are required." }, { status: 400 });
    }

    const company = await db.orm.public.Company.where({ id: companyId }).first();
    if (!company) return NextResponse.json({ error: "Selected company was not found." }, { status: 404 });

    const duplicateNumber = await duplicateOrderNumber(workOrderNumber);
    if (duplicateNumber) {
      return NextResponse.json({ error: `Work order / PO number ${workOrderNumber} already exists.`, workOrderId: duplicateNumber.id }, { status: 409 });
    }

    const linkedQuotation = await quotation(quotationId, companyId);
    if (quotationId) {
      const existingConversion = await quotationAlreadyConverted(quotationId);
      if (existingConversion) {
        return NextResponse.json({ error: `This quotation is already converted to work order ${existingConversion.workOrderNumber}.`, workOrderId: existingConversion.id }, { status: 409 });
      }
      if (linkedQuotation && String(linkedQuotation.status) !== "Accepted") {
        return NextResponse.json({ error: "Only an Accepted quotation can be converted into a confirmed work order." }, { status: 400 });
      }
    }

    const salesOwner = String(body.salesOwner || "").trim() || (linkedQuotation?.salesOwner ? String(linkedQuotation.salesOwner) : null);
    const gstAmount = amount * gstPercent / 100;
    const totalAmount = amount + gstAmount;

    const workOrder = await db.orm.public.WorkOrder.create({
      companyId,
      quotationId,
      workOrderNumber,
      service,
      description: String(body.description || "").trim() || null,
      amount,
      gstPercent,
      gstAmount,
      totalAmount,
      salesOwner,
      status: String(body.status || "Confirmed").trim() || "Confirmed",
      confirmedDate,
      expectedStart: body.expectedStart || null,
      expectedEnd: body.expectedEnd || null,
      notes: String(body.notes || "").trim() || null,
    });

    await notifyOrder({ id: workOrder.id, companyName: company.name, workOrderNumber, service, totalAmount, type: "WORK_ORDER_CREATED", title: "Confirmed order created" });
    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTATION_NOT_FOUND") return NextResponse.json({ error: "Selected quotation was not found." }, { status: 404 });
    if (error instanceof Error && error.message === "QUOTATION_COMPANY") return NextResponse.json({ error: "Selected quotation does not belong to this client." }, { status: 400 });
    console.error("POST work order error:", error);
    return NextResponse.json({ error: "Failed to create work order." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "Work Order ID is required." }, { status: 400 });

    const existing = await db.orm.public.WorkOrder.where({ id }).first();
    if (!existing) return NextResponse.json({ error: "Work order not found." }, { status: 404 });

    const workOrderNumber = body.workOrderNumber !== undefined ? String(body.workOrderNumber || "").trim() : String(existing.workOrderNumber);
    const service = body.service !== undefined ? String(body.service || "").trim() : String(existing.service);
    if (!workOrderNumber || !service) return NextResponse.json({ error: "Work order number and service are required." }, { status: 400 });

    const duplicateNumber = await duplicateOrderNumber(workOrderNumber, id);
    if (duplicateNumber) return NextResponse.json({ error: `Work order / PO number ${workOrderNumber} already exists.` }, { status: 409 });

    const quotationId = body.quotationId !== undefined ? (String(body.quotationId || "").trim() || null) : existing.quotationId;
    const linkedQuotation = await quotation(quotationId, existing.companyId);
    if (quotationId) {
      const otherConversion = await quotationAlreadyConverted(quotationId, id);
      if (otherConversion) return NextResponse.json({ error: `This quotation is already linked to work order ${otherConversion.workOrderNumber}.` }, { status: 409 });
      if (linkedQuotation && String(linkedQuotation.status) !== "Accepted") return NextResponse.json({ error: "A work order can only be linked to an Accepted quotation." }, { status: 400 });
    }

    const amount = body.amount !== undefined ? Number(body.amount) : Number(existing.amount);
    const gstPercent = body.gstPercent !== undefined ? Number(body.gstPercent) : Number(existing.gstPercent);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(gstPercent) || gstPercent < 0) return NextResponse.json({ error: "Enter valid amount and GST." }, { status: 400 });

    const gstAmount = amount * gstPercent / 100;
    const totalAmount = amount + gstAmount;
    const salesOwner = body.salesOwner !== undefined ? (String(body.salesOwner || "").trim() || null) : (existing.salesOwner || (linkedQuotation?.salesOwner ? String(linkedQuotation.salesOwner) : null));
    const nextStatus = String(body.status || existing.status).trim();

    const workOrder = await db.orm.public.WorkOrder.where({ id }).update({
      quotationId,
      workOrderNumber,
      service,
      description: body.description !== undefined ? (String(body.description || "").trim() || null) : existing.description,
      amount,
      gstPercent,
      gstAmount,
      totalAmount,
      salesOwner,
      status: nextStatus,
      confirmedDate: body.confirmedDate || existing.confirmedDate,
      expectedStart: body.expectedStart !== undefined ? (body.expectedStart || null) : existing.expectedStart,
      expectedEnd: body.expectedEnd !== undefined ? (body.expectedEnd || null) : existing.expectedEnd,
      notes: body.notes !== undefined ? (String(body.notes || "").trim() || null) : existing.notes,
    });

    if (nextStatus !== existing.status && CLOSED_ORDER_STATUSES.includes(nextStatus)) {
      const company = await db.orm.public.Company.where({ id: existing.companyId }).first();
      if (company) await notifyOrder({ id, companyName: company.name, workOrderNumber, service, totalAmount, type: "WORK_ORDER_STATUS_CHANGED", title: `Order ${nextStatus.toLowerCase()}` });
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTATION_NOT_FOUND") return NextResponse.json({ error: "Selected quotation was not found." }, { status: 404 });
    if (error instanceof Error && error.message === "QUOTATION_COMPANY") return NextResponse.json({ error: "Selected quotation does not belong to this client." }, { status: 400 });
    console.error("PUT work order error:", error);
    return NextResponse.json({ error: "Failed to update work order." }, { status: 500 });
  }
}
