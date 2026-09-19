import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

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
   GET DOCUMENTS
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
    const documents =
      await db.orm.public.Document
        .orderBy(
          (document) =>
            document.createdAt.desc()
        )
        .all();

    return NextResponse.json(
      documents
    );
  } catch (error) {
    console.error(
      "GET documents error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load documents.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE DOCUMENT
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

    const title =
      cleanString(
        body.title
      );

    const documentType =
      cleanString(
        body.documentType
      );

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Document title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        {
          error:
            "Document type is required.",
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
              "Selected company was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    const document =
      await db.orm.public.Document.create(
        {
          companyId,

          quotationId:
            nullableString(
              body.quotationId
            ),

          workOrderId:
            nullableString(
              body.workOrderId
            ),

          sampleId:
            nullableString(
              body.sampleId
            ),

          reportId:
            nullableString(
              body.reportId
            ),

          paymentId:
            nullableString(
              body.paymentId
            ),

          title,

          documentType,

          documentNumber:
            nullableString(
              body.documentNumber
            ),

          description:
            nullableString(
              body.description
            ),

          fileName:
            nullableString(
              body.fileName
            ),

          fileUrl:
            nullableString(
              body.fileUrl
            ),

          fileReference:
            nullableString(
              body.fileReference
            ),

          mimeType:
            nullableString(
              body.mimeType
            ),

          status:
            cleanString(
              body.status
            ) || "Active",

          issueDate:
            nullableDate(
              body.issueDate
            ),

          expiryDate:
            nullableDate(
              body.expiryDate
            ),

          notes:
            nullableString(
              body.notes
            ),
        }
      );

    return NextResponse.json(
      document,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE document error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create document.",
      },
      {
        status: 500,
      }
    );
  }
}