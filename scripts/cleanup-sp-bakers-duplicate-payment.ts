import { db } from "../src/prisma/db";

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

async function main() {
  console.log("");
  console.log("SP BAKERS — DUPLICATE PAYMENT CLEANUP");
  console.log("==============================================");

  const companies = await db.orm.public.Company.all();
  const company = companies.find(
    (row) =>
      normalize(row.name) ===
      normalize("Sri Praneetha Bakers, Juice & Tea (SP Bakers)")
  );

  if (!company) {
    throw new Error("SP Bakers company was not found.");
  }

  const quotations = await db.orm.public.Quotation.all();
  const quotation = quotations.find(
    (row) =>
      row.companyId === company.id &&
      normalize(row.quotationNumber) ===
        normalize("NTL/W/A/0305/2026-27")
  );

  if (!quotation) {
    throw new Error("SP Bakers quotation was not found.");
  }

  const payments = await db.orm.public.Payment.all();

  const matches = payments
    .filter(
      (payment) =>
        payment.companyId === company.id &&
        payment.quotationId === quotation.id &&
        Number(payment.amount) === 5605 &&
        new Date(payment.paymentDate).toISOString().slice(0, 10) ===
          new Date("2026-09-08T00:00:00+05:30").toISOString().slice(0, 10) &&
        normalize(payment.status) === "received"
    )
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  console.log(`Matching verified payments found: ${matches.length}`);

  if (matches.length === 0) {
    console.log("No matching payment exists. Nothing was deleted.");
    return;
  }

  if (matches.length === 1) {
    console.log("Exactly one verified ₹5,605 payment exists. Nothing to clean.");
    return;
  }

  const keep = matches[0];
  const duplicates = matches.slice(1);

  console.log(`Keeping payment: ${keep.id}`);

  for (const payment of duplicates) {
    await db.orm.public.Payment
  .where({ id: payment.id })
  .deleteAndCount();

console.log(`✓ Deleted duplicate payment: ${payment.id}`);
  }

  const after = await db.orm.public.Payment.all();
  const remaining = after.filter(
    (payment) =>
      payment.companyId === company.id &&
      payment.quotationId === quotation.id &&
      Number(payment.amount) === 5605 &&
      new Date(payment.paymentDate).toISOString().slice(0, 10) ===
        new Date("2026-09-08T00:00:00+05:30").toISOString().slice(0, 10) &&
      normalize(payment.status) === "received"
  );

  const collected = remaining.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  console.log("----------------------------------------------");
  console.log(`Remaining matching payments: ${remaining.length}`);
  console.log(`SP Bakers collected: ₹${collected.toLocaleString("en-IN")}`);

  if (remaining.length !== 1 || collected !== 5605) {
    throw new Error("Cleanup verification failed. Review the output.");
  }

  console.log("✓ Duplicate payment cleanup completed safely.");
}

main().catch((error) => {
  console.error("");
  console.error("CLEANUP FAILED");
  console.error(error);
  process.exit(1);
});
