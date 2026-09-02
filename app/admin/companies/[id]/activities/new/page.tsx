"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Save,
} from "lucide-react";

const activityTypes = [
  "Phone Call",
  "Email",
  "LinkedIn",
  "WhatsApp",
  "Field Visit",
  "Meeting",
  "Sample Collection",
  "Follow-up",
  "Other",
];

export default function NewActivityPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params.id as string;

  const [type, setType] = useState("Field Visit");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [nextAction, setNextAction] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          type,
          title,
          description,
          outcome,
          activityDate,
          nextAction,
          nextFollowUp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create activity."
        );
      }

      router.push(`/admin/companies/${companyId}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-10">

        <Link
          href={`/admin/companies/${companyId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Company
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-8">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Calendar size={20} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Add Activity
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Record a client interaction, field visit,
              meeting, call or follow-up.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Activity Type *
              </label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              >
                {activityTypes.map((activityType) => (
                  <option
                    key={activityType}
                    value={activityType}
                  >
                    {activityType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Met Facility Manager"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Activity Date *
              </label>

              <input
                type="date"
                value={activityDate}
                onChange={(e) =>
                  setActivityDate(e.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Discussion / Notes
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={4}
                placeholder="What was discussed with the client?"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Outcome
              </label>

              <textarea
                value={outcome}
                onChange={(e) =>
                  setOutcome(e.target.value)
                }
                rows={3}
                placeholder="Example: Client requested quotation for water testing."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Next Action
              </label>

              <input
                type="text"
                value={nextAction}
                onChange={(e) =>
                  setNextAction(e.target.value)
                }
                placeholder="Example: Send quotation"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Next Follow-up Date
              </label>

              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) =>
                  setNextFollowUp(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {saving
                ? "Saving Activity..."
                : "Save Activity"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}