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
  const cleaned = cleanString(value);

  return cleaned || null;
}

function nullableDate(value: unknown) {
  const cleaned = cleanString(value);

  return cleaned || null;
}

/* =========================================================
   GET PROSPECTS
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
    const prospects =
      await db.orm.public.MarketingProspect
        .orderBy(
          (prospect) =>
            prospect.createdAt.desc()
        )
        .all();

    return NextResponse.json(
      prospects
    );
  } catch (error) {
    console.error(
      "GET marketing prospects error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load digital marketing prospects.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE PROSPECT
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

    const companyName =
      cleanString(
        body.companyName
      );

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

    const companyId =
      nullableString(
        body.companyId
      );

    /* -----------------------------------------------------
       VERIFY LINKED CRM COMPANY
    ----------------------------------------------------- */

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

    const prospect =
      await db.orm.public.MarketingProspect.create(
        {
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
            cleanString(
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

          converted:
            Boolean(
              body.converted
            ),

          convertedDate:
            Boolean(
              body.converted
            )
              ? nullableDate(
                  body.convertedDate
                ) ||
                new Date().toISOString()
              : null,

          notes:
            nullableString(
              body.notes
            ),
        }
      );

    return NextResponse.json(
      prospect,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE marketing prospect error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create marketing prospect.",
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

    const id =
      cleanString(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Prospect ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.orm.public.MarketingProspect
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Marketing prospect was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const companyName =
      cleanString(
        body.companyName
      );

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

    const companyId =
      nullableString(
        body.companyId
      );

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

    const converted =
      Boolean(
        body.converted
      );

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
            cleanString(
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

          converted,

          convertedDate:
            converted
              ? nullableDate(
                  body.convertedDate
                ) ||
                existing.convertedDate ||
                new Date().toISOString()
              : null,

          notes:
            nullableString(
              body.notes
            ),
        });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(
      "UPDATE marketing prospect error:",
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