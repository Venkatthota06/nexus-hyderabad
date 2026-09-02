import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const runtime = "nodejs";

type LeadRequestBody = {
  id?: string;
  name?: string;
  company?: string;
  companyId?: string | null;
  phone?: string;
  email?: string;
  service?: string;
  requirement?: string;
  source?: string;
  status?: string;
  notes?: string;
  nextFollowUp?: string;
};

/* =========================================================
   GET ALL LEADS - ADMIN ONLY
========================================================= */

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
    const leads =
      await db.orm.public.Lead
        .orderBy(
          (lead) =>
            lead.createdAt.desc()
        )
        .all();

    return NextResponse.json(leads);
  } catch (error) {
    console.error(
      "GET /api/leads error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load leads.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   CREATE LEAD - PUBLIC WEBSITE FORM
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const body: LeadRequestBody =
      await request.json();

    const name =
      body.name?.trim() ?? "";

    const company =
      body.company?.trim() ?? "";

    const phone =
      body.phone?.trim() ?? "";

    const email =
      body.email
        ?.trim()
        .toLowerCase() ?? "";

    const service =
      body.service?.trim() ?? "";

    const requirement =
      body.requirement?.trim() ?? "";

    const source =
      body.source?.trim() ||
      "Nexus Hyderabad Website";

    if (
      !name ||
      !company ||
      !phone ||
      !email ||
      !service ||
      !requirement
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const lead =
      await db.orm.public.Lead.create({
        name,
        company,
        companyId: null,
        phone,
        email,
        service,
        requirement,
        source,
        status: "New Lead",
        notes: null,
        nextFollowUp: null,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Lead saved successfully.",
        lead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/leads error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save lead.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   UPDATE LEAD - ADMIN ONLY
========================================================= */

export async function PUT(
  request: Request
) {
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
    const body: LeadRequestBody =
      await request.json();

    const id =
      body.id?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lead ID is required.",
        },
        { status: 400 }
      );
    }

    const existingLead =
      await db.orm.public.Lead
        .where({ id })
        .first();

    if (!existingLead) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lead not found.",
        },
        { status: 404 }
      );
    }

    const status =
      body.status?.trim() ||
      existingLead.status;

    const notes =
      body.notes !== undefined
        ? body.notes.trim() ||
          null
        : existingLead.notes;

    let nextFollowUp =
      body.nextFollowUp !== undefined
        ? body.nextFollowUp.trim() ||
          null
        : existingLead.nextFollowUp;

    /* =====================================================
       COMPANY RELATION
    ===================================================== */

    let companyId =
      existingLead.companyId;

    if (
      body.companyId !==
      undefined
    ) {
      const requestedCompanyId =
        body.companyId?.trim() ||
        null;

      if (requestedCompanyId) {
        const company =
          await db.orm.public.Company
            .where({
              id: requestedCompanyId,
            })
            .first();

        if (!company) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Selected company was not found.",
            },
            { status: 404 }
          );
        }

        companyId =
          requestedCompanyId;
      } else {
        companyId = null;
      }
    }

    /* Won / Lost should not have
       an active follow-up */

    if (
      status === "Won" ||
      status === "Lost"
    ) {
      nextFollowUp = null;
    }

    const updatedLead =
      await db.orm.public.Lead
        .where({ id })
        .update({
          status,
          notes,
          nextFollowUp,
          companyId,
        });

    return NextResponse.json({
      success: true,
      message:
        "Lead updated successfully.",
      lead: updatedLead,
    });
  } catch (error) {
    console.error(
      "PUT /api/leads error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update lead.",
      },
      { status: 500 }
    );
  }
}