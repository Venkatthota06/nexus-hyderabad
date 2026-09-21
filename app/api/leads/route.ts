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

  // Honeypot field
  website?: string;

  source?: string;
  status?: string;
  notes?: string;
  nextFollowUp?: string;
};

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
  /^[0-9+\-()\s]{7,20}$/;

/* =========================================================
   NOTIFICATION HELPERS
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

async function createLeadNotification({
  leadId,
  leadName,
  companyName,
  service,
  status,
  nextFollowUp,
  statusChanged,
  followUpChanged,
}: {
  leadId: string;
  leadName: string;
  companyName: string;
  service: string;
  status: string;
  nextFollowUp: string | null;
  statusChanged: boolean;
  followUpChanged: boolean;
}) {
  try {
    let type =
      "LEAD_UPDATED";

    let title =
      "Lead updated";

    let message =
      `${leadName} - ${companyName} - ` +
      `${service}`;

    /*
     * Both lead status and follow-up changed
     * in the same update.
     */
    if (
      statusChanged &&
      followUpChanged &&
      nextFollowUp
    ) {
      type =
        "LEAD_STATUS_AND_FOLLOW_UP_CHANGED";

      title =
        "Lead status & follow-up updated";

      message =
        `${leadName} - ${companyName} - ` +
        `${status} - Follow-up ${formatFollowUpDate(
          nextFollowUp
        )}`;
    }

    /*
     * Only the follow-up changed.
     */
    else if (
      followUpChanged &&
      nextFollowUp
    ) {
      type =
        "FOLLOW_UP_SCHEDULED";

      title =
        "Lead follow-up scheduled";

      message =
        `${leadName} - ${companyName} - ` +
        `${formatFollowUpDate(
          nextFollowUp
        )}`;
    }

    /*
     * Follow-up was removed.
     */
    else if (
      followUpChanged &&
      !nextFollowUp
    ) {
      type =
        "FOLLOW_UP_CLEARED";

      title =
        "Lead follow-up cleared";

      message =
        `${leadName} - ${companyName} - ` +
        `${status}`;
    }

    /*
     * Only the lead status changed.
     */
    else if (statusChanged) {
      type =
        "LEAD_STATUS_CHANGED";

      title =
        `Lead status: ${status}`;

      message =
        `${leadName} - ${companyName} - ` +
        `${service}`;
    }

    await db.orm.public.Notification.create({
      type,
      title,
      message,
      entityType: "Lead",
      entityId: leadId,
      actionUrl:
        `/admin/leads/${leadId}`,
      isRead: false,
    });
  } catch (error) {
    /*
     * Notification failure must never cause
     * the lead update itself to fail.
     */
    console.error(
      "Lead notification creation error:",
      error
    );
  }
}

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

    return NextResponse.json(
      leads
    );
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
    /* -----------------------------------------------------
       REQUEST SIZE PROTECTION
    ----------------------------------------------------- */

    const contentLength =
      request.headers.get(
        "content-length"
      );

    if (
      contentLength &&
      Number(contentLength) > 10_000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Submission is too large.",
        },
        { status: 413 }
      );
    }

    const body: LeadRequestBody =
      await request.json();

    /* -----------------------------------------------------
       HONEYPOT BOT PROTECTION
    ----------------------------------------------------- */

    const honeypot =
      body.website?.trim() ?? "";

    if (honeypot) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Enquiry submitted successfully.",
        },
        { status: 200 }
      );
    }

    /* -----------------------------------------------------
       NORMALISE PUBLIC FORM DATA
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       REQUIRED FIELD VALIDATION
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       LENGTH VALIDATION
    ----------------------------------------------------- */

    if (
      name.length > 100 ||
      company.length > 150 ||
      phone.length > 20 ||
      email.length > 254 ||
      service.length > 100 ||
      requirement.length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more fields are too long.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       EMAIL VALIDATION
    ----------------------------------------------------- */

    if (
      !EMAIL_REGEX.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       PHONE VALIDATION
    ----------------------------------------------------- */

    if (
      !PHONE_REGEX.test(phone)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid phone number.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       CREATE VERIFIED PUBLIC LEAD
    ----------------------------------------------------- */

    const lead =
      await db.orm.public.Lead.create({
        name,
        company,
        companyId: null,
        phone,
        email,
        service,
        requirement,

        // Public website source
        source:
          "Nexus Hyderabad Website",

        // CRM pipeline status
        status:
          "New Lead",

        /*
         * Phase-1 notification system.
         *
         * Keep this exactly as the source of
         * website lead notifications.
         *
         * We intentionally DO NOT create a
         * Notification table record here,
         * otherwise the same website enquiry
         * would appear twice in the bell.
         */
        isRead: false,

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
  const session =
    await auth();

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

    /* =====================================================
       EXISTING LEAD
    ===================================================== */

    const existingLead =
      await db.orm.public.Lead
        .where({
          id,
        })
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

    /* =====================================================
       STATUS / NOTES / FOLLOW-UP
    ===================================================== */

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
      body.companyId !== undefined
    ) {
      const requestedCompanyId =
        body.companyId?.trim() ||
        null;

      if (requestedCompanyId) {
        const company =
          await db.orm.public.Company
            .where({
              id:
                requestedCompanyId,
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

    /* =====================================================
       TERMINAL LEAD STATUS
    ===================================================== */

    /*
     * Won / Lost leads should not keep an
     * active follow-up.
     */
    if (
      status === "Won" ||
      status === "Lost"
    ) {
      nextFollowUp = null;
    }

    /* =====================================================
       DETECT MEANINGFUL CHANGES
    ===================================================== */

    const statusChanged =
      existingLead.status !==
      status;

    const oldFollowUp =
      normalizeDateValue(
        existingLead.nextFollowUp
      );

    const newFollowUp =
      normalizeDateValue(
        nextFollowUp
      );

    const followUpChanged =
      oldFollowUp !==
      newFollowUp;

    /* =====================================================
       UPDATE LEAD
    ===================================================== */

    const updatedLead =
      await db.orm.public.Lead
        .where({
          id,
        })
        .update({
          status,
          notes,
          nextFollowUp,
          companyId,
        });

    /* =====================================================
       CREATE PHASE-2 NOTIFICATION
    ===================================================== */

    if (
      statusChanged ||
      followUpChanged
    ) {
      /*
       * Prefer the linked CRM Company name
       * when the lead has been associated
       * with a Company record.
       */
      let companyName =
        existingLead.company;

      if (companyId) {
        try {
          const linkedCompany =
            await db.orm.public.Company
              .where({
                id: companyId,
              })
              .first();

          if (linkedCompany?.name) {
            companyName =
              linkedCompany.name;
          }
        } catch (error) {
          console.error(
            "Lead company lookup for notification error:",
            error
          );
        }
      }

      await createLeadNotification({
        leadId: id,

        leadName:
          existingLead.name,

        companyName,

        service:
          existingLead.service,

        status,

        nextFollowUp,

        statusChanged,
        followUpChanged,
      });
    }

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