"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Save,
  Target,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import "../../companies/[id]/operations-form.css";

export default function NewPlanItemPage() {
  const router =
    useRouter();

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [category, setCategory] =
    useState("Operations");

  const [priority, setPriority] =
    useState("Medium");

  const [status, setStatus] =
    useState("Planned");

  const [dueDate, setDueDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/monthly-plan",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title,
              description,
              category,
              priority,
              status,
              dueDate,
              notes,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create plan item."
        );
      }

      setSuccess(
        "Plan item created successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/monthly-plan"
        );

        router.refresh();
      }, 500);
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
    <main className="operations-form-page">

      <header className="operations-form-topbar">

        <Link href="/admin/monthly-plan">
          <ArrowLeft size={16} />
          Back to Monthly Plan
        </Link>

        <span>
          Nexus Hyderabad Operations
        </span>

      </header>

      <section className="operations-form-hero">

        <div className="operations-form-hero-icon">
          <Target size={24} />
        </div>

        <div>
          <span>
            OPERATIONS PLANNING
          </span>

          <h1>
            Add Plan Item
          </h1>

          <p>
            Add a real task, client action,
            follow-up or business objective.
          </p>
        </div>

      </section>

      <form
        className="operations-form-card"
        onSubmit={handleSubmit}
      >

        <div className="operations-form-section">

          <div className="operations-form-section-heading">
            <div>
              <CalendarDays size={18} />

              <div>
                <h2>
                  Plan Details
                </h2>

                <p>
                  Define the upcoming
                  activity and target date.
                </p>
              </div>
            </div>
          </div>

          <div className="operations-form-grid">

            <div className="operations-field full">
              <label>
                Plan Title *
              </label>

              <input
                required
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Example: Follow up pending quotation"
              />
            </div>

            <div className="operations-field full">
              <label>
                Description
              </label>

              <textarea
                rows={3}
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field">
              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <option>
                  Operations
                </option>

                <option>
                  Sales
                </option>

                <option>
                  Follow-up
                </option>

                <option>
                  Collection
                </option>

                <option>
                  Digital Marketing
                </option>

                <option>
                  Client Service
                </option>

                <option>
                  Sample Collection
                </option>

                <option>
                  Reporting
                </option>

                <option>
                  Other
                </option>
              </select>
            </div>

            <div className="operations-field">
              <label>
                Priority
              </label>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
              >
                <option>
                  Low
                </option>

                <option>
                  Medium
                </option>

                <option>
                  High
                </option>
              </select>
            </div>

            <div className="operations-field">
              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option>
                  Planned
                </option>

                <option>
                  In Progress
                </option>

                <option>
                  Completed
                </option>

                <option>
                  On Hold
                </option>
              </select>
            </div>

            <div className="operations-field">
              <label>
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="operations-field full">
              <label>
                Notes
              </label>

              <textarea
                rows={4}
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
              />
            </div>

          </div>

        </div>

        {success && (
          <div className="operations-success">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {error && (
          <div className="operations-error">
            {error}
          </div>
        )}

        <div className="operations-form-actions">

          <Link href="/admin/monthly-plan">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save Plan Item"}
          </button>

        </div>

      </form>

    </main>
  );
}