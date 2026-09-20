BEGIN;

TRUNCATE TABLE
  "Document",
  "Report",
  "Sample",
  "Payment",
  "QuotationItem",
  "WorkOrder",
  "Quotation",
  "RecurringService",
  "Location",
  "Activity",
  "MarketingProspect",
  "Lead",
  "Contact",
  "PlanItem",
  "Company"
RESTART IDENTITY CASCADE;

COMMIT;