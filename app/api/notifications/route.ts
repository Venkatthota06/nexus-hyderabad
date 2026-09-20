import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type NotificationPatchBody = {
  id?: string;
  markAll?: boolean;
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
    const leads = await db.orm.public.Lead
      .orderBy((lead) => lead.createdAt.desc())
      .all();

    const unreadCount = leads.filter(
      (lead) => lead.isRead === false
    ).length;

    const notifications = leads.slice(0, 20).map((lead) => ({
      id: lead.id,
      title: "New website lead",
      message: `${lead.name} · ${lead.company} · ${lead.service}`,
      createdAt: lead.createdAt,
      href: `/admin/leads/${lead.id}`,
      isRead: lead.isRead !== false,
    }));

    return NextResponse.json({
      success: true,
      unreadCount,
      newLeads: unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        unreadCount: 0,
        newLeads: 0,
        notifications: [],
        message: "Failed to load notifications.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
    const body = (await request.json()) as NotificationPatchBody;

    if (body.markAll === true) {
      const leads = await db.orm.public.Lead.all();

      const unreadLeads = leads.filter(
        (lead) => lead.isRead === false
      );

      await Promise.all(
        unreadLeads.map((lead) =>
          db.orm.public.Lead
            .where({ id: lead.id })
            .update({ isRead: true })
        )
      );

      return NextResponse.json({
        success: true,
        unreadCount: 0,
      });
    }

    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required.",
        },
        { status: 400 }
      );
    }

    const lead = await db.orm.public.Lead
      .where({ id })
      .first();

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead notification not found.",
        },
        { status: 404 }
      );
    }

    if (lead.isRead === false) {
      await db.orm.public.Lead
        .where({ id })
        .update({ isRead: true });
    }

    const leads = await db.orm.public.Lead.all();

    const unreadCount = leads.filter(
      (item) => item.isRead === false
    ).length;

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update notification.",
      },
      { status: 500 }
    );
  }
}
