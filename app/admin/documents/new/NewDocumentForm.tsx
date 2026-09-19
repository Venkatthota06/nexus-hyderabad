"use client";

import Link from "next/link";
import "./new-document.css";

import {
  useRouter,
} from "next/navigation";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderOpen,
  LinkIcon,
  Loader2,
  Save,
} from "lucide-react";

import "./new-document.css";

type Company = {
  id: string;
  name: string;
};

export default function NewDocumentForm() {
  const router =
    useRouter();

  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response =
          await fetch(
            "/api/companies",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const rows =
          Array.isArray(data)
            ? data
            : data.companies ||
              data.results ||
              [];

        setCompanies(
          rows.map(
            (
              company: any
            ) => ({
              id:
                company.id,

              name:
                company.name,
            })
          )
        );
      } catch (error) {
        console.error(
          "Load companies error:",
          error
        );
      }
    }

    loadCompanies();
  }, []);

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const formData =
      new FormData(
        event.currentTarget
      );

    const payload = {
      companyId:
        formData
          .get("companyId")
          ?.toString() || "",

      title:
        formData
          .get("title")
          ?.toString() || "",

      documentType:
        formData
          .get("documentType")
          ?.toString() || "",

      documentNumber:
        formData
          .get("documentNumber")
          ?.toString() || "",

      description:
        formData
          .get("description")
          ?.toString() || "",

      fileName:
        formData
          .get("fileName")
          ?.toString() || "",

      fileUrl:
        formData
          .get("fileUrl")
          ?.toString() || "",

      fileReference:
        formData
          .get("fileReference")
          ?.toString() || "",

      status:
        formData
          .get("status")
          ?.toString() ||
        "Active",

      issueDate:
        formData
          .get("issueDate")
          ?.toString() || "",

      expiryDate:
        formData
          .get("expiryDate")
          ?.toString() || "",

      notes:
        formData
          .get("notes")
          ?.toString() || "",
    };

    try {
      const response =
        await fetch(
          "/api/documents",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to save document."
        );

        return;
      }

      setSuccess(
        "Document saved successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/documents"
        );

        router.refresh();
      }, 600);
    } catch (error) {
      console.error(
        "Save document error:",
        error
      );

      setError(
        "Unable to save document."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="new-document-page">

      <div className="new-document-back">

        <Link href="/admin/documents">
          <ArrowLeft
            size={14}
          />

          Documents
        </Link>

        <span>
          Hyderabad Operations CRM
        </span>

      </div>

      <section className="new-document-hero">

        <div className="new-document-hero-icon">
          <FolderOpen
            size={24}
          />
        </div>

        <div>
          <span>
            DOCUMENT MANAGEMENT
          </span>

          <h1>
            Add Document
          </h1>

          <p>
            Record a real client,
            commercial, testing or
            operational document in
            the CRM.
          </p>
        </div>

      </section>

      <form
        onSubmit={
          handleSubmit
        }
        className="new-document-form"
      >

        <section className="new-document-panel">

          <PanelTitle
            icon={
              <FileText
                size={17}
              />
            }
            title="Document Information"
            description="Main document details and classification."
          />

          <div className="new-document-grid">

            <Field label="Document Title *">
              <input
                name="title"
                required
                placeholder="Enter document title"
              />
            </Field>

            <Field label="Document Type *">
              <select
                name="documentType"
                required
                defaultValue=""
              >
                <option value="">
                  Select type
                </option>

                <option value="Quotation">
                  Quotation
                </option>

                <option value="Work Order / PO">
                  Work Order / PO
                </option>

                <option value="Test Report">
                  Test Report
                </option>

                <option value="Invoice">
                  Invoice
                </option>

                <option value="Payment Proof">
                  Payment Proof
                </option>

                <option value="Client Document">
                  Client Document
                </option>

                <option value="Brochure">
                  Brochure
                </option>

                <option value="Certificate">
                  Certificate
                </option>

                <option value="Internal Document">
                  Internal Document
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </Field>

            <Field label="Document Number">
              <input
                name="documentNumber"
                placeholder="Quotation / PO / Report / Invoice number"
              />
            </Field>

            <Field label="Status">
              <select
                name="status"
                defaultValue="Active"
              >
                <option value="Active">
                  Active
                </option>

                <option value="Expired">
                  Expired
                </option>

                <option value="Archived">
                  Archived
                </option>
              </select>
            </Field>

            <Field
              label="Description"
              full
            >
              <textarea
                name="description"
                rows={4}
                placeholder="Brief description of the document..."
              />
            </Field>

          </div>

        </section>

        <section className="new-document-panel">

          <PanelTitle
            icon={
              <Building2
                size={17}
              />
            }
            title="Client Relationship"
            description="Optionally connect this document to an existing CRM company."
          />

          <div className="new-document-grid">

            <Field label="Company">
              <select
                name="companyId"
                defaultValue=""
              >
                <option value="">
                  Not linked to a company
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={
                        company.id
                      }
                      value={
                        company.id
                      }
                    >
                      {
                        company.name
                      }
                    </option>
                  )
                )}

              </select>
            </Field>

          </div>

        </section>

        <section className="new-document-panel">

          <PanelTitle
            icon={
              <LinkIcon
                size={17}
              />
            }
            title="File Reference"
            description="Store the real file name, URL or internal reference. This does not upload a file."
          />

          <div className="new-document-grid">

            <Field label="File Name">
              <input
                name="fileName"
                placeholder="Example: quotation.pdf"
              />
            </Field>

            <Field label="File URL">
              <input
                name="fileUrl"
                type="url"
                placeholder="https://..."
              />
            </Field>

            <Field
              label="File Reference"
              full
            >
              <input
                name="fileReference"
                placeholder="Drive location, internal path or reference"
              />
            </Field>

          </div>

        </section>

        <section className="new-document-panel">

          <PanelTitle
            icon={
              <CalendarDays
                size={17}
              />
            }
            title="Dates & Notes"
            description="Document validity and additional operational information."
          />

          <div className="new-document-grid">

            <Field label="Issue Date">
              <input
                name="issueDate"
                type="date"
              />
            </Field>

            <Field label="Expiry Date">
              <input
                name="expiryDate"
                type="date"
              />
            </Field>

            <Field
              label="Notes"
              full
            >
              <textarea
                name="notes"
                rows={5}
                placeholder="Additional notes..."
              />
            </Field>

          </div>

        </section>

        {success && (
          <div className="new-document-success">
            <CheckCircle2
              size={16}
            />

            {success}
          </div>
        )}

        {error && (
          <div className="new-document-error">
            {error}
          </div>
        )}

        <div className="new-document-actions">

          <Link href="/admin/documents">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2
                  size={15}
                  className="new-document-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save
                  size={15}
                />

                Save Document
              </>
            )}
          </button>

        </div>

      </form>

    </main>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children:
    React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`new-document-field ${
        full
          ? "new-document-field-full"
          : ""
      }`}
    >
      <label>
        {label}
      </label>

      {children}
    </div>
  );
}

function PanelTitle({
  icon,
  title,
  description,
}: {
  icon:
    React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="new-document-panel-title">

      <div>
        {icon}
      </div>

      <section>
        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>
      </section>

    </div>
  );
}