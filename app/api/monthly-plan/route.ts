import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   GET PLAN ITEMS
========================================================= */

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const rows =
      await db.orm.public.PlanItem
        .orderBy(
          (item) =>
            item.createdAt.desc()
        )
        .all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error(
      "GET monthly plan error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load monthly plan.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE PLAN ITEM
========================================================= */

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

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const companyId =
      typeof body.companyId === "string" &&
      body.companyId.trim()
        ? body.companyId.trim()
        : null;

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Plan title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (companyId) {
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
              "Selected company was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    const item =
      await db.orm.public.PlanItem.create({
        companyId,

        title,

        description:
          typeof body.description ===
            "string" &&
          body.description.trim()
            ? body.description.trim()
            : null,

        category:
          typeof body.category ===
            "string" &&
          body.category.trim()
            ? body.category.trim()
            : "Operations",

        priority:
          typeof body.priority ===
            "string" &&
          body.priority.trim()
            ? body.priority.trim()
            : "Medium",

        status:
          typeof body.status ===
            "string" &&
          body.status.trim()
            ? body.status.trim()
            : "Planned",

        dueDate:
          body.dueDate || null,

        completedAt:
          body.completedAt || null,

        notes:
          typeof body.notes ===
            "string" &&
          body.notes.trim()
            ? body.notes.trim()
            : null,
      });

    return NextResponse.json(
      item,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST monthly plan error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create plan item.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE PLAN ITEM
========================================================= */

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
            "Plan item ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.orm.public.PlanItem
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Plan item not found.",
        },
        {
          status: 404,
        }
      );
    }

    const status =
      typeof body.status === "string"
        ? body.status.trim() ||
          existing.status
        : existing.status;

    const completedAt =
      status.toLowerCase() ===
      "completed"
        ? body.completedAt ||
          existing.completedAt ||
          new Date().toISOString()
        : body.completedAt !==
          undefined
        ? body.completedAt || null
        : null;

    const item =
      await db.orm.public.PlanItem
        .where({
          id,
        })
        .update({
          title:
            typeof body.title ===
              "string"
              ? body.title.trim() ||
                existing.title
              : existing.title,

          description:
            body.description !==
            undefined
              ? typeof body.description ===
                    "string" &&
                  body.description.trim()
                ? body.description.trim()
                : null
              : existing.description,

          category:
            typeof body.category ===
              "string"
              ? body.category.trim() ||
                existing.category
              : existing.category,

          priority:
            typeof body.priority ===
              "string"
              ? body.priority.trim() ||
                existing.priority
              : existing.priority,

          status,

          dueDate:
            body.dueDate !== undefined
              ? body.dueDate || null
              : existing.dueDate,

          completedAt,

          notes:
            body.notes !== undefined
              ? typeof body.notes ===
                    "string" &&
                  body.notes.trim()
                ? body.notes.trim()
                : null
              : existing.notes,
        });

    return NextResponse.json(item);
  } catch (error) {
    console.error(
      "PUT monthly plan error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update plan item.",
      },
      {
        status: 500,
      }
    );
  }
}