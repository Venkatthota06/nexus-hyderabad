import "dotenv/config";

import { db } from "../src/prisma/db";

const AARUDHRA = {
  companyName: "Aarudhra Food Court",
  workOrderNumber: "INV-01353-2026-27",
  amount: 8496,
  paymentDate: "2026-08-24T00:00:00+05:30",
};

const HASINI = {
  companyName: "Hasini Enterprises",
  workOrderNumber: "INV-01305-2026-27",
  amount: 28084,
  paymentDate: "2026-08-18T00:00:00+05:30",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function findCompany(companyName: string) {
  const companies = await db.orm.public.Company.all();

  return (
    companies.find(
      (company) =>
        normalize(company.name) === normalize(companyName)
    ) ?? null
  );
}

async function findWorkOrder(
  companyId: string,
  workOrderNumber: string
) {
  const workOrders = await db.orm.public.WorkOrder
    .where({
      companyId,
    })
    .all();

  return (
    workOrders.find(
      (workOrder) =>
        normalize(workOrder.workOrderNumber) ===
        normalize(workOrderNumber)
    ) ?? null
  );
}

async function paymentAlreadyExists(
  companyId: string,
  workOrderId: string,
  amount: number,
  paymentDate: string
) {
  const payments = await db.orm.public.Payment
    .where({
      companyId,
    })
    .all();

  const targetTime = new Date(paymentDate).getTime();

  return payments.some((payment) => {
    const paymentTime = new Date(payment.paymentDate).getTime();

    return (
      payment.workOrderId === workOrderId &&
      Number(payment.amount) === amount &&
      paymentTime === targetTime &&
      normalize(payment.status) === "received"
    );
  });
}

async function addPayment(config: {
  companyName: string;
  workOrderNumber: string;
  amount: number;
  paymentDate: string;
}) {
  console.log(`\nProcessing: ${config.companyName}`);

  const company = await findCompany(config.companyName);

  if (!company) {
    throw new Error(
      `Company not found: ${config.companyName}`
    );
  }

  const workOrder = await findWorkOrder(
    company.id,
    config.workOrderNumber
  );

  if (!workOrder) {
    throw new Error(
      `Work order not found: ${config.workOrderNumber}`
    );
  }

  if (
    Number(workOrder.totalAmount) !== config.amount
  ) {
    throw new Error(
      `${config.companyName}: work order value is ₹${Number(
        workOrder.totalAmount
      ).toLocaleString("en-IN")}, expected ₹${config.amount.toLocaleString(
        "en-IN"
      )}. Payment was not created.`
    );
  }

  const exists = await paymentAlreadyExists(
    company.id,
    workOrder.id,
    config.amount,
    config.paymentDate
  );

  if (exists) {
    console.log(
      `✓ Payment already exists: ₹${config.amount.toLocaleString(
        "en-IN"
      )}`
    );

    return;
  }

  await db.orm.public.Payment.create({
    companyId: company.id,
    quotationId: null,
    workOrderId: workOrder.id,
    amount: config.amount,
    paymentDate: config.paymentDate,
    paymentMethod: null,
    reference: null,
    status: "Received",
    notes: `Full payment received for ${config.workOrderNumber}. Payment date confirmed by user.`,
  });

  console.log(
    `✓ Created payment: ₹${config.amount.toLocaleString(
      "en-IN"
    )}`
  );
}

async function verifyCompany(
  companyName: string,
  expectedAmount: number
) {
  const company = await findCompany(companyName);

  if (!company) {
    throw new Error(
      `Verification failed. Company not found: ${companyName}`
    );
  }

  const payments = await db.orm.public.Payment
    .where({
      companyId: company.id,
    })
    .all();

  const received = payments
    .filter(
      (payment) =>
        normalize(payment.status) === "received"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  console.log(
    `${companyName}: ₹${received.toLocaleString("en-IN")} collected`
  );

  if (received !== expectedAmount) {
    throw new Error(
      `${companyName}: expected ₹${expectedAmount.toLocaleString(
        "en-IN"
      )}, found ₹${received.toLocaleString("en-IN")}.`
    );
  }

  return received;
}

async function main() {
  console.log(
    "\nCONFIRMED ONE-TIME CUSTOMER PAYMENTS"
  );
  console.log(
    "=============================================="
  );

  await addPayment(AARUDHRA);
  await addPayment(HASINI);

  console.log(
    "\nVERIFYING PAYMENTS"
  );
  console.log(
    "=============================================="
  );

  const aarudhraCollected =
    await verifyCompany(
      AARUDHRA.companyName,
      AARUDHRA.amount
    );

  const hasiniCollected =
    await verifyCompany(
      HASINI.companyName,
      HASINI.amount
    );

  const spBakers = await findCompany(
    "Sri Praneetha Bakers, Juice & Tea (SP Bakers)"
  );

  if (!spBakers) {
    throw new Error(
      "SP Bakers company not found during verification."
    );
  }

  const spPayments =
    await db.orm.public.Payment
      .where({
        companyId: spBakers.id,
      })
      .all();

  const spCollected = spPayments
    .filter(
      (payment) =>
        normalize(payment.status) === "received"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  console.log(
    `SP Bakers: ₹${spCollected.toLocaleString(
      "en-IN"
    )} collected`
  );

  if (spCollected !== 5605) {
    throw new Error(
      `SP Bakers verification failed. Expected ₹5,605, found ₹${spCollected.toLocaleString(
        "en-IN"
      )}.`
    );
  }

  const qQubic = await findCompany(
    "Qubic Space"
  );

  if (!qQubic) {
    throw new Error(
      "Qubic Space company not found during verification."
    );
  }

  const qubicPayments =
    await db.orm.public.Payment
      .where({
        companyId: qQubic.id,
      })
      .all();

  const qubicCollected =
    qubicPayments
      .filter(
        (payment) =>
          normalize(payment.status) === "received"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

  console.log(
    `Qubic Space / SEI: ₹${qubicCollected.toLocaleString(
      "en-IN"
    )} collected`
  );

  if (qubicCollected !== 0) {
    throw new Error(
      "Qubic/SEI currently has a received payment. Expected ₹0 because payment is pending."
    );
  }

  const confirmedCollected =
    aarudhraCollected +
    hasiniCollected +
    spCollected;

  console.log(
    "----------------------------------------------"
  );

  console.log(
    `Confirmed collected total: ₹${confirmedCollected.toLocaleString(
      "en-IN"
    )}`
  );

  if (confirmedCollected !== 42185) {
    throw new Error(
      `Expected confirmed collected total ₹42,185, found ₹${confirmedCollected.toLocaleString(
        "en-IN"
      )}.`
    );
  }

  console.log(
    "✓ PAYMENT DATA MATCHES VERIFIED TARGET"
  );
}

main().catch((error) => {
  console.error("\nPAYMENT IMPORT FAILED");
  console.error(error);

  process.exitCode = 1;
});