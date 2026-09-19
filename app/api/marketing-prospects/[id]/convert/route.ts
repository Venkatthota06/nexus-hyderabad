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

/* =========================================================
   CONVERT MARKETING PROSPECT → CRM LEAD
========================================================= */

export async function POST(
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

    /* -----------------------------------------------------
       LOAD PROSPECT
    ----------------------------------------------------- */

    const prospect =
      await db.orm.public.MarketingProspect
        .where({
          id,
        })
        .first();

    if (!prospect) {
      return NextResponse.json(
        {
          error:
            "Marketing prospect not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------------------------------
       PREVENT DUPLICATE CONVERSION
    ----------------------------------------------------- */

    if (
      prospect.converted ||
      prospect.leadId
    ) {
      return NextResponse.json(
        {
          error:
            "This prospect has already been converted.",
          leadId:
            prospect.leadId,
          companyId:
            prospect.companyId,
        },
        {
          status: 409,
        }
      );
    }

    const body =
      await request.json();

    /* -----------------------------------------------------
       REQUIRED LEAD FIELDS
    ----------------------------------------------------- */

    const contactName =
      cleanString(
        body.contactName
      );

    const companyName =
      cleanString(
        body.companyName
      );

    const phone =
      cleanString(
        body.phone
      );

    const email =
      cleanString(
        body.email
      );

    const service =
      cleanString(
        body.service
      );

    const requirement =
      cleanString(
        body.requirement
      );

    if (!contactName) {
      return NextResponse.json(
        {
          error:
            "Contact person name is required before conversion.",
        },
        {
          status: 400,
        }
      );
    }

    if (!companyName) {
      return NextResponse.json(
        {
          error:
            "Company name is required before conversion.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Phone number is required before conversion.",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Email address is required before conversion.",
        },
        {
          status: 400,
        }
      );
    }

    if (!service) {
      return NextResponse.json(
        {
          error:
            "Required testing service is required before conversion.",
        },
        {
          status: 400,
        }
      );
    }

    if (!requirement) {
      return NextResponse.json(
        {
          error:
            "Client requirement is required before conversion.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       FIND OR CREATE COMPANY
    ----------------------------------------------------- */

    let companyId =
      cleanString(
        body.companyId
      ) ||
      prospect.companyId ||
      "";

    let companyRecord:
      any = null;

    if (companyId) {
      companyRecord =
        await db.orm.public.Company
          .where({
            id: companyId,
          })
          .first();

      if (!companyRecord) {
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
    } else {
      companyRecord =
        await db.orm.public.Company.create(
          {
            name:
              companyName,

            industry:
              prospect.industry,

            phone,

            email,

            source:
              `Digital Marketing - ${prospect.source}`,

            status:
              "Prospect",
          }
        );

      companyId =
        companyRecord.id;
    }

    /* -----------------------------------------------------
       CREATE CONTACT IF NEEDED
    ----------------------------------------------------- */

    const existingContact =
      await db.orm.public.Contact
        .where({
          companyId,
          name: contactName,
        })
        .first();

    if (!existingContact) {
      await db.orm.public.Contact.create(
        {
          companyId,

          name:
            contactName,

          designation:
            prospect.designation,

          phone,

          email,

          linkedin:
            prospect.linkedin,

          decisionMaker:
            true,
        }
      );
    }

    /* -----------------------------------------------------
       CREATE CRM LEAD
    ----------------------------------------------------- */

    const lead =
      await db.orm.public.Lead.create(
        {
          companyId,

          name:
            contactName,

          company:
            companyName,

          phone,

          email,

          service,

          requirement,

          source:
            `Digital Marketing - ${prospect.source}`,

          status:
            "New Lead",

          isRead:
            false,

          notes:
            nullableString(
              body.notes
            ) ||
            prospect.notes,

          nextFollowUp:
            prospect.nextFollowUp,
        }
      );

    /* -----------------------------------------------------
       MARK PROSPECT CONVERTED
    ----------------------------------------------------- */

    await db.orm.public.MarketingProspect
      .where({
        id,
      })
      .update({
        companyId,

        leadId:
          lead.id,

        companyName,

        contactName,

        email,

        phone,

        targetService:
          service,

        converted:
          true,

        convertedDate:
          new Date().toISOString(),

        outreachStatus:
          "Converted",
      });

    /* -----------------------------------------------------
       CREATE ACTIVITY HISTORY
    ----------------------------------------------------- */

    await db.orm.public.Activity.create(
      {
        companyId,

        type:
          "Digital Marketing",

        title:
          "Prospect converted to CRM lead",

        description:
          `${contactName} from ${companyName} was converted from the Digital Marketing pipeline into a CRM lead.`,

        outcome:
          "CRM Lead Created",

        activityDate:
          new Date().toISOString(),

        nextAction:
          prospect.nextFollowUp
            ? "Follow up with lead"
            : null,

        nextFollowUp:
          prospect.nextFollowUp,
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Prospect converted successfully.",

        leadId:
          lead.id,

        companyId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Convert marketing prospect error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to convert prospect to CRM lead.",
      },
      {
        status: 500,
      }
    );
  }
}