import type { ExtractedIdentificationData } from "@/src/lib/identification-import";

type ResponsesApiOutput = {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  output_text?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanQuantity(value: unknown) {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? Math.round(quantity) : 1;
}

function extractResponseText(payload: ResponsesApiOutput) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function stripCodeFence(value: string) {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function valueAfterLabel(lines: string[], labels: RegExp[]) {
  for (const line of lines) {
    for (const label of labels) {
      const match = line.match(label);
      if (match?.[1]?.trim()) return match[1].trim();
    }
  }
  return "";
}

function normalizeDate(value: string) {
  const match = value.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;
  if (day < 1 || day > 31 || month < 1 || month > 12) return "";
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function inferSampleType(line: string) {
  const lower = line.toLowerCase();
  if (/\b(ro|r\.?o\.?)\b/.test(lower) && /water|sample|ro/.test(lower)) return "RO Water";
  if (/raw\s*water|\braw\b/.test(lower)) return "Raw Water";
  if (/domestic\s*water/.test(lower)) return "Domestic Water";
  if (/drinking\s*water/.test(lower)) return "Drinking Water";
  if (/potable\s*water/.test(lower)) return "Potable Water";
  if (/dialysis/.test(lower)) return "Dialysis Water";
  if (/\biaq\b|indoor\s*air/.test(lower)) return "IAQ";
  if (/\baaq\b|ambient\s*air/.test(lower)) return "AAQ";
  if (/\bswab\b/.test(lower)) return "Swab";
  if (/\bfood\b/.test(lower)) return "Food";
  return "";
}

function inferSource(line: string, sampleType: string) {
  let source = line
    .replace(/\b(ro|r\.?o\.?)\s*water\b/gi, "")
    .replace(/\b(raw|domestic|drinking|potable|dialysis)\s*water\b/gi, "")
    .replace(/\b(iaq|aaq|indoor air quality|ambient air quality|food|swab)\b/gi, "")
    .replace(/^\s*\d+[.)\-:]?\s*/, "")
    .replace(/[|]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[-:;,\s]+|[-:;,\s]+$/g, "")
    .trim();
  if (source.toLowerCase() === sampleType.toLowerCase()) source = "";
  return source;
}

function parseFreeOcrText(text: string): ExtractedIdentificationData {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const customerName = valueAfterLabel(lines, [
    /(?:customer|client|company|customer name|name of customer)\s*[:\-]\s*(.+)$/i,
  ]);
  const locationName = valueAfterLabel(lines, [
    /(?:location|site|sampling location)\s*[:\-]\s*(.+)$/i,
  ]);
  const address = valueAfterLabel(lines, [/(?:address)\s*[:\-]\s*(.+)$/i]);
  const collectedBy = valueAfterLabel(lines, [
    /(?:collected by|sample collected by|collector)\s*[:\-]\s*(.+)$/i,
  ]);
  const dateText = valueAfterLabel(lines, [
    /(?:collection date|date of collection|sample collection date|date)\s*[:\-]\s*(.+)$/i,
  ]);
  const receivedText = valueAfterLabel(lines, [
    /(?:sample received on|received on|received date)\s*[:\-]\s*(.+)$/i,
  ]);

  const samples = lines
    .map((line) => {
      const sampleType = inferSampleType(line);
      if (!sampleType) return null;
      const quantityMatch = line.match(/(?:qty|quantity)\s*[:x-]?\s*(\d+)/i);
      return {
        sampleType,
        source: inferSource(line, sampleType),
        quantity: quantityMatch ? cleanQuantity(quantityMatch[1]) : 1,
        labCode: "",
      };
    })
    .filter((sample): sample is NonNullable<typeof sample> => Boolean(sample));

  const warnings: string[] = [
    "Free OCR was used. Verify all detected values against the original sheet before importing.",
  ];
  if (!customerName) warnings.push("Customer name was not read confidently; select the company manually.");
  if (!normalizeDate(dateText)) warnings.push("Collection date was not read confidently; enter it manually.");
  if (samples.length === 0) warnings.push("No sample rows were read confidently; add the sample rows manually.");

  return {
    customerName,
    locationName,
    address,
    collectionDate: normalizeDate(dateText),
    collectedBy,
    sampleReceivedOn: normalizeDate(receivedText),
    samples,
    warnings,
  };
}

async function extractWithFreeOcr(bytes: Buffer, mimeType: string) {
  if (!/^image\/(?:jpeg|jpg|png)$/i.test(mimeType)) return null;
  const { recognize } = await import("tesseract.js");
  const result = await recognize(bytes, "eng", {
    logger: (message) => {
      if (message.status === "recognizing text" && typeof message.progress === "number") {
        console.info(`Identification OCR ${Math.round(message.progress * 100)}%`);
      }
    },
  });
  const text = result.data.text?.trim() || "";
  return text ? parseFreeOcrText(text) : null;
}

async function extractWithOpenAI({
  bytes,
  mimeType,
  fileName,
  apiKey,
}: {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
  apiKey: string;
}): Promise<ExtractedIdentificationData> {
  const model = process.env.IDENTIFICATION_EXTRACTION_MODEL?.trim() || "gpt-5.6-luna";
  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;
  const fileContent = mimeType === "application/pdf"
    ? { type: "input_file", filename: fileName, file_data: dataUrl }
    : { type: "input_image", image_url: dataUrl, detail: "high" };

  const instructions = `Read this Nexus Test Labs Sample Identity Sheet. Return ONLY JSON with: {"customerName":"","locationName":"","address":"","collectionDate":"","collectedBy":"","sampleReceivedOn":"","samples":[{"sampleType":"","source":"","quantity":1,"labCode":""}],"warnings":[]}. Use only visible information. Never guess. Dates must be YYYY-MM-DD when clear. Include every visible filled sample row. Keep sample type and source close to the document. Leave uncertain fields blank and add a warning.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: [{ role: "user", content: [{ type: "input_text", text: instructions }, fileContent] }] }),
  });
  if (!response.ok) throw new Error(`Identification extraction provider failed (${response.status}).`);
  const payload = (await response.json()) as ResponsesApiOutput;
  const rawText = extractResponseText(payload);
  if (!rawText) throw new Error("Identification extraction provider returned no text.");
  const parsed = JSON.parse(stripCodeFence(rawText)) as Record<string, unknown>;
  const rawSamples = Array.isArray(parsed.samples) ? parsed.samples : [];
  return {
    customerName: clean(parsed.customerName), locationName: clean(parsed.locationName), address: clean(parsed.address),
    collectionDate: clean(parsed.collectionDate), collectedBy: clean(parsed.collectedBy), sampleReceivedOn: clean(parsed.sampleReceivedOn),
    samples: rawSamples.map((sample) => {
      const row = sample && typeof sample === "object" ? sample as Record<string, unknown> : {};
      return { sampleType: clean(row.sampleType), source: clean(row.source), quantity: cleanQuantity(row.quantity), labCode: clean(row.labCode) };
    }),
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(clean).filter(Boolean) : [],
  };
}

export async function extractIdentificationSheet({ bytes, mimeType, fileName }: { bytes: Buffer; mimeType: string; fileName: string }): Promise<ExtractedIdentificationData | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      return await extractWithOpenAI({ bytes, mimeType, fileName, apiKey });
    } catch (error) {
      console.error("Paid identification extraction failed; trying free OCR:", error);
    }
  }
  return extractWithFreeOcr(bytes, mimeType);
}
