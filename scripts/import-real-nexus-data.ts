import "dotenv/config";

import { db } from "../src/prisma/db";

/* =========================================================

   NEXUS HYDERABAD — REAL DATA IMPORT

   RULES

   ---------------------------------------------------------

   1. NON-DESTRUCTIVE.

   2. DOES NOT DELETE CRM DATA.

   3. DUPLICATE-SAFE.

   4. WEWORK = RECURRING CUSTOMER.

   5. AARUDHRA = ONE-TIME CUSTOMER.

   6. HASINI = ONE-TIME CUSTOMER.

   7. QUBIC / SEI = ONE-TIME CUSTOMER / LOCATION.

   8. ONE-TIME JOBS DO NOT CREATE RECURRING SERVICES.

   9. INVOICE / PO DOES NOT AUTOMATICALLY MEAN PAYMENT.

   10. SAMPLE RECORDS ARE CREATED ONLY WHEN COLLECTION

       EVIDENCE EXISTS.

\========================================================= */

/* =========================================================

   VERIFIED WEWORK RECURRING DATA

\========================================================= */

const WEWORK_LOCATIONS = [

  {

    name: "Rajapushpa Summit",

    domesticWater: 1,

    roWater: 1,

  },

  {

    name: "RMZ Spire",

    domesticWater: 1,

    roWater: 1,

  },

  {

    name: "Skyview 20",

    domesticWater: 1,

    roWater: 8,

  },

  {

    name: "H10 Tower 2",

    domesticWater: 1,

    roWater: 4,

  },

  {

    name: "Raheja Mindspace Building 9",

    domesticWater: 2,

    roWater: 2,

  },

  {

    name: "Raheja Mindspace Building 14",

    domesticWater: 0,

    roWater: 2,

  },

  {

    name: "Phoenix H10 Tower 3",

    domesticWater: 1,

    roWater: 5,

  },

];

/* =========================================================

   CORPORATE RECURRING HELPERS

\========================================================= */

async function getOrCreateRecurringCompany({

  name,

  industry,

}: {

  name: string;

  industry: string;

}) {

  const companies = await db.orm.public.Company.all();

  const existing = companies.find(

    (company) => normalize(company.name) === normalize(name)

  );

  if (existing) {

    console.log(`✓ Recurring company already exists: ${name}`);

    return existing;

  }

  const company = await db.orm.public.Company.create({

    name,

    industry,

    city: "Hyderabad",

    state: "Telangana",

    source: "Sample Identity Sheet",

    status: "Client",

  });

  console.log(`✓ Created recurring company: ${name}`);

  return company;

}

async function getOrCreateRecurringLocation({

  companyId,

  locationName,

  reference,

}: {

  companyId: string;

  locationName: string;

  reference: string;

}) {

  const locations = await db.orm.public.Location.all();

  const existing = locations.find(

    (location) =>

      location.companyId === companyId &&

      normalize(location.name) === normalize(locationName)

  );

  if (existing) {

    console.log(`  ✓ Location exists: ${locationName}`);

    return existing;

  }

  const location = await db.orm.public.Location.create({

    companyId,

    name: locationName,

    city: "Hyderabad",

    state: "Telangana",

    status: "Active",

    notes: `Recurring monthly sample collection location. Source: ${reference}.`,

  });

  console.log(`  ✓ Created location: ${locationName}`);

  return location;

}

async function importCorporateRecurringClients() {

  console.log("");

  console.log("Importing verified corporate recurring clients...");

  console.log("");

  const companyCache = new Map<string, any>();

  for (const item of CORPORATE_RECURRING) {

    let company = companyCache.get(item.companyName);

    if (!company) {

      company = await getOrCreateRecurringCompany({

        name: item.companyName,

        industry: item.industry,

      });

      companyCache.set(item.companyName, company);

      console.log(`  ${item.companyName}`);

    }

    const location = await getOrCreateRecurringLocation({

      companyId: company.id,

      locationName: item.locationName,

      reference: item.reference,

    });

    for (const service of [

      { sampleType: "Water", count: item.water },

      { sampleType: "RO Water", count: item.roWater },

      { sampleType: "Food", count: item.food },

      { sampleType: "Swab", count: item.swab },

    ]) {

      await getOrCreateRecurringService({

        companyId: company.id,

        locationId: location.id,

        locationName: item.locationName,

        sampleType: service.sampleType,

        samplesPerMonth: service.count,

      });

    }

  }

}

/* VERIFIED CORPORATE RECURRING DATA — SEPTEMBER 2026 */

const CORPORATE_RECURRING = [

  { companyName: "Wells Fargo", industry: "Banking / Financial Services", locationName: "Tower 4", water: 5, roWater: 0, food: 17, swab: 2, reference: "Sample Identity Sheets - Sep 2026" },

  { companyName: "Wells Fargo", industry: "Banking / Financial Services", locationName: "Towers 1/2/3", water: 3, roWater: 0, food: 8, swab: 3, reference: "Sample Identity Sheets - Sep 2026" },

  { companyName: "Goldman Sachs", industry: "Banking / Financial Services", locationName: "Sattva Knowledge City / Octave 03", water: 4, roWater: 0, food: 0, swab: 0, reference: "Sample Identity Sheet - Sep 2026" },

  { companyName: "Goldman Sachs", industry: "Banking / Financial Services", locationName: "Azim", water: 3, roWater: 0, food: 6, swab: 4, reference: "Sample Identity Sheets - Sep 2026" },

  { companyName: "Goldman Sachs", industry: "Banking / Financial Services", locationName: "Paran", water: 12, roWater: 0, food: 0, swab: 0, reference: "Sample Identity Sheets - Sep 2026" },

  { companyName: "Computershare Pvt Ltd", industry: "Corporate / Financial Services", locationName: "Hyderabad", water: 0, roWater: 1, food: 4, swab: 0, reference: "User confirmed - Sep 2026" },

] as const;

/* =========================================================

   GENERAL HELPERS

\========================================================= */

function normalize(

  value: string | null | undefined

) {

  return (value || "")

    .trim()

    .toLowerCase();

}

/* =========================================================

   COMPANY — WEWORK

\========================================================= */

async function getOrCreateWeWork() {

  const companies =

    await db.orm.public.Company.all();

  const existing =

    companies.find(

      (company) =>

        normalize(company.name) ===

        normalize("WeWork")

    );

  if (existing) {

    console.log(

      `✓ Company already exists: ${existing.name}`

    );

    return existing;

  }

  const company =

    await db.orm.public.Company.create({

      name: "WeWork",

      industry:

        "Coworking / Corporate Workspace",

      city: "Hyderabad",

      state: "Telangana",

      source:

        "Sample Identity Sheet",

      status: "Client",

    });

  console.log(

    "✓ Created company: WeWork"

  );

  return company;

}

/* =========================================================

   COMPANY — ONE-TIME CUSTOMER

\========================================================= */

async function getOrCreateOneTimeCompany({

  name,

  industry,

  address,

  city,

}: {

  name: string;

  industry: string;

  address?: string;

  city?: string;

}) {

  const companies =

    await db.orm.public.Company.all();

  const existing =

    companies.find(

      (company) =>

        normalize(company.name) ===

        normalize(name)

    );

  if (existing) {

    console.log(

      `✓ Company already exists: ${name}`

    );

    return existing;

  }

  const company =

    await db.orm.public.Company.create({

      name,

      industry,

      address,

      city:

        city || "Hyderabad",

      state:

        "Telangana",

      source:

        "Existing Customer / Commercial Document",

      status:

        "Client",

    });

  console.log(

    `✓ Created one-time customer: ${name}`

  );

  return company;

}

/* =========================================================

   LOCATION — WEWORK RECURRING

\========================================================= */

async function getOrCreateWeWorkLocation(

  companyId: string,

  locationName: string

) {

  const locations =

    await db.orm.public.Location.all();

  const existing =

    locations.find(

      (location) =>

        location.companyId ===

          companyId &&

        normalize(location.name) ===

          normalize(locationName)

    );

  if (existing) {

    console.log(

      `  ✓ Location exists: ${locationName}`

    );

    return existing;

  }

  const location =

    await db.orm.public.Location.create({

      companyId,

      name:

        locationName,

      city:

        "Hyderabad",

      state:

        "Telangana",

      status:

        "Active",

      notes:

        "Recurring WeWork sample collection location. " +

        "Source: Sample Identity Sheet - September 2026.",

    });

  console.log(

    `  ✓ Created location: ${locationName}`

  );

  return location;

}

/* =========================================================

   RECURRING SERVICE

\========================================================= */

async function getOrCreateRecurringService({

  companyId,

  locationId,

  locationName,

  sampleType,

  samplesPerMonth,

}: {

  companyId: string;

  locationId: string;

  locationName: string;

  sampleType: string;

  samplesPerMonth: number;

}) {

  if (samplesPerMonth <= 0) {

    return;

  }

  const services =

    await db.orm.public.RecurringService.all();

  const existing =

    services.find(

      (service) =>

        service.companyId ===

          companyId &&

        service.locationId ===

          locationId &&

        normalize(

          service.sampleType

        ) ===

          normalize(sampleType) &&

        normalize(

          service.frequency

        ) === "monthly"

    );

  if (existing) {

    console.log(

      `    ✓ Service exists: ${sampleType} × ${samplesPerMonth}`

    );

    return existing;

  }

  const recurring =

    await db.orm.public.RecurringService.create({

      companyId,

      locationId,

      service:

        "Water Testing",

      sampleType,

      samplesPerMonth,

      frequency:

        "Monthly",

      status:

        "Active",

      notes:

        `${locationName}: ` +

        `${samplesPerMonth} ${sampleType} sample(s) per month. ` +

        "Source: Sample Identity Sheet - September 2026.",

    });

  console.log(

    `    ✓ Created recurring service: ` +

      `${sampleType} × ${samplesPerMonth}`

  );

  return recurring;

}

/* =========================================================

   WORK ORDER HELPER

   Used for confirmed commercial work.

   IMPORTANT:

   This does NOT create payment records.

   This does NOT create recurring services.

\========================================================= */

async function getOrCreateWorkOrder({

  companyId,

  workOrderNumber,

  service,

  description,

  amount,

  gstAmount,

  totalAmount,

  confirmedDate,

  notes,

}: {

  companyId: string;

  workOrderNumber: string;

  service: string;

  description: string;

  amount: number;

  gstAmount: number;

  totalAmount: number;

  confirmedDate: string;

  notes: string;

}) {

  const orders =

    await db.orm.public.WorkOrder.all();

  const existing =

    orders.find(

      (order) =>

        normalize(

          order.workOrderNumber

        ) ===

        normalize(

          workOrderNumber

        )

    );

  if (existing) {

    console.log(

      `  ✓ Work order exists: ${workOrderNumber}`

    );

    return existing;

  }

  const order =

    await db.orm.public.WorkOrder.create({

      companyId,

      workOrderNumber,

      service,

      description,

      amount,

      gstPercent:

        18,

      gstAmount,

      totalAmount,

      status:

        "Confirmed",

      confirmedDate,

      notes,

    });

  console.log(

    `  ✓ Created work order: ${workOrderNumber}`

  );

  return order;

}

/* =========================================================

   WEWORK — CONFIRMED ACTUAL COLLECTION

   Skyview 20

   03-Sep-2026

   RO Water       = 8

   Domestic Water = 1

   Confirmed actual collection = 9

\========================================================= */

async function createSkyviewActualSamples(

  companyId: string

) {

  const existingSamples =

    await db.orm.public.Sample.all();

  const roNumber =

    "WW-SKYVIEW20-20260903-RO";

  const domesticNumber =

    "WW-SKYVIEW20-20260903-DW";

  /* -------------------------------------------------------

     RO WATER

  ------------------------------------------------------- */

  const existingRo =

    existingSamples.find(

      (sample) =>

        sample.sampleNumber ===

        roNumber

    );

  if (!existingRo) {

    await db.orm.public.Sample.create({

      companyId,

      sampleNumber:

        roNumber,

      sampleType:

        "RO Water",

      sampleCount:

        8,

      collectionDate:

        "2026-09-03T09:00:00+05:30",

      collectedBy:

        "Venkat",

      status:

        "Collected",

      testingLocation:

        "Skyview 20",

      reportStatus:

        "Pending",

      notes:

        "8 RO water samples collected from " +

        "WeWork Skyview 20. " +

        "Source: September 2026 collection register.",

    });

    console.log(

      "  ✓ Skyview 20 actual collection: 8 RO Water"

    );

  } else {

    console.log(

      "  ✓ Skyview 20 RO collection already exists"

    );

  }

  /* -------------------------------------------------------

     DOMESTIC WATER

  ------------------------------------------------------- */

  const existingDomestic =

    existingSamples.find(

      (sample) =>

        sample.sampleNumber ===

        domesticNumber

    );

  if (!existingDomestic) {

    await db.orm.public.Sample.create({

      companyId,

      sampleNumber:

        domesticNumber,

      sampleType:

        "Water",

      sampleCount:

        1,

      collectionDate:

        "2026-09-03T09:00:00+05:30",

      collectedBy:

        "Venkat",

      status:

        "Collected",

      testingLocation:

        "Skyview 20",

      reportStatus:

        "Pending",

      notes:

        "1 domestic water sample collected from " +

        "WeWork Skyview 20. " +

        "Source: September 2026 collection register.",

    });

    console.log(

      "  ✓ Skyview 20 actual collection: " +

        "1 Domestic Water"

    );

  } else {

    console.log(

      "  ✓ Skyview 20 Domestic Water collection already exists"

    );

  }

}

/* =========================================================

   AARUDHRA FOOD COURT

   ONE-TIME CUSTOMER

   Invoice:

   01353/2026-27

   Date:

   25-Aug-2026

   Food Analysis:

   5 × ₹1,250 = ₹6,250

   Soda Analysis:

   1 × ₹550 = ₹550

   Sample Collection:

   ₹400

   Taxable:

   ₹7,200

   GST:

   ₹1,296

   Total:

   ₹8,496

   NO RECURRING SERVICE.

   NO PAYMENT RECORD WITHOUT PAYMENT EVIDENCE.

\========================================================= */

async function importAarudhraFoodCourt() {

  console.log("");

  console.log(

    "Importing Aarudhra Food Court..."

  );

  const company =

    await getOrCreateOneTimeCompany({

      name:

        "Aarudhra Food Court",

      industry:

        "Food & Catering",

      address:

        "Yousufguda",

      city:

        "Hyderabad",

    });

  await getOrCreateWorkOrder({

    companyId:

      company.id,

    workOrderNumber:

      "INV-01353-2026-27",

    service:

      "Food & Soda Analysis",

    description:

      "5 Food Analysis samples, " +

      "1 Soda Analysis - White Rice, " +

      "and sample collection.",

    amount:

      7200,

    gstAmount:

      1296,

    totalAmount:

      8496,

    confirmedDate:

      "2026-08-25T00:00:00+05:30",

    notes:

      "One-time customer. " +

      "Source: Nexus invoice 01353/2026-27 " +

      "dated 25-Aug-2026. " +

      "Advance Invoice. " +

      "Not a recurring service.",

  });

  console.log(

    "  ✓ Recurring service intentionally NOT created"

  );

}

/* =========================================================

   HASINI ENTERPRISES

   ONE-TIME CUSTOMER

   Invoice:

   01305/2026-27

   Date:

   20-Aug-2026

   Drinking Water:

   1 × ₹13,000

   Food:

   3 × ₹3,250 = ₹9,750

   Soda:

   1 × ₹550

   Sample Collection:

   ₹500

   Taxable:

   ₹23,800

   GST:

   ₹4,284

   Total:

   ₹28,084

   NO RECURRING SERVICE.

   NO PAYMENT RECORD WITHOUT PAYMENT EVIDENCE.

\========================================================= */

async function importHasiniEnterprises() {

  console.log("");

  console.log(

    "Importing Hasini Enterprises..."

  );

  const company =

    await getOrCreateOneTimeCompany({

      name:

        "Hasini Enterprises",

      industry:

        "Food & Catering",

      address:

        "Bachupalli",

      city:

        "Hyderabad",

    });

  await getOrCreateWorkOrder({

    companyId:

      company.id,

    workOrderNumber:

      "INV-01305-2026-27",

    service:

      "Water & Food Analysis",

    description:

      "1 Drinking Water Analysis, " +

      "3 Food Analysis samples, " +

      "1 Soda Analysis - White Rice, " +

      "and sample collection.",

    amount:

      23800,

    gstAmount:

      4284,

    totalAmount:

      28084,

    confirmedDate:

      "2026-08-20T00:00:00+05:30",

    notes:

      "One-time customer. " +

      "Source: Nexus invoice 01305/2026-27 " +

      "dated 20-Aug-2026. " +

      "Advance Invoice. " +

      "Not a recurring service.",

  });

  console.log(

    "  ✓ Recurring service intentionally NOT created"

  );

}

/* =========================================================

   QUBIC SPACE / SEI HYDERABAD

   ONE-TIME CUSTOMER

   PO:

   PO-2026-07-20

   Date:

   11-Aug-2026

   Billing Customer:

   Qubic Space

   Service Location:

   SEI Hyderabad

   Floor 1 & 2

   Tower 2

   Phoenix Equinox

   Gachibowli

   RO Water Analysis:

   1 × ₹13,000

   Sample Collection:

   ₹300

   Taxable:

   ₹13,300

   GST 18%:

   ₹2,394

   Grand Total:

   ₹15,694

   IMPORTANT:

   This is a one-time requirement.

   LOCATION RECORD IS ALLOWED.

   BUT:

   NO RecurringService.

\========================================================= */

async function importQubicSpaceSEI() {

  console.log("");

  console.log(

    "Importing Qubic Space / SEI Hyderabad..."

  );

  /* -------------------------------------------------------

     COMPANY

  ------------------------------------------------------- */

  const company =

    await getOrCreateOneTimeCompany({

      name:

        "Qubic Space",

      industry:

        "Corporate / Facility Management",

      address:

        "103, 1882, Kakateeya Arcade, Pragathi Nagar",

      city:

        "Hyderabad",

    });

  /* -------------------------------------------------------

     SERVICE LOCATION

  ------------------------------------------------------- */

  const locations =

    await db.orm.public.Location.all();

  let seiLocation =

    locations.find(

      (location) =>

        location.companyId ===

          company.id &&

        normalize(

          location.name

        ) ===

          normalize(

            "SEI Hyderabad"

          )

    );

  if (!seiLocation) {

    seiLocation =

      await db.orm.public.Location.create({

        companyId:

          company.id,

        name:

          "SEI Hyderabad",

        address:

          "Floor 1 & 2, Tower 2, Phoenix Equinox, " +

          "Gachibowli, Rangareddy",

        city:

          "Hyderabad",

        state:

          "Telangana",

        contactName:

          "Gautam D",

        phone:

          "9177995886",

        status:

          "Active",

        notes:

          "One-time RO Water Analysis service location. " +

          "Source: Qubic Space PO PO-2026-07-20. " +

          "This location is NOT a recurring service.",

      });

    console.log(

      "  ✓ Created service location: SEI Hyderabad"

    );

  } else {

    console.log(

      "  ✓ Service location already exists: SEI Hyderabad"

    );

  }

  /* -------------------------------------------------------

     WORK ORDER

  ------------------------------------------------------- */

  const workOrder =

    await getOrCreateWorkOrder({

      companyId:

        company.id,

      workOrderNumber:

        "PO-2026-07-20",

      service:

        "RO Water Analysis",

      description:

        "1 RO Water Analysis sample plus sample collection.",

      amount:

        13300,

      gstAmount:

        2394,

      totalAmount:

        15694,

      confirmedDate:

        "2026-08-11T00:00:00+05:30",

      notes:

        "One-time customer requirement for " +

        "SEI Hyderabad, Phoenix Equinox, Gachibowli. " +

        "Source: Qubic Space Purchase Order PO-2026-07-20. " +

        "Not a recurring service.",

    });

  console.log(

    `  ✓ Qubic/SEI order ready: ${workOrder.workOrderNumber}`

  );

  console.log(

    "  ✓ Recurring service intentionally NOT created"

  );

  /* -------------------------------------------------------

     DO NOT CREATE ACTUAL SAMPLE YET

     PO confirms order + service requirement.

     It does NOT by itself confirm that the sample

     was physically collected.

     Therefore no Sample record is created here.

  ------------------------------------------------------- */

}

/* =========================================================

   QUOTATION HELPERS

\========================================================= */

async function getOrCreateQuotation({

  companyId,

  quotationNumber,

  service,

  description,

  amount,

  gstAmount,

  totalAmount,

  quotationDate,

  status,

  notes,

}: {

  companyId: string;

  quotationNumber: string;

  service: string;

  description: string;

  amount: number;

  gstAmount: number;

  totalAmount: number;

  quotationDate: string;

  status: string;

  notes: string;

}) {

  const quotations = await db.orm.public.Quotation.all();

  const existing = quotations.find(

    (quotation) =>

      normalize(quotation.quotationNumber) === normalize(quotationNumber)

  );

  if (existing) {

    console.log(`  ✓ Quotation exists: ${quotationNumber}`);

    return existing;

  }

  const quotation = await db.orm.public.Quotation.create({

    companyId,

    quotationNumber,

    service,

    description,

    amount,

    gstPercent: 18,

    gstAmount,

    totalAmount,

    status,

    quotationDate,

    notes,

  });

  console.log(`  ✓ Created quotation: ${quotationNumber}`);

  return quotation;

}

async function getOrCreateQuotationItem({

  quotationId,

  service,

  description,

  quantity,

  unitPrice,

  amount,

}: {

  quotationId: string;

  service: string;

  description: string;

  quantity: number;

  unitPrice: number;

  amount: number;

}) {

  const items = await db.orm.public.QuotationItem.all();

  const existing = items.find(

    (item) =>

      item.quotationId === quotationId &&

      normalize(item.service) === normalize(service) &&

      Number(item.quantity) === quantity &&

      Number(item.unitPrice) === unitPrice

  );

  if (existing) {

    console.log(`    ✓ Quotation item exists: ${service}`);

    return existing;

  }

  const item = await db.orm.public.QuotationItem.create({

    quotationId,

    service,

    description,

    quantity,

    unitPrice,

    amount,

  });

  console.log(`    ✓ Created quotation item: ${service}`);

  return item;

}

/* =========================================================

   SP BAKERS — VERIFIED QUOTATION + ACTUAL COLLECTION

   Ref: NTL/W/A/0305/2026-27

   Date: 03-Sep-2026

   Taxable: ₹4,750

   GST 18%: ₹855

   Grand Total: ₹5,605

   User confirmed:
   - 2 Food samples collected
   - 1 Water sample collected
   - Reports submitted
   No payment evidence.
   No recurring service.

\========================================================= */

async function importSPBakersQuotation() {

  console.log("");

  console.log("Importing SP Bakers quotation...");

  const company = await getOrCreateOneTimeCompany({

    name: "Sri Praneetha Bakers, Juice & Tea (SP Bakers)",

    industry: "Food & Beverage",

    address: "242/C Raghavendra Colony, Kondapur - 500084",

    city: "Hyderabad",

  });

  const quotation = await getOrCreateQuotation({

    companyId: company.id,

    quotationNumber: "NTL/W/A/0305/2026-27",

    service: "Food & Water Analysis",

    description:

      "2 Food Analysis samples, 1 Water Analysis sample, and sample collection.",

    amount: 4750,

    gstAmount: 855,

    totalAmount: 5605,

    quotationDate: "2026-09-03T00:00:00+05:30",

    status: "Sent",

    notes:

      "Quotation only. Kind Attn: Mr. Srinivasa. Source: revised quotation " +

      "NTL/W/A/0305/2026-27 dated 03-Sep-2026. " +

      "Quotation source: revised quotation NTL/W/A/0305/2026-27 dated 03-Sep-2026. " +
      "User later confirmed 2 Food + 1 Water samples were collected and reports submitted. " +
      "No payment is inferred. Not a recurring service.",

  });

  await getOrCreateQuotationItem({

    quotationId: quotation.id,

    service: "Food Analysis",

    description: "Food Analysis",

    quantity: 2,

    unitPrice: 1250,

    amount: 2500,

  });

  await getOrCreateQuotationItem({

    quotationId: quotation.id,

    service: "Water Analysis",

    description: "Water Analysis",

    quantity: 1,

    unitPrice: 1850,

    amount: 1850,

  });

  await getOrCreateQuotationItem({

    quotationId: quotation.id,

    service: "Sample Collection",

    description: "Sample collection charge",

    quantity: 1,

    unitPrice: 400,

    amount: 400,

  });

  console.log("  ✓ SP Bakers quotation ready");
  return { company, quotation };

}

/* =========================================================
   VERIFIED ACTUAL SAMPLE / REPORT HELPERS
   ---------------------------------------------------------
   Used only when physical collection / report completion
   has been explicitly confirmed.

   IMPORTANT:
   - Does not create payments.
   - Does not create recurring services.
   - Does not invent unknown dates.
========================================================= */

async function getOrCreateActualSample({
  companyId,
  quotationId,
  workOrderId,
  sampleNumber,
  sampleType,
  sampleCount,
  collectionDate,
  collectedBy,
  testingLocation,
  reportStatus,
  reportDeliveredDate,
  notes,
}: {
  companyId: string;
  quotationId?: string;
  workOrderId?: string;
  sampleNumber: string;
  sampleType: string;
  sampleCount: number;
  collectionDate?: string;
  collectedBy?: string;
  testingLocation?: string;
  reportStatus: string;
  reportDeliveredDate?: string;
  notes: string;
}) {
  const samples = await db.orm.public.Sample.all();
  const existing = samples.find(
    (sample) => normalize(sample.sampleNumber) === normalize(sampleNumber)
  );

  if (existing) {
    console.log(`  ✓ Sample exists: ${sampleNumber}`);
    return existing;
  }

  const sample = await db.orm.public.Sample.create({
    companyId,
    quotationId,
    workOrderId,
    sampleNumber,
    sampleType,
    sampleCount,
    collectionDate,
    collectedBy,
    status: "Collected",
    testingLocation,
    reportStatus,
    reportDeliveredDate,
    notes,
  });

  console.log(`  ✓ Created actual sample: ${sampleNumber} (${sampleCount} ${sampleType})`);
  return sample;
}

async function getOrCreateSubmittedReport({
  companyId,
  sampleId,
  reportNumber,
  reportType,
  reportDate,
  deliveredDate,
  deliveryMethod,
  notes,
}: {
  companyId: string;
  sampleId: string;
  reportNumber: string;
  reportType: string;
  reportDate?: string;
  deliveredDate?: string;
  deliveryMethod?: string;
  notes: string;
}) {
  const reports = await db.orm.public.Report.all();
  const existing = reports.find(
    (report) =>
      report.sampleId === sampleId ||
      normalize(report.reportNumber) === normalize(reportNumber)
  );

  if (existing) {
    console.log(`  ✓ Report exists for sample: ${reportNumber}`);
    return existing;
  }

  const report = await db.orm.public.Report.create({
    companyId,
    sampleId,
    reportNumber,
    reportType,
    reportDate,
    status: "Submitted",
    deliveredDate,
    deliveryMethod,
    notes,
  });

  console.log(`  ✓ Created submitted report record: ${reportNumber}`);
  return report;
}

/* =========================================================
   PAYMENT HELPER
   ---------------------------------------------------------
   Creates a payment only from verified payment evidence.
   Duplicate-safe by company + quotation + amount + date.
========================================================= */

async function getOrCreatePayment({
  companyId,
  quotationId,
  amount,
  paymentDate,
  notes,
}: {
  companyId: string;
  quotationId?: string;
  amount: number;
  paymentDate: string;
  notes: string;
}) {
  const payments = await db.orm.public.Payment.all();

  const targetDate = new Date(paymentDate).toISOString().slice(0, 10);

  const existing = payments.find(
    (payment) =>
      payment.companyId === companyId &&
      payment.quotationId === quotationId &&
      Number(payment.amount) === amount &&
      new Date(payment.paymentDate).toISOString().slice(0, 10) === targetDate
  );

  if (existing) {
    console.log(`  ✓ Payment already exists: ₹${amount.toLocaleString("en-IN")}`);
    return existing;
  }

  const payment = await db.orm.public.Payment.create({
    companyId,
    quotationId,
    amount,
    paymentDate,
    status: "Received",
    notes,
  });

  console.log(`  ✓ Created payment: ₹${amount.toLocaleString("en-IN")} received`);
  return payment;
}

/* =========================================================
   SP BAKERS — VERIFIED ACTUAL COLLECTION + REPORTS
   ---------------------------------------------------------
   User-confirmed operational facts:
   - 2 Food samples collected
   - 1 Water sample collected
   - Reports submitted
   - Exact collection date not supplied
   - Exact report submission date not supplied
   - Exact laboratory report numbers not supplied

   Therefore dates remain unset and internal CRM references are
   used only as record identifiers; they are NOT laboratory
   report numbers.
========================================================= */

async function importSPBakersActualOperations(
  company: any,
  quotation: any
) {
  console.log("");
  console.log("Importing SP Bakers confirmed sample/report operations...");

  const foodSample = await getOrCreateActualSample({
    companyId: company.id,
    quotationId: quotation.id,
    sampleNumber: "SPB-2026-FOOD-01",
    sampleType: "Food",
    sampleCount: 2,
    testingLocation: "SP Bakers",
    reportStatus: "Submitted",
    notes:
      "2 Food Analysis samples physically collected. " +
      "Reports submitted. User confirmed. Exact collection and report submission dates not supplied.",
  });

  const waterSample = await getOrCreateActualSample({
    companyId: company.id,
    quotationId: quotation.id,
    sampleNumber: "SPB-2026-WATER-01",
    sampleType: "Water",
    sampleCount: 1,
    testingLocation: "SP Bakers",
    reportStatus: "Submitted",
    notes:
      "1 Water Analysis sample physically collected. " +
      "Report submitted. User confirmed. Exact collection and report submission dates not supplied.",
  });

  await getOrCreateSubmittedReport({
    companyId: company.id,
    sampleId: foodSample.id,
    reportNumber: "CRM-SPB-FOOD-SUBMITTED",
    reportType: "Final Report",
    notes:
      "Internal CRM reference only; actual laboratory report number/date not supplied. " +
      "User confirmed reports for the 2 Food samples were submitted.",
  });

  await getOrCreateSubmittedReport({
    companyId: company.id,
    sampleId: waterSample.id,
    reportNumber: "CRM-SPB-WATER-SUBMITTED",
    reportType: "Final Report",
    notes:
      "Internal CRM reference only; actual laboratory report number/date not supplied. " +
      "User confirmed the Water sample report was submitted.",
  });

  await getOrCreatePayment({
    companyId: company.id,
    quotationId: quotation.id,
    amount: 5605,
    paymentDate: "2026-09-08T00:00:00+05:30",
    notes:
      "Full payment received for SP Bakers quotation NTL/W/A/0305/2026-27. " +
      "User confirmed payment received on 08-Sep-2026. Payment method/reference not supplied.",
  });

  console.log("  ✓ SP Bakers: 3 sample units collected");
  console.log("  ✓ SP Bakers: Food + Water report records marked Submitted");
  console.log("  ✓ SP Bakers: Full payment ₹5,605 received on 08-Sep-2026");
  console.log("  ✓ SP Bakers: Pending amount ₹0");
  console.log("  ✓ Recurring service intentionally NOT created");
}

/* =========================================================

   VERIFICATION

\========================================================= */

async function verifyImport(weworkId: string) {

  const companies = await db.orm.public.Company.all();

  const locations = await db.orm.public.Location.all();

  const recurring = await db.orm.public.RecurringService.all();

  const samples = await db.orm.public.Sample.all();

  const workOrders = await db.orm.public.WorkOrder.all();
  const reports = await db.orm.public.Report.all();
  const payments = await db.orm.public.Payment.all();

  const recurringNames = ["WeWork", "Wells Fargo", "Goldman Sachs", "Computershare Pvt Ltd"];

  const recurringCompanies = companies.filter((company) =>

    recurringNames.some((name) => normalize(name) === normalize(company.name))

  );

  const recurringIds = new Set(recurringCompanies.map((company) => company.id));

  const activeServices = recurring.filter(

    (service) => recurringIds.has(service.companyId) && normalize(service.status) === "active"

  );

  const recurringLocationIds = new Set(

    activeServices.map((service) => service.locationId).filter((id): id is string => Boolean(id))

  );

  const totals = activeServices.reduce(

    (r, service) => {

      const count = Number(service.samplesPerMonth || 0);

      const type = normalize(service.sampleType);

      if (type.includes("food") || type.includes("meal")) r.food += count;

      else if (type.includes("swab")) r.swab += count;

      else r.water += count;

      r.total += count;

      return r;

    },

    { water: 0, food: 0, swab: 0, total: 0 }

  );

  const statsFor = (name: string) => {

    const company = companies.find((row) => normalize(row.name) === normalize(name));

    if (!company) return { locations: 0, water: 0, food: 0, swab: 0, total: 0 };

    const services = recurring.filter(

      (service) => service.companyId === company.id && normalize(service.status) === "active"

    );

    const ids = new Set(services.map((service) => service.locationId).filter(Boolean));

    return services.reduce(

      (r, service) => {

        const count = Number(service.samplesPerMonth || 0);

        const type = normalize(service.sampleType);

        if (type.includes("food") || type.includes("meal")) r.food += count;

        else if (type.includes("swab")) r.swab += count;

        else r.water += count;

        r.total += count;

        return r;

      },

      { locations: ids.size, water: 0, food: 0, swab: 0, total: 0 }

    );

  };

  const wework = statsFor("WeWork");

  const wells = statsFor("Wells Fargo");

  const goldman = statsFor("Goldman Sachs");

  const computershare = statsFor("Computershare Pvt Ltd");

  const collectedWeWork = samples

    .filter((sample) => sample.companyId === weworkId && normalize(sample.status) === "collected")

    .reduce((sum, sample) => sum + Number(sample.sampleCount || 0), 0);

  const oneTime = (name: string) => {

    const company = companies.find((row) => normalize(row.name) === normalize(name));

    if (!company) return { locations: 0, orders: 0, recurring: 0 };

    return {

      locations: locations.filter((row) => row.companyId === company.id).length,

      orders: workOrders.filter((row) => row.companyId === company.id).length,

      recurring: recurring.filter((row) => row.companyId === company.id).length,

    };

  };

  const aarudhra = oneTime("Aarudhra Food Court");

  const hasini = oneTime("Hasini Enterprises");

  const qubic = oneTime("Qubic Space");

  const spBakersCompany = companies.find(
    (row) =>
      normalize(row.name) ===
      normalize("Sri Praneetha Bakers, Juice & Tea (SP Bakers)")
  );
  const spBakersSamples = spBakersCompany
    ? samples.filter((row) => row.companyId === spBakersCompany.id)
    : [];
  const spBakersSampleUnits = spBakersSamples.reduce(
    (total, row) => total + Number(row.sampleCount || 0),
    0
  );
  const spBakersReports = spBakersCompany
    ? reports.filter((row) => row.companyId === spBakersCompany.id)
    : [];
  const spBakersRecurring = spBakersCompany
    ? recurring.filter((row) => row.companyId === spBakersCompany.id).length
    : 0;
  const spBakersPayments = spBakersCompany
    ? payments.filter(
        (row) =>
          row.companyId === spBakersCompany.id &&
          normalize(row.status) === "received"
      )
    : [];
  const spBakersCollected = spBakersPayments.reduce(
    (total, row) => total + Number(row.amount || 0),
    0
  );

  const print = (name: string, x: typeof wework) => {

    console.log("");

    console.log(name);

    console.log("----------------------------------------------");

    console.log(`Recurring Locations: ${x.locations}`);

    console.log(`Water / Month: ${x.water}`);

    console.log(`Food / Month: ${x.food}`);

    console.log(`Swabs / Month: ${x.swab}`);

    console.log(`Recurring Samples / Month: ${x.total}`);

  };

  console.log("");

  console.log("==============================================");

  console.log("IMPORT VERIFICATION");

  console.log("==============================================");

  print("WEWORK", wework);

  console.log(`Confirmed Samples Collected: ${collectedWeWork}`);

  print("WELLS FARGO", wells);

  print("GOLDMAN SACHS", goldman);

  print("COMPUTERSHARE PVT LTD", computershare);

  console.log("");

  console.log("ALL RECURRING CLIENTS");

  console.log("----------------------------------------------");

  console.log(`Recurring Customer Groups: ${recurringCompanies.length}`);

  console.log(`Recurring Locations: ${recurringLocationIds.size}`);

  console.log(`Water / Month: ${totals.water}`);

  console.log(`Food / Month: ${totals.food}`);

  console.log(`Swabs / Month: ${totals.swab}`);

  console.log(`TOTAL RECURRING SAMPLES / MONTH: ${totals.total}`);

  console.log("");

  console.log("ONE-TIME CUSTOMER SAFETY CHECK");

  console.log("----------------------------------------------");

  console.log(`Aarudhra: Work Orders ${aarudhra.orders}, Recurring ${aarudhra.recurring}`);

  console.log(`Hasini: Work Orders ${hasini.orders}, Recurring ${hasini.recurring}`);

  console.log(`Qubic/SEI: Locations ${qubic.locations}, Work Orders ${qubic.orders}, Recurring ${qubic.recurring}`);
  console.log(
    `SP Bakers: Sample Units ${spBakersSampleUnits}, Reports ${spBakersReports.length}, ` +
      `Collected ₹${spBakersCollected.toLocaleString("en-IN")}, Recurring ${spBakersRecurring}`
  );

  console.log("");

  console.log("EXPECTED");

  console.log("----------------------------------------------");

  console.log("WeWork = 7 locations / 30 samples");

  console.log("Wells Fargo = 2 locations / 38 samples");

  console.log("Goldman Sachs = 3 locations / 29 samples");

  console.log("Computershare = 1 location / 5 samples");

  console.log("Recurring Locations = 13");

  console.log("Water = 58");

  console.log("Food = 35");

  console.log("Swabs = 9");

  console.log("TOTAL = 102");

  const ok =

    wework.locations === 7 && wework.total === 30 &&

    wells.locations === 2 && wells.total === 38 &&

    goldman.locations === 3 && goldman.total === 29 &&

    computershare.locations === 1 && computershare.total === 5 &&

    recurringLocationIds.size === 13 &&

    totals.water === 58 && totals.food === 35 && totals.swab === 9 && totals.total === 102 &&

    aarudhra.recurring === 0 &&
    hasini.recurring === 0 &&
    qubic.recurring === 0 &&
    spBakersSampleUnits === 3 &&
    spBakersReports.length >= 2 &&
    spBakersCollected === 5605 &&
    spBakersRecurring === 0;

  console.log("");

  console.log(ok

    ? "✓ RECURRING DATA MATCHES VERIFIED TARGETS"

    : "⚠ VERIFICATION MISMATCH — REVIEW OUTPUT ABOVE");

};


/* =========================================================
   REAL HYDERABAD SALES LEADS
   ---------------------------------------------------------
   Source: Nexus Hyderabad Management Dashboard 2026
   Customer Pipeline & Visit Status.

   Rules:
   - Only genuine open sales prospects/opportunities are added.
   - Operational/recurring customers are not duplicated here.
   - Missing contact names, phone numbers, email addresses and
     follow-up dates remain blank rather than being invented.
   - Duplicate-safe by company + service/requirement.
========================================================= */

const REAL_SALES_LEADS = [
  {
    company: "Collins Aerospace",
    name: "",
    phone: "",
    email: "",
    service: "Water / IAQ / AAQ / Facility Testing",
    requirement: "Water / IAQ / AAQ / facility testing",
    source: "LinkedIn",
    status: "Contacted",
    notes:
      "Marketing prospect. Next action: identify and follow up with the correct Facilities or EHS contact.",
  },
  {
    company: "Awfis",
    name: "",
    phone: "",
    email: "",
    service: "Testing Services",
    requirement: "Testing services",
    source: "LinkedIn",
    status: "Contacted",
    notes:
      "Marketing prospect. Next action: follow up with facility/workplace contact.",
  },
  {
    company: "Metro Care Hospitals",
    name: "",
    phone: "",
    email: "",
    service: "Water Testing",
    requirement: "Water testing / brochure requested",
    source: "Field Visit",
    status: "Requirement Identified",
    notes:
      "Hospital requested brochure. Next action: share/follow up on brochure and testing requirement.",
  },
  {
    company: "Neelima Hospital (Renovo)",
    name: "",
    phone: "",
    email: "",
    service: "Dialysis Water Testing (AAMI)",
    requirement: "Dialysis water testing (AAMI)",
    source: "Field Visit",
    status: "Requirement Identified",
    notes:
      "Dialysis water testing enquiry. Next action: confirm AAMI capability/quotation and follow up.",
  },
  {
    company: "Nature Cure Hospital",
    name: "",
    phone: "",
    email: "",
    service: "Testing Services",
    requirement: "Testing services",
    source: "Field Visit",
    status: "Visited",
    notes: "Visited. Next action: follow up for requirement.",
  },
  {
    company: "Omni Hospital",
    name: "",
    phone: "",
    email: "",
    service: "Testing Services",
    requirement: "Testing services",
    source: "Email",
    status: "Contacted",
    notes: "Client communication initiated. Next action: continue client follow-up.",
  },
  {
    company: "Amor Cancer Hospital",
    name: "",
    phone: "",
    email: "",
    service: "Water Testing",
    requirement: "Water testing — basic and all parameters",
    source: "Field Visit",
    status: "Requirement Identified",
    notes:
      "Asked for quotation for basic and all parameters. Next action: send/follow up quotation.",
  },
  {
    company: "IDFC Bank Catering Site",
    name: "",
    phone: "",
    email: "",
    service: "Food Testing",
    requirement: "Food testing / meals",
    source: "Field Visit",
    status: "Requirement Identified",
    notes:
      "Food testing enquiry through catering site. Next action: follow up food testing requirement.",
  },
] as const;

async function importRealSalesLeads() {
  console.log("");
  console.log("Importing real Hyderabad sales leads...");
  console.log("");

  const existingLeads = await db.orm.public.Lead.all();

  for (const item of REAL_SALES_LEADS) {
    const existing = existingLeads.find(
      (lead) =>
        normalize(lead.company) === normalize(item.company) &&
        normalize(lead.requirement) === normalize(item.requirement)
    );

    if (existing) {
      console.log(`  ✓ Lead already exists: ${item.company}`);
      continue;
    }

    await db.orm.public.Lead.create({
      name: item.name,
      company: item.company,
      companyId: null,
      phone: item.phone,
      email: item.email,
      service: item.service,
      requirement: item.requirement,
      source: item.source,
      status: item.status,
      isRead: true,
      notes: item.notes,
      nextFollowUp: null,
    });

    console.log(`  ✓ Created lead: ${item.company} — ${item.status}`);
  }
}

/* =========================================================

   MAIN IMPORT

\========================================================= */

async function main() {

  console.log("");

  console.log("==============================================");

  console.log("NEXUS HYDERABAD — REAL DATA IMPORT");

  console.log("==============================================");

  console.log("");

  /* =======================================================

     1. WEWORK

  ======================================================= */

  const wework = await getOrCreateWeWork();

  /* =======================================================

     2. WEWORK LOCATIONS + RECURRING SERVICES

  ======================================================= */

  console.log("");

  console.log("Importing WeWork locations...");

  console.log("");

  for (const item of WEWORK_LOCATIONS) {

    const location = await getOrCreateWeWorkLocation(

      wework.id,

      item.name

    );

    await getOrCreateRecurringService({

      companyId: wework.id,

      locationId: location.id,

      locationName: item.name,

      sampleType: "Water",

      samplesPerMonth: item.domesticWater,

    });

    await getOrCreateRecurringService({

      companyId: wework.id,

      locationId: location.id,

      locationName: item.name,

      sampleType: "RO Water",

      samplesPerMonth: item.roWater,

    });

  }

  /* =======================================================

     3. CONFIRMED WEWORK ACTUAL COLLECTION

  ======================================================= */

  console.log("");

  console.log("Importing confirmed sample collections...");

  console.log("");

  await createSkyviewActualSamples(wework.id);

  /* =======================================================

     4. CORPORATE RECURRING CLIENTS

  ======================================================= */

  await importCorporateRecurringClients();

  /* =======================================================

     5. VERIFIED ONE-TIME CUSTOMERS

  ======================================================= */

  console.log("");

  console.log("Importing verified one-time customers...");

  await importAarudhraFoodCourt();

  await importHasiniEnterprises();

  await importQubicSpaceSEI();

  /* =======================================================

     6. VERIFY DATABASE

  ======================================================= */

  /* VERIFIED QUOTATION — SP BAKERS */

  const spBakers = await importSPBakersQuotation();
  await importSPBakersActualOperations(spBakers.company, spBakers.quotation);

  /* =======================================================
     7. REAL SALES LEADS / VISITED PROSPECTS
  ======================================================= */

  await importRealSalesLeads();

  await verifyImport(wework.id);

  console.log("");

  console.log("==============================================");

  console.log("REAL DATA IMPORT COMPLETED");

  console.log("==============================================");

  console.log("");

}

/* =========================================================

   RUN

\========================================================= */

main().catch((error) => {

  console.error("");

  console.error("==============================================");

  console.error("IMPORT FAILED");

  console.error("==============================================");

  console.error("");

  console.error(error);

  process.exit(1);

});
