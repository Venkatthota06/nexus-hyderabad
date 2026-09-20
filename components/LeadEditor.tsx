"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

type Lead = {
  id: string;
  status: string;
  notes?: string;
  nextFollowUp?: string;
  companyId?: string | null;
};

type Company = {
  id: string;
  name: string;
  status: string;
};

const statuses = [
  "New Lead",
  "Contacted",
  "Visited",
  "Meeting Scheduled",
  "Requirement Identified",
  "Quotation Sent",
  "Follow-up",
  "Won",
  "Lost",
];

function getDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function LeadEditor({ lead }: { lead: Lead }) {
  const router = useRouter();

  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");
  const [nextFollowUp, setNextFollowUp] = useState(
    getDateInputValue(lead.nextFollowUp)
  );
  const [companyId, setCompanyId] = useState(lead.companyId || "");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/companies", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to load companies.");
        }

        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load companies error:", error);
        setError("Unable to load company list.");
      } finally {
        setCompaniesLoading(false);
      }
    }

    loadCompanies();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: lead.id,
          status,
          notes,
          nextFollowUp,
          companyId: companyId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update lead.");
      }

      if (status === "Won" || status === "Lost") {
        setNextFollowUp("");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Update lead error:", error);
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="lead-editor" onSubmit={handleSubmit}>
      <div className="lead-editor-header">
        <div>
          <span>Lead Management</span>
          <h2>Update Lead</h2>
        </div>
        <Save size={20} />
      </div>

      <div className="lead-editor-field">
        <label htmlFor="companyId">
          <Building2 size={15} />
          Linked Company
        </label>

        <select
          id="companyId"
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
          disabled={companiesLoading}
        >
          <option value="">
            {companiesLoading
              ? "Loading companies..."
              : "Not linked to a company"}
          </option>

          {companies.map((company) => (
            <option value={company.id} key={company.id}>
              {company.name}
              {company.status ? ` — ${company.status}` : ""}
            </option>
          ))}
        </select>

        {!companiesLoading && companies.length === 0 && (
          <small>No companies have been added to the CRM yet.</small>
        )}
      </div>

      <div className="lead-editor-field">
        <label htmlFor="leadStatus">Lead Status</label>

        <select
          id="leadStatus"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {statuses.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="lead-editor-field">
        <label htmlFor="nextFollowUp">
          <CalendarDays size={15} />
          Next Follow-up
        </label>

        <input
          id="nextFollowUp"
          type="date"
          value={nextFollowUp}
          disabled={status === "Won" || status === "Lost"}
          onChange={(event) => setNextFollowUp(event.target.value)}
        />

        {(status === "Won" || status === "Lost") && (
          <small>Closed leads do not require another follow-up.</small>
        )}
      </div>

      <div className="lead-editor-field">
        <label htmlFor="leadNotes">Notes</label>

        <textarea
          id="leadNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={7}
          placeholder="Example: Called client. They requested quotation for drinking water testing. Follow up after 2 days."
        />
      </div>

      <button type="submit" className="lead-save-button" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={17} className="submit-spinner" />
            Saving...
          </>
        ) : (
          <>
            <Save size={17} />
            Save Lead
          </>
        )}
      </button>

      {success && (
        <div className="lead-update-success">
          <CheckCircle2 size={18} />
          Lead updated successfully.
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
