import type { ExtractedIdentificationData } from "@/src/lib/identification-import";

type ResponsesApiOutput = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
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
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function extractIdentificationSheet({
  bytes,
  mimeType,
  fileName,
}: {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
}): Promise<ExtractedIdentificationData | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const model =
    process.env.IDENTIFICATION_EXTRACTION_MODEL?.trim() || "gpt-5.6-luna";

  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

  const fileContent =
    mimeType === "application/pdf"
      ? {
          type: "input_file",
          filename: fileName,
          file_data: dataUrl,
        }
      : {
          type: "input_image",
          image_url: dataUrl,
          detail: "high",
        };

  const instructions = `
Read this Nexus Test Labs Sample Identity Sheet.

Return ONLY a JSON object with this exact structure:
{
  "customerName": "",
  "locationName": "",
  "address": "",
  "collectionDate": "",
  "collectedBy": "",
  "sampleReceivedOn": "",
  "samples": [
    {
      "sampleType": "",
      "source": "",
      "quantity": 1,
      "labCode": ""
    }
  ],
  "warnings": []
}

Rules:
- Use only information visibly present in the document.
- Never guess missing or unclear information.
- Dates must be YYYY-MM-DD only when the date is clear.
- Collector name must only be returned when visibly written.
- Lab code must only be returned when visibly written.
- Include every visible filled sample row.
- Keep sample type and source wording close to the document.
- Quantity must be a positive integer; use 1 only when one sample is clearly represented.
- If customer/location/date/collector/sample information is uncertain, leave it blank and add a short warning.
- Do not invent a CRM company or location match.
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: instructions },
            fileContent,
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Identification extraction provider failed (${response.status}): ${message.slice(0, 500)}`,
    );
  }

  const payload = (await response.json()) as ResponsesApiOutput;
  const rawText = extractResponseText(payload);

  if (!rawText) {
    throw new Error("Identification extraction provider returned no text.");
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(stripCodeFence(rawText)) as Record<string, unknown>;
  } catch {
    throw new Error("Identification extraction provider returned invalid JSON.");
  }

  const rawSamples = Array.isArray(parsed.samples) ? parsed.samples : [];

  return {
    customerName: clean(parsed.customerName),
    locationName: clean(parsed.locationName),
    address: clean(parsed.address),
    collectionDate: clean(parsed.collectionDate),
    collectedBy: clean(parsed.collectedBy),
    sampleReceivedOn: clean(parsed.sampleReceivedOn),
    samples: rawSamples.map((sample) => {
      const row =
        sample && typeof sample === "object"
          ? (sample as Record<string, unknown>)
          : {};

      return {
        sampleType: clean(row.sampleType),
        source: clean(row.source),
        quantity: cleanQuantity(row.quantity),
        labCode: clean(row.labCode),
      };
    }),
    warnings: Array.isArray(parsed.warnings)
      ? parsed.warnings.map(clean).filter(Boolean)
      : [],
  };
}
