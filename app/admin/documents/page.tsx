import Link from "next/link";

import {
  Building2,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderOpen,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { db } from "@/src/prisma/db";

import "./documents.css";

export const dynamic =
  "force-dynamic";

type DocumentRow = {
  id: string;

  companyId:
    | string
    | null;

  title: string;

  documentType: string;

  documentNumber:
    | string
    | null;

  description:
    | string
    | null;

  fileName:
    | string
    | null;

  fileUrl:
    | string
    | null;

  fileReference:
    | string
    | null;

  status: string;

  issueDate:
    | string
    | null;

  expiryDate:
    | string
    | null;

  createdAt: string;
};

type CompanyRow = {
  id: string;
  name: string;
};

function formatDate(
  value:
    | string
    | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function statusClass(
  status: string
) {
  return status
    .toLowerCase()
    .replaceAll(
      " ",
      "-"
    );
}

export default async function DocumentsPage() {
  let documents:
    DocumentRow[] = [];

  let companies:
    CompanyRow[] = [];

  try {
    const [
      documentRows,
      companyRows,
    ] =
      await Promise.all([
        db.orm.public.Document
          .orderBy(
            (document) =>
              document.createdAt.desc()
          )
          .all(),

        db.orm.public.Company
          .orderBy(
            (company) =>
              company.name.asc()
          )
          .all(),
      ]);

    documents =
      documentRows as DocumentRow[];

    companies =
      companyRows.map(
        (company) => ({
          id:
            company.id,

          name:
            company.name,
        })
      );
  } catch (error) {
    console.error(
      "Documents page error:",
      error
    );
  }

  const companyMap =
    new Map(
      companies.map(
        (company) => [
          company.id,
          company.name,
        ]
      )
    );

  const activeDocuments =
    documents.filter(
      (document) =>
        document.status ===
        "Active"
    ).length;

  const linkedDocuments =
    documents.filter(
      (document) =>
        Boolean(
          document.companyId
        )
    ).length;

  const externalFiles =
    documents.filter(
      (document) =>
        Boolean(
          document.fileUrl
        )
    ).length;

  const today =
    new Date();

  const next30 =
    new Date();

  next30.setDate(
    next30.getDate() + 30
  );

  const expiringSoon =
    documents.filter(
      (document) => {
        if (
          !document.expiryDate
        ) {
          return false;
        }

        const expiry =
          new Date(
            document.expiryDate
          );

        return (
          expiry >= today &&
          expiry <= next30
        );
      }
    ).length;

  return (
    <main className="documents-page">

      <section className="documents-hero">

        <div className="documents-hero-left">

          <div className="documents-hero-icon">
            <FolderOpen
              size={25}
            />
          </div>

          <div>
            <span>
              DOCUMENT MANAGEMENT
            </span>

            <h1>
              Documents
            </h1>

            <p>
              Manage client documents,
              quotations, work orders,
              reports, payment proofs
              and operational references.
            </p>
          </div>

        </div>

        <Link
          href="/admin/documents/new"
          className="documents-add-button"
        >
          <Plus size={15} />

          Add Document
        </Link>

      </section>

      <section className="documents-metrics">

        <MetricCard
          label="Total Documents"
          value={
            documents.length
          }
          icon={
            <FileText
              size={18}
            />
          }
        />

        <MetricCard
          label="Active"
          value={
            activeDocuments
          }
          icon={
            <FileCheck2
              size={18}
            />
          }
        />

        <MetricCard
          label="Client Linked"
          value={
            linkedDocuments
          }
          icon={
            <Building2
              size={18}
            />
          }
        />

        <MetricCard
          label="Expiring in 30 Days"
          value={
            expiringSoon
          }
          icon={
            <CalendarDays
              size={18}
            />
          }
        />

        <MetricCard
          label="File Links"
          value={
            externalFiles
          }
          icon={
            <ShieldCheck
              size={18}
            />
          }
        />

      </section>

      <section className="documents-panel">

        <div className="documents-panel-header">

          <div>
            <span>
              DOCUMENT REGISTER
            </span>

            <h2>
              Operational Documents
            </h2>

            <p>
              Real documents and
              references stored in the
              Hyderabad CRM.
            </p>
          </div>

          <strong>
            {documents.length} Records
          </strong>

        </div>

        {documents.length === 0 ? (
          <div className="documents-empty">

            <div>
              <FolderOpen
                size={31}
              />
            </div>

            <span>
              DOCUMENTS
            </span>

            <h3>
              No documents recorded
            </h3>

            <p>
              Add the first real client
              or operational document.
            </p>

            <Link href="/admin/documents/new">
              <Plus size={14} />

              Add Document
            </Link>

          </div>
        ) : (
          <div className="documents-table-wrap">

            <table className="documents-table">

              <thead>
                <tr>
                  <th>
                    Document
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Number
                  </th>

                  <th>
                    Issue Date
                  </th>

                  <th>
                    Expiry
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    File
                  </th>
                </tr>
              </thead>

              <tbody>
                {documents.map(
                  (document) => (
                    <tr
                      key={
                        document.id
                      }
                    >
                      <td>
                        <div className="documents-name-cell">

                          <div>
                            <FileText
                              size={14}
                            />
                          </div>

                          <section>
                            <strong>
                              {
                                document.title
                              }
                            </strong>

                            <span>
                              {document.fileName ||
                                document.fileReference ||
                                "No file reference"}
                            </span>
                          </section>

                        </div>
                      </td>

                      <td>
                        {document.companyId ? (
                          <Link
                            href={`/admin/companies/${document.companyId}`}
                            className="documents-company-link"
                          >
                            {companyMap.get(
                              document.companyId
                            ) ||
                              "Linked Company"}
                          </Link>
                        ) : (
                          <span className="documents-muted">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="documents-type">
                          {
                            document.documentType
                          }
                        </span>
                      </td>

                      <td>
                        {document.documentNumber ||
                          "—"}
                      </td>

                      <td>
                        {formatDate(
                          document.issueDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          document.expiryDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`documents-status ${statusClass(
                            document.status
                          )}`}
                        >
                          {
                            document.status
                          }
                        </span>
                      </td>

                      <td>
                        {document.fileUrl ? (
                          <a
                            href={
                              document.fileUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="documents-open-file"
                          >
                            Open

                            <ExternalLink
                              size={11}
                            />
                          </a>
                        ) : (
                          <span className="documents-muted">
                            —
                          </span>
                        )}
                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        )}

      </section>

    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon:
    React.ReactNode;
}) {
  return (
    <article className="documents-metric">

      <div>
        {icon}
      </div>

      <section>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </section>

    </article>
  );
}