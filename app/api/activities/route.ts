import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function normalizeDateValue(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
}

function formatFollowUpDate(
  value: string
) {
  const normalized =
    normalizeDateValue(value);

  if (!normalized) {
    return value;
  }

  const [year, month, day] =
    normalized.split("-").map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return normalized;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

/* =========================================================
   NOTIFICATION HELPER
========================================================= */

async function createActivityFollowUpNotification({
  activityId,
  companyName,
  activityTitle,
  activityType,
  nextAction,
  nextFollowUp,
}: {
  activityId: string;
  companyName: string;
  activityTitle: string;
  activityType: string;
  nextAction: string | null;
  nextFollowUp: string;
}) {
  try {
    const actionText =
      nextAction || activityType;

    await db.orm.public.Notification.create({
      type: "FOLLOW_UP_SCHEDULED",

      title:
        "Activity follow-up scheduled",

      message:
        `${companyName} - ${activityTitle} - ` +
        `${actionText} - ${formatFollowUpDate(
          nextFollowUp
        )}`,

      entityType: "Activity",
      entityId: activityId,

      /*
       * The Follow-ups page itself sends
       * Activity items to the related Company.
       * Keep notification navigation consistent.
       */
      actionUrl:
        `/admin/companies/${activityId}`,

      isRead: false,
    });
  } catch (error) {
    /*
     * Notification failure must never cause
     * activity creation itself to fail.
     */
    console.error(
      "Activity follow-up notification error:",
      error
    );
  }
}

/* =========================================================
   GET
========================================================= */

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const activities =
      await db.orm.public.Activity
        .orderBy(
          (activity) =>
            activity.activityDate.desc()
        )
        .all();

    return NextResponse.json(
      activities
    );
  } catch (error) {
    console.error(
      "Failed to fetch activities:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch activities.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await request.json();

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const activityDate =
      typeof body.activityDate === "string"
        ? body.activityDate.trim()
        : "";

    if (
      !companyId ||
      !type ||
      !title ||
      !activityDate
    ) {
      return NextResponse.json(
        {
          error:
            "Company, activity type, title, and activity date are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       COMPANY VALIDATION
    ===================================================== */

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

    /* =====================================================
       OPTIONAL VALUES
    ===================================================== */

    const description =
      typeof body.description ===
        "string"
        ? body.description.trim() ||
          null
        : null;

    const outcome =
      typeof body.outcome ===
        "string"
        ? body.outcome.trim() ||
          null
        : null;

    const nextAction =
      typeof body.nextAction ===
        "string"
        ? body.nextAction.trim() ||
          null
        : null;

    const nextFollowUp =
      typeof body.nextFollowUp ===
        "string" &&
      body.nextFollowUp.trim()
        ? body.nextFollowUp
        : null;

    /* =====================================================
       CREATE ACTIVITY
    ===================================================== */

    const activity =
      await db.orm.public.Activity.create({
        companyId,

        type,

        title,

        description,

        outcome,

        activityDate,

        nextAction,

        nextFollowUp,
      });

    /* =====================================================
       FOLLOW-UP NOTIFICATION
    ===================================================== */

    if (nextFollowUp) {
      await createActivityFollowUpNotification({
        activityId:
          activity.id,

        companyName:
          company.name,

        activityTitle:
          title,

        activityType:
          type,

        nextAction,

        nextFollowUp,
      });
    }

    return NextResponse.json(
      activity,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create activity:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create activity.",
      },
      {
        status: 500,
      }
    );
  }
}