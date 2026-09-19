import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   GET RECURRING SERVICES
========================================================= */

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);

    const companyId =
      url.searchParams.get("companyId");

    if (companyId) {
      const services =
        await db.orm.public.RecurringService
          .where({
            companyId,
          })
          .orderBy(
            (service) =>
              service.createdAt.desc()
          )
          .all();

      return NextResponse.json(services);
    }

    const services =
      await db.orm.public.RecurringService
        .orderBy(
          (service) =>
            service.createdAt.desc()
        )
        .all();

    return NextResponse.json(services);
  } catch (error) {
    console.error(
      "GET recurring services error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load recurring services.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE RECURRING SERVICE
========================================================= */

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const companyId =
      typeof body.companyId === "string"
        ? body.companyId.trim()
        : "";

    const locationId =
      typeof body.locationId === "string" &&
      body.locationId.trim()
        ? body.locationId.trim()
        : null;

    const service =
      typeof body.service === "string"
        ? body.service.trim()
        : "";

    const sampleType =
      typeof body.sampleType === "string"
        ? body.sampleType.trim()
        : "";

    const samplesPerMonth =
      Number(body.samplesPerMonth);

    if (!companyId) {
      return NextResponse.json(
        {
          error:
            "Company is required.",
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
            "Service is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!sampleType) {
      return NextResponse.json(
        {
          error:
            "Sample type is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(samplesPerMonth) ||
      samplesPerMonth < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Samples per month must be at least 1.",
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
          error:
            "Selected company was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (locationId) {
      const location =
        await db.orm.public.Location
          .where({
            id: locationId,
          })
          .first();

      if (!location) {
        return NextResponse.json(
          {
            error:
              "Selected location was not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        location.companyId !== companyId
      ) {
        return NextResponse.json(
          {
            error:
              "Selected location does not belong to this client.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const recurringService =
      await db.orm.public.RecurringService.create({
        companyId,
        locationId,

        service,
        sampleType,

        samplesPerMonth,

        frequency:
          typeof body.frequency ===
            "string" &&
          body.frequency.trim()
            ? body.frequency.trim()
            : "Monthly",

        status:
          typeof body.status === "string" &&
          body.status.trim()
            ? body.status.trim()
            : "Active",

        startDate:
          body.startDate || null,

        endDate:
          body.endDate || null,

        notes:
          typeof body.notes === "string" &&
          body.notes.trim()
            ? body.notes.trim()
            : null,
      });

    return NextResponse.json(
      recurringService,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST recurring service error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create recurring service.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE RECURRING SERVICE
========================================================= */

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Recurring service ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.orm.public.RecurringService
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Recurring service not found.",
        },
        {
          status: 404,
        }
      );
    }

    const locationId =
      body.locationId !== undefined
        ? typeof body.locationId ===
              "string" &&
          body.locationId.trim()
          ? body.locationId.trim()
          : null
        : existing.locationId;

    if (locationId) {
      const location =
        await db.orm.public.Location
          .where({
            id: locationId,
          })
          .first();

      if (!location) {
        return NextResponse.json(
          {
            error:
              "Selected location was not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        location.companyId !==
        existing.companyId
      ) {
        return NextResponse.json(
          {
            error:
              "Selected location does not belong to this client.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const samplesPerMonth =
      body.samplesPerMonth !== undefined
        ? Number(body.samplesPerMonth)
        : existing.samplesPerMonth;

    if (
      !Number.isFinite(samplesPerMonth) ||
      samplesPerMonth < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Samples per month must be at least 1.",
        },
        {
          status: 400,
        }
      );
    }

    const recurringService =
      await db.orm.public.RecurringService
        .where({
          id,
        })
        .update({
          locationId,

          service:
            typeof body.service === "string"
              ? body.service.trim() ||
                existing.service
              : existing.service,

          sampleType:
            typeof body.sampleType ===
            "string"
              ? body.sampleType.trim() ||
                existing.sampleType
              : existing.sampleType,

          samplesPerMonth,

          frequency:
            typeof body.frequency ===
            "string"
              ? body.frequency.trim() ||
                existing.frequency
              : existing.frequency,

          status:
            typeof body.status === "string"
              ? body.status.trim() ||
                existing.status
              : existing.status,

          startDate:
            body.startDate !== undefined
              ? body.startDate || null
              : existing.startDate,

          endDate:
            body.endDate !== undefined
              ? body.endDate || null
              : existing.endDate,

          notes:
            body.notes !== undefined
              ? typeof body.notes ===
                    "string" &&
                  body.notes.trim()
                ? body.notes.trim()
                : null
              : existing.notes,
        });

    return NextResponse.json(
      recurringService
    );
  } catch (error) {
    console.error(
      "PUT recurring service error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update recurring service.",
      },
      {
        status: 500,
      }
    );
  }
}