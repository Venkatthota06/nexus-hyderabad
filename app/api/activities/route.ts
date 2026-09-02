import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

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

    const company =
      await db.orm.public.Company
        .where({
          id: companyId,
        })
        .first();

    if (!company) {
      return NextResponse.json(
        {
          error: "Company not found.",
        },
        {
          status: 404,
        }
      );
    }

    const activity =
      await db.orm.public.Activity.create(
        {
          companyId,

          type,

          title,

          description:
            typeof body.description ===
            "string"
              ? body.description.trim() ||
                null
              : null,

          outcome:
            typeof body.outcome ===
            "string"
              ? body.outcome.trim() ||
                null
              : null,

          activityDate,

          nextAction:
            typeof body.nextAction ===
            "string"
              ? body.nextAction.trim() ||
                null
              : null,

          nextFollowUp:
            typeof body.nextFollowUp ===
              "string" &&
            body.nextFollowUp.trim()
              ? body.nextFollowUp
              : null,
        }
      );

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