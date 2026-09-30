export const STANDARD_SAMPLE_TYPES = [
  "RO Water",
  "Raw Water",
  "Domestic Water",
  "Drinking Water",
  "Potable Water",
  "Dialysis Water",
  "Food",
  "Swab",
  "Indoor Air Quality (IAQ)",
  "Ambient Air Quality (AAQ)",
] as const;

function clean(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function key(value: string | null | undefined) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Converts common spelling/word-order variations to one reporting label.
 * Unknown values are preserved, so unusual laboratory services are never blocked.
 */
export function standardizeSampleType(value: string | null | undefined) {
  const original = clean(value);
  const normalized = key(value);

  if (!normalized) return "";

  if (
    normalized === "ro" ||
    normalized === "ro water" ||
    normalized === "water ro" ||
    normalized.includes("reverse osmosis")
  ) {
    return "RO Water";
  }

  if (
    normalized === "raw" ||
    normalized === "raw water" ||
    normalized === "water raw"
  ) {
    return "Raw Water";
  }

  if (normalized.includes("domestic") && normalized.includes("water")) {
    return "Domestic Water";
  }

  if (
    normalized.includes("drinking water") ||
    normalized === "drinking"
  ) {
    return "Drinking Water";
  }

  if (normalized.includes("potable") && normalized.includes("water")) {
    return "Potable Water";
  }

  if (
    normalized.includes("dialysis") ||
    normalized.includes("aami")
  ) {
    return "Dialysis Water";
  }

  if (normalized === "food" || normalized.includes("food sample")) {
    return "Food";
  }

  if (normalized.includes("swab")) {
    return "Swab";
  }

  if (
    normalized === "iaq" ||
    normalized.includes("indoor air")
  ) {
    return "Indoor Air Quality (IAQ)";
  }

  if (
    normalized === "aaq" ||
    normalized.includes("ambient air")
  ) {
    return "Ambient Air Quality (AAQ)";
  }

  return original;
}

export function cleanSampleSource(value: string | null | undefined) {
  const original = clean(value);
  if (!original) return "";

  return original
    .replace(/\bcapetaria\b/gi, "Cafeteria")
    .replace(/\bcafetaria\b/gi, "Cafeteria")
    .replace(/\bcafeteria\b/gi, "Cafeteria")
    .replace(/\s+/g, " ")
    .trim();
}
