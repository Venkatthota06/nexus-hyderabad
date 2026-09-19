import Link from "next/link";

import {
  ExternalLink,
  FileText,
  FolderOpen,
  Plus,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import styles from "./CompanyDocumentsSection.module.css";

type Props = {
  companyId: string;
};

type DocumentRow = {
  id: string;
  title: string;
  documentType: string;
  documentNumber: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileReference: string | null;
  status: string;
  issueDate: string | null;
  expiryDate: string | null;
  createdAt: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusClass(status: string) {
  const clean = status.trim().toLowerCase();

  if (clean === "active") return styles.active;
  if (clean === "expired") return styles.expired;
  if (clean === "archived") return styles.archived;

  return "";
}

export default async function CompanyDocumentsSection({
  companyId,
}: Props) {
  let documents: DocumentRow[] = [];

  try {
    const rows = await db.orm.public.Document
      .where({ companyId })
      .orderBy((document) => document.createdAt.desc())
      .all();

    documents = rows as DocumentRow[];
  } catch (error) {
    console.error("Company documents load error:", error);
  }

  const activeDocuments = documents.filter(
    (document) => document.status === "Active"
  ).length;

  const fileLinks = documents.filter(
    (document) => Boolean(document.fileUrl)
  ).length;

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <div className={styles.icon}>
            <FolderOpen size={18} />
          </div>

          <div>
            <span>DOCUMENT MANAGEMENT</span>
            <h2>Client Documents</h2>
            <p>
              Quotations, work orders, reports, payment proofs and other
              documents linked to this client.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/documents" className={styles.secondaryButton}>
            View All
          </Link>

          <Link
            href={`/admin/documents/new?companyId=${encodeURIComponent(
              companyId
            )}`}
            className={styles.addButton}
          >
            <Plus size={14} />
            Add Document
          </Link>
        </div>
      </div>

      <div className={styles.summary}>
        <div>
          <span>Total Documents</span>
          <strong>{documents.length}</strong>
        </div>

        <div>
          <span>Active</span>
          <strong>{activeDocuments}</strong>
        </div>

        <div>
          <span>File Links</span>
          <strong>{fileLinks}</strong>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className={styles.empty}>
          <FolderOpen size={28} />
          <strong>No documents linked</strong>
          <p>No document records currently exist for this company.</p>

          <Link
            href={`/admin/documents/new?companyId=${encodeURIComponent(
              companyId
            )}`}
          >
            <Plus size={13} />
            Add First Document
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Number</th>
                <th>Issue Date</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className={styles.documentName}>
                      <span>
                        <FileText size={14} />
                      </span>

                      <div>
                        <strong>{document.title}</strong>
                        <small>
                          {document.fileName ||
                            document.fileReference ||
                            "No file reference"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={styles.type}>
                      {document.documentType}
                    </span>
                  </td>

                  <td>{document.documentNumber || "—"}</td>
                  <td>{formatDate(document.issueDate)}</td>
                  <td>{formatDate(document.expiryDate)}</td>

                  <td>
                    <span
                      className={`${styles.status} ${statusClass(
                        document.status
                      )}`}
                    >
                      {document.status}
                    </span>
                  </td>

                  <td>
                    {document.fileUrl ? (
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.openLink}
                      >
                        Open
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
