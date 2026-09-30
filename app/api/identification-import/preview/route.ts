import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { db } from "@/src/prisma/db";
import {
  findBestCompanyMatch,
  findBestLocationMatch,
  getCollectionMonth,
} from "@/src/lib/identification-import";
import { extractIdentificationSheet } from "@/src/lib/identification-extraction";

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
        { success: false, message: "Please select an identification sheet." },
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
    const fileFingerprint = createHash("sha256").update(bytes).digest("hex");

    const companies = await db.orm.public.Company.orderBy((company) =>
      company.name.asc(),
    ).all();

    const locations = await db.orm.public.Location.orderBy((location) =>
      location.name.asc(),
    ).all();

    let extracted = null;
    const fallbackWarnings: string[] = [];

    try {
     extracted = await extractIdentificationSheet({
  bytes,
  mimeType: uploadedFile.type,
  fileName: uploadedFile.name,
});
    } catch (error) {
      console.error("Free identification OCR error:", error);
      fallbackWarnings.push(
        "Free OCR could not process this file. Manual review is available and no data was saved.",
      );
    }

    const customerName = extracted?.customerName || "";
    const address = extracted?.address || "";

    const matchedCompany = customerName
      ? findBestCompanyMatch(customerName, companies)
      : null;

    const matchedLocation = matchedCompany
      ? findBestLocationMatch({
          companyId: matchedCompany.id,
          locationName: extracted?.locationName || "",
          address,
          locations,
        })
      : null;

    const collectionDate = extracted?.collectionDate || "";
    const extractedSamples = extracted?.samples || [];

    return NextResponse.json({
      success: true,
      extractionStatus: extracted ? "extracted" : "manual-review",
      message:
        "File processed. Review every detected value before importing.",
      preview: {
        fileName: uploadedFile.name,
        fileFingerprint,

        customerName,
        address,

        companyId: matchedCompany?.id || "",
        companyName: matchedCompany?.name || "",

        locationId: matchedLocation?.id || "",
        locationName:
          matchedLocation?.name || extracted?.locationName || "",

        collectionDate,
        collectionMonth: getCollectionMonth(collectionDate),
        collectedBy: extracted?.collectedBy || "",

        sampleReceivedOn: extracted?.sampleReceivedOn || "",

        samples:
          extractedSamples.length > 0
            ? extractedSamples.map((sample) => ({
                rowId: crypto.randomUUID(),
                sampleType: sample.sampleType,
                source: sample.source,
                quantity: sample.quantity,
                labCode: sample.labCode,
              }))
            : [
                {
                  rowId: crypto.randomUUID(),
                  sampleType: "",
                  source: "",
                  quantity: 1,
                  labCode: "",
                },
              ],

        warnings: [
          ...(extracted?.warnings || []),
          ...fallbackWarnings,
          ...(!matchedCompany && customerName
            ? ["Customer name was read but not safely matched to a CRM company. Select the company manually."]
            : []),
          ...(matchedCompany && !matchedLocation
            ? ["Location was not safely matched. Select the correct location before import."]
            : []),
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
