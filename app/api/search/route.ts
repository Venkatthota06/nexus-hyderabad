import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  type:
    | "company"
    | "contact"
    | "lead"
    | "quotation"
    | "sample"
    | "report";
  title: string;
  subtitle: string;
  detail: string;
  href: string;
  companyId: string | null;
};

/* =========================================================
   SEARCH NORMALIZATION

   Makes searches such as:
   WeWork
   wework
   we work
   we-work

   behave consistently.
========================================================= */

function normalizeSearchValue(
  value: string | number | null | undefined
) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function matches(
  query: string,
  ...values: Array<string | number | null | undefined>
) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return false;
  }

  return values.some((value) =>
    normalizeSearchValue(value).includes(normalizedQuery)
  );
}

/* =========================================================
   GLOBAL CRM SEARCH
========================================================= */

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);

    const rawQuery =
      searchParams.get("q")?.trim() ?? "";

    if (rawQuery.length < 2) {
      return NextResponse.json({
        query: rawQuery,
        total: 0,
        results: [],
      });
    }

    const query = rawQuery.toLowerCase();

    /* =====================================================
       LOAD CRM DATA
    ===================================================== */

    const [
      companies,
      contacts,
      leads,
      quotations,
      samples,
      reports,
    ] = await Promise.all([
      db.orm.public.Company.all(),
      db.orm.public.Contact.all(),
      db.orm.public.Lead.all(),
      db.orm.public.Quotation.all(),
      db.orm.public.Sample.all(),
      db.orm.public.Report.all(),
    ]);

    /* =====================================================
       LOOKUP MAPS
    ===================================================== */

    const companyMap = new Map(
      companies.map((company) => [
        company.id,
        company,
      ])
    );

    const sampleMap = new Map(
      samples.map((sample) => [
        sample.id,
        sample,
      ])
    );

    const results: SearchResult[] = [];

    /* =====================================================
       COMPANIES
    ===================================================== */

    for (const company of companies) {
      if (
        matches(
          query,
          company.name,
          company.industry,
          company.phone,
          company.email,
          company.website,
          company.address,
          company.city,
          company.state,
          company.source,
          company.status
        )
      ) {
        results.push({
          id: company.id,
          type: "company",
          title: company.name,
          subtitle:
            company.industry || "Company",
          detail: [
            company.city,
            company.state,
          ]
            .filter(Boolean)
            .join(", "),
          href: `/admin/companies/${company.id}`,
          companyId: company.id,
        });
      }
    }

    /* =====================================================
       CONTACTS
    ===================================================== */

    for (const contact of contacts) {
      const company =
        companyMap.get(contact.companyId);

      if (
        matches(
          query,
          contact.name,
          contact.designation,
          contact.phone,
          contact.email,
          contact.linkedin,
          company?.name
        )
      ) {
        results.push({
          id: contact.id,
          type: "contact",
          title: contact.name,
          subtitle:
            contact.designation ||
            "Company Contact",
          detail:
            company?.name ||
            "Unknown Company",
          href: `/admin/companies/${contact.companyId}`,
          companyId: contact.companyId,
        });
      }
    }

    /* =====================================================
       LEADS
    ===================================================== */

    for (const lead of leads) {
      const company = lead.companyId
        ? companyMap.get(lead.companyId)
        : undefined;

      if (
        matches(
          query,
          lead.name,
          lead.company,
          lead.phone,
          lead.email,
          lead.service,
          lead.requirement,
          lead.source,
          lead.status,
          company?.name
        )
      ) {
        results.push({
          id: lead.id,
          type: "lead",
          title: lead.name,
          subtitle: lead.service,
          detail:
            company?.name ||
            lead.company,
          href: lead.companyId
            ? `/admin/companies/${lead.companyId}`
            : `/admin/leads/${lead.id}`,
          companyId:
            lead.companyId ?? null,
        });
      }
    }

    /* =====================================================
       QUOTATIONS
    ===================================================== */

    for (const quotation of quotations) {
      const company =
        companyMap.get(
          quotation.companyId
        );

      if (
        matches(
          query,
          quotation.quotationNumber,
          quotation.service,
          quotation.description,
          quotation.status,
          quotation.notes,
          quotation.totalAmount,
          company?.name
        )
      ) {
        results.push({
          id: quotation.id,
          type: "quotation",
          title:
            quotation.quotationNumber,
          subtitle:
            quotation.service,
          detail:
            company?.name ||
            "Unknown Company",
          href: `/admin/companies/${quotation.companyId}`,
          companyId:
            quotation.companyId,
        });
      }
    }

    /* =====================================================
       SAMPLES
    ===================================================== */

    for (const sample of samples) {
      const company =
        companyMap.get(sample.companyId);

      if (
        matches(
          query,
          sample.sampleNumber,
          sample.sampleType,
          sample.status,
          sample.testingLocation,
          sample.reportStatus,
          sample.collectedBy,
          sample.notes,
          company?.name
        )
      ) {
        results.push({
          id: sample.id,
          type: "sample",
          title: sample.sampleNumber,
          subtitle:
            sample.sampleType,
          detail:
            company?.name ||
            "Unknown Company",
          href: `/admin/companies/${sample.companyId}`,
          companyId:
            sample.companyId,
        });
      }
    }

    /* =====================================================
       REPORTS
    ===================================================== */

    for (const report of reports) {
      const company =
        companyMap.get(report.companyId);

      const sample =
        sampleMap.get(report.sampleId);

      if (
        matches(
          query,
          report.reportNumber,
          report.reportType,
          report.status,
          report.deliveryMethod,
          report.fileReference,
          report.notes,
          company?.name,
          sample?.sampleNumber,
          sample?.sampleType
        )
      ) {
        results.push({
          id: report.id,
          type: "report",
          title:
            report.reportNumber,
          subtitle:
            report.reportType,
          detail:
            company?.name ||
            "Unknown Company",
          href: `/admin/companies/${report.companyId}`,
          companyId:
            report.companyId,
        });
      }
    }

    /* =====================================================
       RETURN RESULTS
    ===================================================== */

    return NextResponse.json({
      query: rawQuery,
      total: results.length,
      results: results.slice(0, 30),
    });
  } catch (error) {
    console.error(
      "CRM search error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to search CRM.",
      },
      {
        status: 500,
      }
    );
  }
}