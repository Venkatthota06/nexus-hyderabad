import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

/* =========================================================
   GET LOCATIONS
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
    const companyId = url.searchParams.get("companyId");

    if (companyId) {
      const locations =
        await db.orm.public.Location
          .where({
            companyId,
          })
          .orderBy(
            (location) =>
              location.createdAt.desc()
          )
          .all();

      return NextResponse.json(locations);
    }

    const locations =
      await db.orm.public.Location
        .orderBy(
          (location) =>
            location.createdAt.desc()
        )
        .all();

    return NextResponse.json(locations);
  } catch (error) {
    console.error(
      "GET locations error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load locations.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE LOCATION
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

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

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Location name is required.",
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

    const location =
      await db.orm.public.Location.create({
        companyId,

        name,

        address:
          typeof body.address === "string" &&
          body.address.trim()
            ? body.address.trim()
            : null,

        city:
          typeof body.city === "string" &&
          body.city.trim()
            ? body.city.trim()
            : null,

        state:
          typeof body.state === "string" &&
          body.state.trim()
            ? body.state.trim()
            : null,

        contactName:
          typeof body.contactName ===
            "string" &&
          body.contactName.trim()
            ? body.contactName.trim()
            : null,

        phone:
          typeof body.phone === "string" &&
          body.phone.trim()
            ? body.phone.trim()
            : null,

        email:
          typeof body.email === "string" &&
          body.email.trim()
            ? body.email.trim()
            : null,

        status:
          typeof body.status === "string" &&
          body.status.trim()
            ? body.status.trim()
            : "Active",

        notes:
          typeof body.notes === "string" &&
          body.notes.trim()
            ? body.notes.trim()
            : null,
      });

    return NextResponse.json(
      location,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST location error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create location.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE LOCATION
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
            "Location ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.orm.public.Location
        .where({
          id,
        })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Location not found.",
        },
        {
          status: 404,
        }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existing.name;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Location name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const location =
      await db.orm.public.Location
        .where({
          id,
        })
        .update({
          name,

          address:
            body.address !== undefined
              ? typeof body.address ===
                    "string" &&
                  body.address.trim()
                ? body.address.trim()
                : null
              : existing.address,

          city:
            body.city !== undefined
              ? typeof body.city ===
                    "string" &&
                  body.city.trim()
                ? body.city.trim()
                : null
              : existing.city,

          state:
            body.state !== undefined
              ? typeof body.state ===
                    "string" &&
                  body.state.trim()
                ? body.state.trim()
                : null
              : existing.state,

          contactName:
            body.contactName !== undefined
              ? typeof body.contactName ===
                    "string" &&
                  body.contactName.trim()
                ? body.contactName.trim()
                : null
              : existing.contactName,

          phone:
            body.phone !== undefined
              ? typeof body.phone ===
                    "string" &&
                  body.phone.trim()
                ? body.phone.trim()
                : null
              : existing.phone,

          email:
            body.email !== undefined
              ? typeof body.email ===
                    "string" &&
                  body.email.trim()
                ? body.email.trim()
                : null
              : existing.email,

          status:
            typeof body.status === "string"
              ? body.status.trim() ||
                existing.status
              : existing.status,

          notes:
            body.notes !== undefined
              ? typeof body.notes ===
                    "string" &&
                  body.notes.trim()
                ? body.notes.trim()
                : null
              : existing.notes,
        });

    return NextResponse.json(location);
  } catch (error) {
    console.error(
      "PUT location error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update location.",
      },
      {
        status: 500,
      }
    );
  }
}