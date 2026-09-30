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

type OperationalSample = {
  id: string;
  companyId: string;
  sampleNumber: string;
  sampleType: string;
  expectedCompletionDate: string | null;
  reportStatus: string;
};

type OperationalAlert = {
  type: "SAMPLE_DUE_SOON" | "SAMPLE_OVERDUE";
  title: string;
  daysUntilDue: number;
};

const OPERATIONAL_ALERT_TYPES = new Set([
  "SAMPLE_DUE_SOON",
  "SAMPLE_OVERDUE",
]);

function startOfLocalDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function currentOperationalAlert(
  sample: OperationalSample,
  now: Date,
): OperationalAlert | null {
  if (!sample.expectedCompletionDate) return null;

  if (
    String(sample.reportStatus || "")
      .toLowerCase()
      .includes("deliver")
  ) {
    return null;
  }

  const due = startOfLocalDay(
    new Date(sample.expectedCompletionDate),
  );

  if (Number.isNaN(due.getTime())) return null;

  const today = startOfLocalDay(now);
  const daysUntilDue = Math.round(
    (due.getTime() - today.getTime()) / 86_400_000,
  );

  if (daysUntilDue < 0) {
    return {
      type: "SAMPLE_OVERDUE",
      title: "Sample report overdue",
      daysUntilDue,
    };
  }

  if (daysUntilDue <= 2) {
    return {
      type: "SAMPLE_DUE_SOON",
      title: "Sample report due soon",
      daysUntilDue,
    };
  }

  return null;
}

function alertTiming(daysUntilDue: number) {
  if (daysUntilDue < 0) {
    const days = Math.abs(daysUntilDue);
    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }

  if (daysUntilDue === 0) {
    return "due today";
  }

  return `due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;
}

async function syncSampleOperationalAlerts() {
  try {
    const [samplesRaw, companies, notifications] = await Promise.all([
      db.orm.public.Sample.all(),
      db.orm.public.Company.all(),
      db.orm.public.Notification.all(),
    ]);

    const samples = samplesRaw as OperationalSample[];
    const now = new Date();
    const companyMap = new Map(
      companies.map((company) => [company.id, company.name]),
    );

    const operationalNotifications = notifications.filter(
      (notification) =>
        notification.entityType === "Sample" &&
        notification.entityId &&
        OPERATIONAL_ALERT_TYPES.has(notification.type),
    );

    const notificationsBySample = new Map<
      string,
      typeof operationalNotifications
    >();

    for (const notification of operationalNotifications) {
      const sampleId = notification.entityId as string;
      const existing = notificationsBySample.get(sampleId) || [];
      existing.push(notification);
      notificationsBySample.set(sampleId, existing);
    }

    for (const sample of samples) {
      const desiredAlert = currentOperationalAlert(sample, now);
      const existingAlerts = notificationsBySample.get(sample.id) || [];

      /*
       * Automatically close stale operational alerts.
       * Examples:
       * - Due Soon becomes Overdue
       * - Report becomes Delivered
       * - Due date is changed into the future
       */
      for (const notification of existingAlerts) {
        const stillCurrent =
          desiredAlert &&
          notification.type === desiredAlert.type;

        if (!stillCurrent && notification.isRead === false) {
          await db.orm.public.Notification
            .where({ id: notification.id })
            .update({ isRead: true });
        }
      }

      if (!desiredAlert) continue;

      const currentAlert = existingAlerts.find(
        (notification) =>
          notification.type === desiredAlert.type &&
          notification.isRead === false,
      );

      if (currentAlert) continue;

      const companyName =
        companyMap.get(sample.companyId) || "Unknown company";

      await db.orm.public.Notification.create({
        type: desiredAlert.type,
        title: desiredAlert.title,
        message:
          `${companyName} - ${sample.sampleNumber} - ` +
          `${sample.sampleType} - ${alertTiming(desiredAlert.daysUntilDue)}`,
        entityType: "Sample",
        entityId: sample.id,
        actionUrl: `/admin/samples/${sample.id}`,
        isRead: false,
      });
    }
  } catch (error) {
    /* Operational automation must never break the notification bell. */
    console.error("Sample operational alert sync error:", error);
  }
}

async function getUnreadCounts() {
  const [leads, crmNotifications] = await Promise.all([
    db.orm.public.Lead.all(),
    db.orm.public.Notification.all(),
  ]);

  const unreadLeadCount = leads.filter(
    (lead) => lead.isRead === false,
  ).length;

  const unreadGeneralCount = crmNotifications.filter(
    (notification) => notification.isRead === false,
  ).length;

  return {
    unreadLeadCount,
    unreadGeneralCount,
    unreadCount: unreadLeadCount + unreadGeneralCount,
  };
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await syncSampleOperationalAlerts();

    const [leads, crmNotifications] = await Promise.all([
      db.orm.public.Lead
        .orderBy((lead) => lead.createdAt.desc())
        .all(),
      db.orm.public.Notification
        .orderBy((notification) => notification.createdAt.desc())
        .all(),
    ]);

    const leadNotifications: BellNotification[] = leads.map(
      (lead) => ({
        id: lead.id,
        source: "lead",
        type: "NEW_LEAD",
        title: "New website lead",
        message: `${lead.name} - ${lead.company} - ${lead.service}`,
        createdAt: lead.createdAt,
        href: `/admin/leads/${lead.id}`,
        isRead: lead.isRead === true,
      }),
    );

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

    const notifications = [
      ...leadNotifications,
      ...generalNotifications,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 20);

    const unreadLeadCount = leads.filter(
      (lead) => lead.isRead === false,
    ).length;

    const unreadGeneralCount = crmNotifications.filter(
      (notification) => notification.isRead === false,
    ).length;

    return NextResponse.json({
      success: true,
      unreadCount: unreadLeadCount + unreadGeneralCount,
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
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as NotificationPatchBody;

    if (body.markAll === true) {
      const [leads, crmNotifications] = await Promise.all([
        db.orm.public.Lead.all(),
        db.orm.public.Notification.all(),
      ]);

      await Promise.all([
        ...leads
          .filter((lead) => lead.isRead === false)
          .map((lead) =>
            db.orm.public.Lead
              .where({ id: lead.id })
              .update({ isRead: true }),
          ),
        ...crmNotifications
          .filter((notification) => notification.isRead === false)
          .map((notification) =>
            db.orm.public.Notification
              .where({ id: notification.id })
              .update({ isRead: true }),
          ),
      ]);

      return NextResponse.json({
        success: true,
        unreadCount: 0,
        newLeads: 0,
      });
    }

    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required." },
        { status: 400 },
      );
    }

    if (body.source === "notification") {
      const notification = await db.orm.public.Notification
        .where({ id })
        .first();

      if (!notification) {
        return NextResponse.json(
          { success: false, message: "Notification not found." },
          { status: 404 },
        );
      }

      if (notification.isRead === false) {
        await db.orm.public.Notification
          .where({ id })
          .update({ isRead: true });
      }
    } else {
      const lead = await db.orm.public.Lead
        .where({ id })
        .first();

      if (!lead) {
        return NextResponse.json(
          { success: false, message: "Lead notification not found." },
          { status: 404 },
        );
      }

      if (lead.isRead === false) {
        await db.orm.public.Lead
          .where({ id })
          .update({ isRead: true });
      }
    }

    const counts = await getUnreadCounts();

    return NextResponse.json({
      success: true,
      unreadCount: counts.unreadCount,
      newLeads: counts.unreadLeadCount,
    });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update notification." },
      { status: 500 },
    );
  }
}
