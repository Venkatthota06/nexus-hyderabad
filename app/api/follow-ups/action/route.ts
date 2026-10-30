import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { hasValidApiRole, isRecordOwnedByOrCreatedBy } from "@/src/lib/api-authorization";

export const dynamic = "force-dynamic";

type Source = "Lead" | "Inbound Call" | "Activity" | "Quotation";
type Row = Record<string, unknown>;

const text = (value: unknown) => String(value ?? "").trim();
const normalized = (value: unknown) => text(value).toLowerCase();

function addDays(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function canManage(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}


async function notify(input: {
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  url: string;
}) {
  try {
    await db.orm.public.Notification.create({
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId,
      actionUrl: input.url,
      isRead: false,
    });
  } catch (error) {
    // The follow-up change is already saved; notification failure must not undo it.
    console.error("Quick follow-up notification error:", error);
  }
}

function forbidden() {
  return NextResponse.json({ error: "You do not have permission to update this record." }, { status: 403 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasValidApiRole(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = session.user as { name?: string | null; role?: string | null };
  const role = text(user.role).toUpperCase();
  const userName = text(user.name);

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const source = text(body.source) as Source;
    const id = text(body.id);
    const action = text(body.action);

    if (!id || !["Lead", "Inbound Call", "Activity", "Quotation"].includes(source)) {
      return NextResponse.json({ error: "Valid follow-up record is required." }, { status: 400 });
    }

    let next: string | null;
    if (action === "tomorrow") next = addDays(1);
    else if (action === "week") next = addDays(7);
    else if (action === "clear") next = null;
    else if (action === "date" && isValidDate(body.date)) next = body.date;
    else {
      return NextResponse.json(
        { error: action === "date" ? "A valid date in YYYY-MM-DD format is required." : "Valid quick action is required." },
        { status: 400 },
      );
    }

    if (source === "Lead" || source === "Inbound Call") {
      const old = await db.orm.public.Lead.where({ id }).first();
      if (!old) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
      const record = old as unknown as Row;
      if (!canManage(role) && !isRecordOwnedByOrCreatedBy(record, userName)) return forbidden();
      if (["won", "lost"].includes(normalized(record.status))) {
        return NextResponse.json({ error: "Closed leads cannot be rescheduled." }, { status: 409 });
      }

      await db.orm.public.Lead.where({ id }).update({ nextFollowUp: next });
      await notify({
        type: next ? "FOLLOW_UP_SCHEDULED" : "FOLLOW_UP_CLEARED",
        title: next ? "Lead follow-up rescheduled" : "Lead follow-up cleared",
        message: `${text(record.name)} - ${text(record.company)}${next ? ` - ${next}` : ""}`,
        entityType: "Lead",
        entityId: id,
        url: `/admin/leads/${encodeURIComponent(id)}`,
      });
      return NextResponse.json({ success: true, nextFollowUp: next });
    }

    if (source === "Activity") {
      const old = await db.orm.public.Activity.where({ id }).first();
      if (!old) return NextResponse.json({ error: "Activity not found." }, { status: 404 });
      const record = old as unknown as Row;
      if (!canManage(role) && !ownsRecord(record, userName)) return forbidden();

      await db.orm.public.Activity.where({ id }).update({ nextFollowUp: next });
      await notify({
        type: next ? "FOLLOW_UP_SCHEDULED" : "FOLLOW_UP_CLEARED",
        title: next ? "Activity follow-up rescheduled" : "Activity follow-up cleared",
        message: `${text(record.title) || text(record.type)}${next ? ` - ${next}` : ""}`,
        entityType: "Activity",
        entityId: id,
        url: `/admin/companies/${encodeURIComponent(text(record.companyId))}`,
      });
      return NextResponse.json({ success: true, nextFollowUp: next });
    }

    const old = await db.orm.public.Quotation.where({ id }).first();
    if (!old) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    const record = old as unknown as Row;
    if (!canManage(role) && !ownsRecord(record, userName)) return forbidden();
    if (["accepted", "rejected", "expired"].includes(normalized(record.status))) {
      return NextResponse.json({ error: "Closed quotations cannot be rescheduled." }, { status: 409 });
    }

    await db.orm.public.Quotation.where({ id }).update({ nextFollowUp: next });
    await notify({
      type: next ? "FOLLOW_UP_SCHEDULED" : "FOLLOW_UP_CLEARED",
      title: next ? "Quotation follow-up rescheduled" : "Quotation follow-up cleared",
      message: `${text(record.quotationNumber)} - ${text(record.service)}${next ? ` - ${next}` : ""}`,
      entityType: "Quotation",
      entityId: id,
      url: `/admin/quotations/${encodeURIComponent(id)}`,
    });
    return NextResponse.json({ success: true, nextFollowUp: next });
  } catch (error) {
    console.error("Quick follow-up action failed:", error);
    return NextResponse.json({ error: "Unable to update follow-up. Please try again." }, { status: 500 });
  }
}
