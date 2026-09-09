import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await db.orm.public.Lead.all();

    const unreadLeads = leads.filter(
      (lead) => lead.isRead === false
    ).length;

    return NextResponse.json({
      newLeads: unreadLeads,
    });
  } catch (error) {
    console.error(
      "Notification count error:",
      error
    );

    return NextResponse.json(
      {
        newLeads: 0,
        error: "Failed to load notifications",
      },
      { status: 500 }
    );
  }
}