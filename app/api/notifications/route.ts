import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type NotificationPatchBody = {
  id?: string;
  source?: "lead" | "notification";
  markAll?: boolean;
};

type BellNotification = {
  id: string;
  source: "lead" | "notification";
  type: string;
  title: string;
  message: string;
  createdAt: string;
  href: string;
  isRead: boolean;
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
    const [leads, crmNotifications] = await Promise.all([
      db.orm.public.Lead
        .orderBy((lead) => lead.createdAt.desc())
        .all(),

      db.orm.public.Notification
        .orderBy((notification) => notification.createdAt.desc())
        .all(),
    ]);

    /*
     * Phase 1:
     * Existing website-lead notifications.
     *
     * We keep Lead.isRead so existing website leads continue
     * working exactly as before.
     */
    const leadNotifications: BellNotification[] = leads.map((lead) => ({
      id: lead.id,
      source: "lead",
      type: "NEW_LEAD",
      title: "New website lead",
      message: `${lead.name} - ${lead.company} - ${lead.service}`,
      createdAt: lead.createdAt,
      href: `/admin/leads/${lead.id}`,
      isRead: lead.isRead !== false,
    }));

    /*
     * Phase 2:
     * General CRM notifications stored in the Notification table.
     */
    const generalNotifications: BellNotification[] =
      crmNotifications.map((notification) => ({
        id: notification.id,
        source: "notification",
        type: notification.type,
        title: notification.title,
        message: notification.message ?? "",
        createdAt: notification.createdAt,
        href: notification.actionUrl ?? "/admin",
        isRead: notification.isRead === true,
      }));

    /*
     * Combine both notification sources and show newest first.
     */
    const notifications = [
      ...leadNotifications,
      ...generalNotifications,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 20);

    const unreadLeadCount = leads.filter(
      (lead) => lead.isRead === false
    ).length;

    const unreadGeneralCount = crmNotifications.filter(
      (notification) => notification.isRead === false
    ).length;

    const unreadCount =
      unreadLeadCount + unreadGeneralCount;

    return NextResponse.json({
      success: true,

      // Total unread notifications for the top bell.
      unreadCount,

      /*
       * Keep this for AdminSidebar compatibility.
       * Sidebar currently expects newLeads.
       */
      newLeads: unreadLeadCount,

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
    const body =
      (await request.json()) as NotificationPatchBody;

    /*
     * MARK ALL AS READ
     *
     * This updates:
     * 1. Existing Phase-1 Lead.isRead records
     * 2. New Phase-2 Notification.isRead records
     */
    if (body.markAll === true) {
      const [leads, crmNotifications] =
        await Promise.all([
          db.orm.public.Lead.all(),
          db.orm.public.Notification.all(),
        ]);

      const unreadLeads = leads.filter(
        (lead) => lead.isRead === false
      );

      const unreadNotifications =
        crmNotifications.filter(
          (notification) =>
            notification.isRead === false
        );

      await Promise.all([
        ...unreadLeads.map((lead) =>
          db.orm.public.Lead
            .where({ id: lead.id })
            .update({ isRead: true })
        ),

        ...unreadNotifications.map((notification) =>
          db.orm.public.Notification
            .where({ id: notification.id })
            .update({ isRead: true })
        ),
      ]);

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

    /*
     * New Phase-2 notification.
     */
    if (body.source === "notification") {
      const notification =
        await db.orm.public.Notification
          .where({ id })
          .first();

      if (!notification) {
        return NextResponse.json(
          {
            success: false,
            message: "Notification not found.",
          },
          { status: 404 }
        );
      }

      if (notification.isRead === false) {
        await db.orm.public.Notification
          .where({ id })
          .update({ isRead: true });
      }
    } else {
      /*
       * Existing Phase-1 website lead.
       *
       * Defaulting to lead keeps compatibility with the
       * current NotificationBell component.
       */
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
    }

    /*
     * Recalculate the combined unread count.
     */
    const [leads, crmNotifications] =
      await Promise.all([
        db.orm.public.Lead.all(),
        db.orm.public.Notification.all(),
      ]);

    const unreadLeadCount = leads.filter(
      (lead) => lead.isRead === false
    ).length;

    const unreadGeneralCount =
      crmNotifications.filter(
        (notification) =>
          notification.isRead === false
      ).length;

    return NextResponse.json({
      success: true,
      unreadCount:
        unreadLeadCount + unreadGeneralCount,
      newLeads: unreadLeadCount,
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