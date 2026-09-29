"use client";

import { useRouter } from "next/navigation";

type MonthSelectorProps = {
  selectedMonth: string;
};

export default function MonthSelector({
  selectedMonth,
}: MonthSelectorProps) {
  const router = useRouter();

  const now = new Date();

  // Show 12 months before and 6 months after the current month.
  const monthOptions = Array.from(
    { length: 19 },
    (_, index) => {
      const offset = index - 12;

      const date = new Date(
        now.getFullYear(),
        now.getMonth() + offset,
        1,
      );

      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      const label = date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      return {
        value,
        label,
      };
    },
  ).reverse();

  function handleMonthChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const month = event.target.value;

    const params = new URLSearchParams(
      window.location.search,
    );

    params.set("month", month);

    router.push(
      `${window.location.pathname}?${params.toString()}`,
    );
  }

  return (
    <div className="location-month-selector">
      <label htmlFor="location-month">
        View Month
      </label>

      <select
        id="location-month"
        value={selectedMonth}
        onChange={handleMonthChange}
      >
        {monthOptions.map((month) => (
          <option
            key={month.value}
            value={month.value}
          >
            {month.label}
          </option>
        ))}
      </select>
    </div>
  );
}