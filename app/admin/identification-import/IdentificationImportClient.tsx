"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  Save,
  TestTube2,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

import {
  getCollectionMonth,
  type ImportCompanyOption,
  type ImportLocationOption,
  type ImportPreview,
} from "@/src/lib/identification-import";

type PreviewResponse = {
  success: boolean;
  message: string;

  extractionStatus?: string;

  preview?: ImportPreview;

  companies?: ImportCompanyOption[];

  locations?: ImportLocationOption[];
};

type ImportResult = {
  success: boolean;
  duplicateOnly?: boolean;
  message: string;

  created?: Array<{
    id: string;
    sampleNumber: string;
    sampleType: string;
    quantity: number;
  }>;

  duplicates?: Array<{
    sampleNumber: string;
    sampleType: string;
  }>;
};

export default function IdentificationImportClient() {
  const [file, setFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<ImportPreview | null>(null);

  const [companies, setCompanies] = useState<ImportCompanyOption[]>([]);

  const [locations, setLocations] = useState<ImportLocationOption[]>([]);

  const [loadingPreview, setLoadingPreview] = useState(false);

  const [importing, setImporting] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState<ImportResult | null>(null);

  const companyLocations = useMemo(() => {
    if (!preview?.companyId) return [];

    return locations.filter(
      (location) => location.companyId === preview.companyId,
    );
  }, [locations, preview?.companyId]);

  const totalSamples = useMemo(() => {
    if (!preview) return 0;

    return preview.samples.reduce(
      (total, row) => total + Math.max(0, Number(row.quantity) || 0),
      0,
    );
  }, [preview]);

  function resetImport() {
    setFile(null);
    setPreview(null);
    setCompanies([]);
    setLocations([]);
    setError("");
    setResult(null);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(null);
    setError("");
    setResult(null);

    await preparePreview(selectedFile);
  }

  async function preparePreview(selectedFile: File) {
    try {
      setLoadingPreview(true);
      setError("");

      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        "/api/identification-import/preview",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = (await response.json()) as PreviewResponse;

      if (!response.ok || !data.success || !data.preview) {
        throw new Error(
          data.message || "Unable to prepare identification sheet.",
        );
      }

      setPreview(data.preview);

      setCompanies(data.companies || []);

      setLocations(data.locations || []);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Unable to prepare identification sheet.",
      );
    } finally {
      setLoadingPreview(false);
    }
  }

  function updatePreview<K extends keyof ImportPreview>(
    key: K,
    value: ImportPreview[K],
  ) {
    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function selectCompany(companyId: string) {
    const company = companies.find(
      (item) => item.id === companyId,
    );

    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,

        companyId,

        companyName: company?.name || "",

        locationId: "",
        locationName: "",
      };
    });
  }

  function selectLocation(locationId: string) {
    const location = locations.find(
      (item) => item.id === locationId,
    );

    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,

        locationId,

        locationName: location?.name || "",

        address:
          current.address ||
          location?.address ||
          "",
      };
    });
  }

  function updateCollectionDate(value: string) {
    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,
        collectionDate: value,
        collectionMonth: getCollectionMonth(value),
      };
    });
  }

  function updateSample(
    rowId: string,
    field: "sampleType" | "source" | "quantity" | "labCode",
    value: string | number,
  ) {
    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,

        samples: current.samples.map((row) =>
          row.rowId === rowId
            ? {
                ...row,
                [field]: value,
              }
            : row,
        ),
      };
    });
  }

  function addSampleRow() {
    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,

        samples: [
          ...current.samples,

          {
            rowId: crypto.randomUUID(),
            sampleType: "",
            source: "",
            quantity: 1,
            labCode: "",
          },
        ],
      };
    });
  }

  function removeSampleRow(rowId: string) {
    setPreview((current) => {
      if (!current) return current;

      if (current.samples.length === 1) {
        return current;
      }

      return {
        ...current,

        samples: current.samples.filter(
          (row) => row.rowId !== rowId,
        ),
      };
    });
  }

  async function confirmImport() {
    if (!preview) return;

    try {
      setImporting(true);
      setError("");
      setResult(null);

      const response = await fetch(
        "/api/identification-import/confirm",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(preview),
        },
      );

      const data = (await response.json()) as ImportResult;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to import identification sheet.",
        );
      }

      setResult(data);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Unable to import identification sheet.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/admin/samples"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Samples
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-600 p-3 text-white shadow-sm">
                <FileSearch size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
                  Nexus Test Labs
                </p>

                <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">
                  Identification Sheet Import
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Upload a Sample Identity Sheet, verify the collection information
              and import the confirmed samples into the Hyderabad operations
              database.
            </p>
          </div>

          {preview && (
            <button
              type="button"
              onClick={resetImport}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              New Sheet
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />

            <div>
              <strong className="block text-sm">Import problem</strong>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2 size={21} className="mt-0.5 shrink-0" />

            <div>
              <strong className="block">
                {result.duplicateOnly
                  ? "Already imported"
                  : "Import completed"}
              </strong>

              <p className="mt-1 text-sm">
                {result.message}
              </p>

              {!result.duplicateOnly && (
                <Link
                  href="/admin/samples"
                  className="mt-3 inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
                >
                  View Samples
                </Link>
              )}
            </div>
          </div>
        )}

        {!preview && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <label className="flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-cyan-500 hover:bg-cyan-50/40">

              {loadingPreview ? (
                <>
                  <Loader2
                    size={44}
                    className="mb-5 animate-spin text-cyan-600"
                  />

                  <h2 className="text-xl font-bold text-slate-900">
                    Preparing preview
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Checking the identification sheet and loading CRM matches.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-5 rounded-2xl bg-cyan-100 p-4 text-cyan-700">
                    <UploadCloud size={36} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Upload Sample Identity Sheet
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Select the completed sheet received during sample
                    collection.
                  </p>

                  <div className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-cyan-700 shadow-sm ring-1 ring-slate-200">
                    Select PDF / JPG / PNG
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Maximum file size: 15 MB
                  </p>
                </>
              )}

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFile}
                disabled={loadingPreview}
                className="hidden"
              />
            </label>
          </section>
        )}

        {preview && (
          <div className="space-y-6">

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <div>
                  <h2 className="font-bold text-amber-950">
                    Review before import
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Automatic scanned-sheet reading is not connected yet.
                    Enter or verify the information below before confirming.
                    Nothing is saved until you click Confirm Import.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-cyan-700" />

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Source Sheet
                    </h2>

                    <p className="text-sm text-slate-500">
                      {file?.name || preview.fileName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">

                <Field label="Company" icon={<Building2 size={15} />}>
                  <select
                    value={preview.companyId}
                    onChange={(event) =>
                      selectCompany(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select company</option>

                    {companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Location" icon={<MapPin size={15} />}>
                  <select
                    value={preview.locationId}
                    disabled={!preview.companyId}
                    onChange={(event) =>
                      selectLocation(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      {preview.companyId
                        ? "Select location"
                        : "Select company first"}
                    </option>

                    {companyLocations.map((location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Collection Date"
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    value={preview.collectionDate}
                    onChange={(event) =>
                      updateCollectionDate(event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Collection Month"
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    value={preview.collectionMonth}
                    readOnly
                    placeholder="Automatic from collection date"
                    className={`${inputClass} bg-slate-50`}
                  />
                </Field>

                <Field
                  label="Collected By"
                  icon={<UserRound size={15} />}
                >
                  <input
                    value={preview.collectedBy}
                    onChange={(event) =>
                      updatePreview(
                        "collectedBy",
                        event.target.value,
                      )
                    }
                    placeholder="Collector name from sheet"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Sample Received On"
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    value={preview.sampleReceivedOn}
                    onChange={(event) =>
                      updatePreview(
                        "sampleReceivedOn",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Address / Customer Details"
                    icon={<MapPin size={15} />}
                  >
                    <textarea
                      value={preview.address}
                      onChange={(event) =>
                        updatePreview(
                          "address",
                          event.target.value,
                        )
                      }
                      rows={3}
                      className={inputClass}
                      placeholder="Address shown on identification sheet"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <TestTube2 size={20} className="text-cyan-700" />

                    <h2 className="font-bold text-slate-950">
                      Sample Details
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter each row exactly as shown on the Sample Identity Sheet.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSampleRow}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus size={16} />
                  Add Sample Row
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">#</th>
                      <th className="px-5 py-4">Sample Type</th>
                      <th className="px-5 py-4">Source</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Nexus Lab Code</th>
                      <th className="px-5 py-4"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {preview.samples.map((row, index) => (
                      <tr
                        key={row.rowId}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 font-bold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <input
                            value={row.sampleType}
                            onChange={(event) =>
                              updateSample(
                                row.rowId,
                                "sampleType",
                                event.target.value,
                              )
                            }
                            placeholder="Water / Food / Swab / IAQ"
                            className={tableInputClass}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            value={row.source}
                            onChange={(event) =>
                              updateSample(
                                row.rowId,
                                "source",
                                event.target.value,
                              )
                            }
                            placeholder="Sample source"
                            className={tableInputClass}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(event) =>
                              updateSample(
                                row.rowId,
                                "quantity",
                                Number(event.target.value),
                              )
                            }
                            className={`${tableInputClass} w-24`}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            value={row.labCode}
                            onChange={(event) =>
                              updateSample(
                                row.rowId,
                                "labCode",
                                event.target.value,
                              )
                            }
                            placeholder="Lab code if available"
                            className={tableInputClass}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              removeSampleRow(row.rowId)
                            }
                            disabled={preview.samples.length === 1}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-slate-50 p-5 md:flex-row md:items-center md:p-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    This Sheet
                  </span>

                  <div className="mt-1 flex items-baseline gap-2">
                    <strong className="text-3xl text-slate-950">
                      {totalSamples}
                    </strong>

                    <span className="text-sm text-slate-500">
                      physical samples
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={confirmImport}
                  disabled={importing || Boolean(result)}
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Confirm Import
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
        {icon}
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400";

const tableInputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";