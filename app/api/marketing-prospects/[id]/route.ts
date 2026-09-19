import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function nullableString(value: unknown) {
  const valueString = cleanString(value);

  return valueString || null;
}

function nullableDate(value: unknown) {
  const valueString = cleanString(value);

  return valueString || null;
}

/* =========================================================
   GET ONE PROSPECT
========================================================= */

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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
    const { id } = await context.params;

    const prospect =
      await db.orm.public.MarketingProspect
        .where({
          id,
        })
        .first();

    if (!prospect) {
      return NextResponse.json(
        {
          error: "Marketing prospect not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error(
      "GET marketing prospect error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load marketing prospect.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE PROSPECT
========================================================= */

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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
    const { id } = await context.params;

    const existing =
      await db.orm.public.MarketingProspect
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error: "Marketing prospect not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const companyName =
      cleanString(body.companyName);

    if (!companyName) {
      return NextResponse.json(
        {
          error:
            "Company / prospect name is required.",
        },
        {
          status: 400,
        }
      );
    }

    let companyId =
      nullableString(body.companyId);

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
              "Selected CRM company was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    const updated =
      await db.orm.public.MarketingProspect
        .where({
          id,
        })
        .update({
          companyId,

          companyName,

          contactName:
            nullableString(
              body.contactName
            ),

          designation:
            nullableString(
              body.designation
            ),

          linkedin:
            nullableString(
              body.linkedin
            ),

          email:
            nullableString(
              body.email
            ),

          phone:
            nullableString(
              body.phone
            ),

          industry:
            nullableString(
              body.industry
            ),

          source:
            cleanString(
              body.source
            ) || "LinkedIn",

          targetService:
            nullableString(
              body.targetService
            ),

          outreachStatus:
            existing.converted
              ? "Converted"
              : cleanString(
                  body.outreachStatus
                ) || "Identified",

          priority:
            cleanString(
              body.priority
            ) || "Medium",

          lastContacted:
            nullableDate(
              body.lastContacted
            ),

          nextFollowUp:
            nullableDate(
              body.nextFollowUp
            ),

          notes:
            nullableString(
              body.notes
            ),
        });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "UPDATE prospect error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update marketing prospect.",
      },
      {
        status: 500,
      }
    );
  }
}