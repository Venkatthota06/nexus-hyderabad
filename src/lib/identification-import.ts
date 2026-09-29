export type ImportSampleRow = {
  rowId: string;
  sampleType: string;
  source: string;
  quantity: number;
  labCode: string;
};

export type ImportPreview = {
  fileName: string;
  fileFingerprint: string;

  customerName: string;
  address: string;

  companyId: string;
  companyName: string;

  locationId: string;
  locationName: string;

  collectionDate: string;
  collectionMonth: string;
  collectedBy: string;

  sampleReceivedOn: string;

  samples: ImportSampleRow[];

  warnings: string[];
};

export type ImportCompanyOption = {
  id: string;
  name: string;
};

export type ImportLocationOption = {
  id: string;
  companyId: string;
  name: string;
  address: string | null;
};

export function normaliseText(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCollectionMonth(dateValue: string) {
  if (!dateValue) return "";

  const match = dateValue.match(/^(\d{4})-(\d{2})-\d{2}$/);

  if (match) {
    return `${match[1]}-${match[2]}`;
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${parsed.getFullYear()}-${String(
    parsed.getMonth() + 1,
  ).padStart(2, "0")}`;
}

export function buildImportedSampleNumber({
  fileFingerprint,
  rowIndex,
  labCode,
}: {
  fileFingerprint: string;
  rowIndex: number;
  labCode?: string;
}) {
  const cleanedLabCode = (labCode || "")
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, "-");

  if (cleanedLabCode) {
    return `SIS-${cleanedLabCode}`;
  }

  return `SIS-${fileFingerprint.slice(0, 12)}-${String(
    rowIndex + 1,
  ).padStart(2, "0")}`;
}

export function createImportNotes({
  fileName,
  source,
  fileFingerprint,
}: {
  fileName: string;
  source?: string;
  fileFingerprint: string;
}) {
  const parts = [
    `Imported from Sample Identity Sheet: ${fileName}`,
    `Import fingerprint: ${fileFingerprint}`,
  ];

  if (source?.trim()) {
    parts.push(`Sample source: ${source.trim()}`);
  }

  return parts.join(" | ");
}