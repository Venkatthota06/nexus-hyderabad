import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!companyId || !name) {
      return NextResponse.json(
        {
          error:
            "Company and contact name are required.",
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

    const contact =
      await db.orm.public.Contact.create(
        {
          companyId,

          name,

          designation:
            typeof body.designation ===
            "string"
              ? body.designation.trim() ||
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

          linkedin:
            typeof body.linkedin ===
            "string"
              ? body.linkedin.trim() ||
                null
              : null,

          decisionMaker:
            body.decisionMaker === true,
        }
      );

    return NextResponse.json(
      contact,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create contact:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create contact.",
      },
      {
        status: 500,
      }
    );
  }
}