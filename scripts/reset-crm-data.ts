import "dotenv/config";
import { db } from "../src/prisma/db";

async function main() {
  console.log("========================================");
  console.log("NEXUS CRM TEST DATA CLEANUP");
  console.log("========================================\n");

  console.log("Deleting CRM records...\n");

  const documents = await db.orm.public.Document
    .where({})
    .deleteAndCount();
  console.log("✓ Documents:", documents);

  const reports = await db.orm.public.Report
    .where({})
    .deleteAndCount();
  console.log("✓ Reports:", reports);

  const samples = await db.orm.public.Sample
    .where({})
    .deleteAndCount();
  console.log("✓ Samples:", samples);

  const payments = await db.orm.public.Payment
    .where({})
    .deleteAndCount();
  console.log("✓ Payments:", payments);

  const quotationItems = await db.orm.public.QuotationItem
    .where({})
    .deleteAndCount();
  console.log("✓ Quotation Items:", quotationItems);

  const workOrders = await db.orm.public.WorkOrder
    .where({})
    .deleteAndCount();
  console.log("✓ Work Orders:", workOrders);

  const quotations = await db.orm.public.Quotation
    .where({})
    .deleteAndCount();
  console.log("✓ Quotations:", quotations);

  const recurringServices = await db.orm.public.RecurringService
    .where({})
    .deleteAndCount();
  console.log("✓ Recurring Services:", recurringServices);

  const locations = await db.orm.public.Location
    .where({})
    .deleteAndCount();
  console.log("✓ Locations:", locations);

  const activities = await db.orm.public.Activity
    .where({})
    .deleteAndCount();
  console.log("✓ Activities:", activities);

  const marketingProspects = await db.orm.public.MarketingProspect
    .where({})
    .deleteAndCount();
  console.log("✓ Marketing Prospects:", marketingProspects);

  const leads = await db.orm.public.Lead
    .where({})
    .deleteAndCount();
  console.log("✓ Leads:", leads);

  const contacts = await db.orm.public.Contact
    .where({})
    .deleteAndCount();
  console.log("✓ Contacts:", contacts);

  const planItems = await db.orm.public.PlanItem
    .where({})
    .deleteAndCount();
  console.log("✓ Plan Items:", planItems);

  const companies = await db.orm.public.Company
    .where({})
    .deleteAndCount();
  console.log("✓ Companies:", companies);

  console.log("\n========================================");
  console.log("CRM CLEANUP COMPLETED");
  console.log("========================================");

  // Final verification
  const remainingCompanies = await db.orm.public.Company.all();
  const remainingLeads = await db.orm.public.Lead.all();
  const remainingSamples = await db.orm.public.Sample.all();

  console.log("\nVerification:");
  console.log("Companies remaining:", remainingCompanies.length);
  console.log("Leads remaining:", remainingLeads.length);
  console.log("Samples remaining:", remainingSamples.length);
}

main().catch((error) => {
  console.error("\n❌ CRM cleanup failed.");
  console.error(error);
  process.exit(1);
});