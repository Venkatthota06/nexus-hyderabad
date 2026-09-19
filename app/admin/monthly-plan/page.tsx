"use client";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  Target,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./monthly-plan.css";

type PlanItem = {
  id: string;

  companyId: string | null;

  title: string;
  description: string | null;

  category: string;
  priority: string;
  status: string;

  dueDate: string | null;
  completedAt: string | null;

  notes: string | null;

  createdAt: string;
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
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

export default function MonthlyPlanPage() {
  const [items, setItems] =
    useState<PlanItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadPlan() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/monthly-plan",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load monthly plan."
        );
      }

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load monthly plan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlan();
  }, []);

  async function toggleStatus(
    item: PlanItem
  ) {
    const completed =
      item.status.toLowerCase() ===
      "completed";

    try {
      const response =
        await fetch(
          "/api/monthly-plan",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: item.id,

              status: completed
                ? "Planned"
                : "Completed",

              completedAt: completed
                ? null
                : new Date().toISOString(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update plan item."
        );
      }

      await loadPlan();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update item."
      );
    }
  }

  const stats =
    useMemo(() => {
      const completed =
        items.filter(
          (item) =>
            item.status.toLowerCase() ===
            "completed"
        ).length;

      const planned =
        items.filter(
          (item) =>
            item.status.toLowerCase() !==
            "completed"
        ).length;

      const highPriority =
        items.filter(
          (item) =>
            item.priority.toLowerCase() ===
              "high" &&
            item.status.toLowerCase() !==
              "completed"
        ).length;

      return {
        total: items.length,
        completed,
        planned,
        highPriority,
      };
    }, [items]);

  return (
    <div className="monthly-plan-page">

      {/* HEADER */}

      <header className="monthly-plan-header">

        <div>
          <span>
            OPERATIONS PLANNING
          </span>

          <h1>
            Monthly Plan
          </h1>

          <p>
            Manage upcoming client actions,
            sales follow-ups, collections,
            marketing work and operational
            priorities.
          </p>
        </div>

        <Link
          href="/admin/monthly-plan/new"
          className="monthly-plan-add"
        >
          <Plus size={16} />

          Add Plan Item
        </Link>

      </header>

      {/* KPI */}

      <section className="monthly-plan-metrics">

        <PlanMetric
          title="Total Plan Items"
          value={stats.total}
          helper="Current planning register"
          icon={<Target size={20} />}
          type="blue"
        />

        <PlanMetric
          title="Open Items"
          value={stats.planned}
          helper="Still to be completed"
          icon={<Clock3 size={20} />}
          type="amber"
        />

        <PlanMetric
          title="Completed"
          value={stats.completed}
          helper="Finished actions"
          icon={
            <CheckCircle2
              size={20}
            />
          }
          type="green"
        />

        <PlanMetric
          title="High Priority"
          value={
            stats.highPriority
          }
          helper="Needs attention"
          icon={
            <CalendarDays
              size={20}
            />
          }
          type="red"
        />

      </section>

      {/* REGISTER */}

      <section className="monthly-plan-panel">

        <div className="monthly-plan-panel-header">

          <div>
            <span>
              NEXT ACTIONS
            </span>

            <h2>
              Planning Register
            </h2>

            <p>
              These items will feed the
              Next 30 Days Plan section on
              the dashboard.
            </p>
          </div>

          <strong>
            {items.length} items
          </strong>

        </div>

        {loading ? (
          <div className="monthly-plan-empty">
            Loading monthly plan...
          </div>
        ) : error ? (
          <div className="monthly-plan-error">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="monthly-plan-empty">

            <Target size={31} />

            <h3>
              No plan items yet
            </h3>

            <p>
              Add real upcoming work,
              client actions and operational
              goals.
            </p>

            <Link
              href="/admin/monthly-plan/new"
            >
              Add First Plan Item
            </Link>

          </div>
        ) : (
          <div className="monthly-plan-list">

            {items.map(
              (item) => {
                const completed =
                  item.status.toLowerCase() ===
                  "completed";

                return (
                  <article
                    key={item.id}
                    className={
                      completed
                        ? "monthly-plan-item completed"
                        : "monthly-plan-item"
                    }
                  >

                    <button
                      type="button"
                      className="monthly-plan-check"
                      onClick={() =>
                        toggleStatus(
                          item
                        )
                      }
                      aria-label="Toggle plan status"
                    >
                      {completed ? (
                        <CheckCircle2
                          size={20}
                        />
                      ) : (
                        <Circle
                          size={20}
                        />
                      )}
                    </button>

                    <div className="monthly-plan-content">

                      <div className="monthly-plan-title-row">

                        <h3>
                          {item.title}
                        </h3>

                        <span
                          className={`priority ${item.priority.toLowerCase()}`}
                        >
                          {
                            item.priority
                          }
                        </span>

                      </div>

                      {item.description && (
                        <p>
                          {
                            item.description
                          }
                        </p>
                      )}

                      <div className="monthly-plan-meta">

                        <span>
                          {
                            item.category
                          }
                        </span>

                        <span>
                          {formatDate(
                            item.dueDate
                          )}
                        </span>

                        <span>
                          {
                            item.status
                          }
                        </span>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

    </div>
  );
}

function PlanMetric({
  title,
  value,
  helper,
  icon,
  type,
}: {
  title: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
  type:
    | "blue"
    | "green"
    | "amber"
    | "red";
}) {
  return (
    <article
      className={`monthly-plan-metric ${type}`}
    >
      <div className="monthly-plan-metric-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{helper}</small>
      </div>
    </article>
  );
}