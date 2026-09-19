import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Target,
} from "lucide-react";

import { db } from "@/src/prisma/db";

/* =========================================================
   TYPES
========================================================= */

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
  updatedAt: string;
};

/* =========================================================
   GET PLAN ITEMS
========================================================= */

async function getPlanItems(): Promise<PlanItem[]> {
  try {
    const items =
      await db.orm.public.PlanItem
        .orderBy(
          (item) =>
            item.createdAt.desc()
        )
        .all();

    return items as PlanItem[];
  } catch (error) {
    console.error(
      "Dashboard PlanItem error:",
      error
    );

    return [];
  }
}

/* =========================================================
   DATE HELPERS
========================================================= */

function startOfToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function addDays(
  date: Date,
  days: number
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(date);
}

/* =========================================================
   PRIORITY
========================================================= */

function priorityClass(
  priority: string
) {
  const value =
    priority.toLowerCase();

  if (value === "high") {
    return "high";
  }

  if (value === "low") {
    return "low";
  }

  return "medium";
}

/* =========================================================
   COMPONENT
========================================================= */

export default async function Next30DaysPlan() {
  const items =
    await getPlanItems();

  const today =
    startOfToday();

  const nextThirtyDays =
    addDays(today, 30);

  /* ---------------------------------------------------------
     ONLY REAL UPCOMING ITEMS

     Rules:
     - Must have due date
     - Due today or later
     - Due within next 30 days
     - Completed tasks are excluded
  --------------------------------------------------------- */

  const upcomingItems =
    items
      .filter((item) => {
        if (!item.dueDate) {
          return false;
        }

        if (
          item.status
            .toLowerCase() ===
          "completed"
        ) {
          return false;
        }

        const dueDate =
          new Date(
            item.dueDate
          );

        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {
          return false;
        }

        return (
          dueDate >= today &&
          dueDate <=
            nextThirtyDays
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.dueDate!
          ).getTime() -
          new Date(
            b.dueDate!
          ).getTime()
      )
      .slice(0, 6);

  /* ---------------------------------------------------------
     COMPLETED IN CURRENT 30-DAY WINDOW

     Used only for summary count.
  --------------------------------------------------------- */

  const completedCount =
    items.filter(
      (item) => {
        if (
          item.status
            .toLowerCase() !==
          "completed"
        ) {
          return false;
        }

        if (!item.completedAt) {
          return false;
        }

        const completed =
          new Date(
            item.completedAt
          );

        return (
          completed >= today &&
          completed <=
            nextThirtyDays
        );
      }
    ).length;

  return (
    <article className="dashboard-plan-card">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="dashboard-plan-header">

        <div className="dashboard-plan-heading">

          <div className="dashboard-plan-heading-icon">
            <Target size={17} />
          </div>

          <div>
            <span>
              ACTION PLAN
            </span>

            <h2>
              Next 30 Days Plan
            </h2>

            <p>
              Upcoming operational
              and business priorities
            </p>
          </div>

        </div>

        <Link
          href="/admin/monthly-plan"
          className="dashboard-plan-view"
        >
          View All

          <ArrowRight
            size={13}
          />
        </Link>

      </div>

      {/* =====================================================
          BODY
      ====================================================== */}

      {upcomingItems.length ===
      0 ? (

        <div className="dashboard-plan-empty">

          <div className="dashboard-plan-empty-icon">
            <Target size={24} />
          </div>

          <strong>
            No upcoming plan items
          </strong>

          <p>
            Add your real activities
            and goals from Monthly Plan.
          </p>

          <Link href="/admin/monthly-plan/new">
            Add Plan Item

            <ArrowRight
              size={12}
            />
          </Link>

        </div>

      ) : (

        <div className="dashboard-plan-list">

          {upcomingItems.map(
            (item) => (
              <div
                key={item.id}
                className="dashboard-plan-item"
              >

                <div className="dashboard-plan-check">

                  {item.status
                    .toLowerCase() ===
                  "completed" ? (
                    <CheckCircle2
                      size={17}
                    />
                  ) : (
                    <Circle
                      size={17}
                    />
                  )}

                </div>

                <div className="dashboard-plan-item-content">

                  <div className="dashboard-plan-item-title">

                    <strong>
                      {item.title}
                    </strong>

                    <span
                      className={`dashboard-plan-priority ${priorityClass(
                        item.priority
                      )}`}
                    >
                      {
                        item.priority
                      }
                    </span>

                  </div>

                  <div className="dashboard-plan-item-meta">

                    <span>
                      <CalendarDays
                        size={11}
                      />

                      {formatDate(
                        item.dueDate!
                      )}
                    </span>

                    <span>
                      {
                        item.category
                      }
                    </span>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      )}

      {/* =====================================================
          FOOTER SUMMARY
      ====================================================== */}

      <div className="dashboard-plan-footer">

        <div>
          <span>
            Upcoming
          </span>

          <strong>
            {
              upcomingItems.length
            }
          </strong>
        </div>

        <div>
          <span>
            Completed
          </span>

          <strong>
            {completedCount}
          </strong>
        </div>

        <Link href="/admin/monthly-plan/new">
          + Add Plan
        </Link>

      </div>

    </article>
  );
}