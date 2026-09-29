import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { db } from "@/src/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an identification sheet.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(uploadedFile.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF, JPG and PNG identification sheets are supported.",
        },
        { status: 400 },
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "The identification sheet must be smaller than 15 MB.",
        },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await uploadedFile.arrayBuffer());

    const fileFingerprint = createHash("sha256")
      .update(bytes)
      .digest("hex");

    const companies = await db.orm.public.Company.orderBy((company) =>
      company.name.asc(),
    ).all();

    const locations = await db.orm.public.Location.orderBy((location) =>
      location.name.asc(),
    ).all();

    /*
      IMPORTANT

      This endpoint already performs:
      - file validation
      - SHA-256 duplicate fingerprint generation
      - CRM company lookup
      - CRM location lookup
      - preview preparation

      Automatic scanned-document extraction will be connected here.

      Until that extraction provider is connected, we deliberately return
      blank editable fields instead of guessing information from the file.
    */

    return NextResponse.json({
      success: true,

      extractionStatus: "manual-review",

      message:
        "File received successfully. Review the detected information before importing.",

      preview: {
        fileName: uploadedFile.name,
        fileFingerprint,

        customerName: "",
        address: "",

        companyId: "",
        companyName: "",

        locationId: "",
        locationName: "",

        collectionDate: "",
        collectionMonth: "",
        collectedBy: "",

        sampleReceivedOn: "",

        samples: [
          {
            rowId: crypto.randomUUID(),
            sampleType: "",
            source: "",
            quantity: 1,
            labCode: "",
          },
        ],

        warnings: [
          "Automatic scanned-sheet extraction is not connected yet. Verify the information before import.",
        ],
      },

      companies: companies.map((company) => ({
        id: company.id,
        name: company.name,
      })),

      locations: locations.map((location) => ({
        id: location.id,
        companyId: location.companyId,
        name: location.name,
        address: location.address,
      })),
    });
  } catch (error) {
    console.error("Identification import preview error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to prepare the identification sheet preview.",
      },
      { status: 500 },
    );
  }
}