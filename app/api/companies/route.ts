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
    const companies =
      await db.orm.public.Company
        .orderBy(
          (company) =>
            company.createdAt.desc()
        )
        .all();

    return NextResponse.json(
      companies
    );
  } catch (error) {
    console.error(
      "Failed to fetch companies:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch companies.",
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Company name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const company =
      await db.orm.public.Company.create(
        {
          name,

          industry:
            typeof body.industry ===
            "string"
              ? body.industry.trim() ||
                null
              : null,

          website:
            typeof body.website ===
            "string"
              ? body.website.trim() ||
                null
              : null,

          phone:
            typeof body.phone ===
            "string"
              ? body.phone.trim() ||
                null
              : null,

          email:
            typeof body.email ===
            "string"
              ? body.email.trim() ||
                null
              : null,

          address:
            typeof body.address ===
            "string"
              ? body.address.trim() ||
                null
              : null,

          city:
            typeof body.city ===
            "string"
              ? body.city.trim() ||
                null
              : null,

          state:
            typeof body.state ===
            "string"
              ? body.state.trim() ||
                null
              : null,

          source:
            typeof body.source ===
            "string"
              ? body.source.trim() ||
                null
              : null,

          status:
            typeof body.status ===
              "string" &&
            body.status.trim()
              ? body.status.trim()
              : "Prospect",
        }
      );

    return NextResponse.json(
      company,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create company:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create company.",
      },
      {
        status: 500,
      }
    );
  }
}