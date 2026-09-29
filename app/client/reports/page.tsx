"use client";

import Link from "next/link";
import {
  CalendarDays,
  Download,
  Eye,
  FileCheck2,
  FileClock,
  MapPin,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import PortalHeader from "../PortalHeader";
import DemoGuard from "../DemoGuard";

type ReportStatus = "Ready" | "Delivered" | "Preparing";

type DemoReport = {
  id: string;
  sample: string;
  service: string;
  location: string;
  collected: string;
  reportDate: string;
  status: ReportStatus;
  month: string;
  monthNumber: number;
  year: string;
  file: string;
};

const reports: DemoReport[] = [
  // =====================================================
  // SEPTEMBER 2026
  // =====================================================
  {
    id: "RPT-DEMO-001",
    sample: "DEMO-001",
    service: "Water Testing",
    location: "Hyderabad Facility",
    collected: "15 Sep 2026",
    reportDate: "20 Sep 2026",
    status: "Ready",
    month: "September",
    monthNumber: 9,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },
  {
    id: "RPT-DEMO-003",
    sample: "DEMO-003",
    service: "Swab Testing",
    location: "Hyderabad Facility",
    collected: "18 Sep 2026",
    reportDate: "Preparing",
    status: "Preparing",
    month: "September",
    monthNumber: 9,
    year: "2026",
    file: "",
  },

  // =====================================================
  // AUGUST 2026
  // =====================================================
  {
    id: "RPT-DEMO-A01",
    sample: "DEMO-A01",
    service: "Water Testing",
    location: "Hyderabad Facility",
    collected: "22 Aug 2026",
    reportDate: "27 Aug 2026",
    status: "Delivered",
    month: "August",
    monthNumber: 8,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },
  {
    id: "RPT-DEMO-A02",
    sample: "DEMO-A02",
    service: "Food Testing",
    location: "Hyderabad Facility",
    collected: "15 Aug 2026",
    reportDate: "20 Aug 2026",
    status: "Delivered",
    month: "August",
    monthNumber: 8,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },
  {
    id: "RPT-DEMO-A03",
    sample: "DEMO-A03",
    service: "Swab Testing",
    location: "Hyderabad Facility",
    collected: "08 Aug 2026",
    reportDate: "12 Aug 2026",
    status: "Delivered",
    month: "August",
    monthNumber: 8,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },

  // =====================================================
  // JULY 2026
  // =====================================================
  {
    id: "RPT-DEMO-J01",
    sample: "DEMO-J01",
    service: "Water Testing",
    location: "Hyderabad Facility",
    collected: "19 Jul 2026",
    reportDate: "24 Jul 2026",
    status: "Delivered",
    month: "July",
    monthNumber: 7,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },
  {
    id: "RPT-DEMO-J02",
    sample: "DEMO-J02",
    service: "Food Testing",
    location: "Hyderabad Facility",
    collected: "10 Jul 2026",
    reportDate: "15 Jul 2026",
    status: "Delivered",
    month: "July",
    monthNumber: 7,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },

  // =====================================================
  // JUNE 2026
  // =====================================================
  {
    id: "RPT-DEMO-JN01",
    sample: "DEMO-JN01",
    service: "Water Testing",
    location: "Hyderabad Facility",
    collected: "21 Jun 2026",
    reportDate: "26 Jun 2026",
    status: "Delivered",
    month: "June",
    monthNumber: 6,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },
  {
    id: "RPT-DEMO-JN02",
    sample: "DEMO-JN02",
    service: "Swab Testing",
    location: "Hyderabad Facility",
    collected: "11 Jun 2026",
    reportDate: "16 Jun 2026",
    status: "Delivered",
    month: "June",
    monthNumber: 6,
    year: "2026",
    file: "/demo-reports/DEMO-001-water-testing-report.pdf",
  },
];

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("All");
  const [year, setYear] = useState("2026");
  const [service, setService] = useState("All");
  const [location, setLocation] = useState("All");

  const months = [
    "All",
    "September",
    "August",
    "July",
    "June",
  ];

  const years = [
    "All",
    ...Array.from(new Set(reports.map((report) => report.year))),
  ];

  const services = [
    "All",
    ...Array.from(new Set(reports.map((report) => report.service))),
  ];

  const locations = [
    "All",
    ...Array.from(new Set(reports.map((report) => report.location))),
  ];

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports
      .filter((report) => {
        const searchableText = [
          report.id,
          report.sample,
          report.service,
          report.location,
          report.collected,
          report.reportDate,
          report.status,
          report.month,
          report.year,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          query === "" || searchableText.includes(query);

        const matchesMonth =
          month === "All" || report.month === month;

        const matchesYear =
          year === "All" || report.year === year;

        const matchesService =
          service === "All" || report.service === service;

        const matchesLocation =
          location === "All" || report.location === location;

        return (
          matchesSearch &&
          matchesMonth &&
          matchesYear &&
          matchesService &&
          matchesLocation
        );
      })
      .sort((a, b) => {
        if (a.year !== b.year) {
          return Number(b.year) - Number(a.year);
        }

        return b.monthNumber - a.monthNumber;
      });
  }, [search, month, year, service, location]);

  const downloadableCount = filteredReports.filter(
    (report) => report.file !== ""
  ).length;

  function getStatusClass(status: ReportStatus) {
    if (status === "Ready" || status === "Delivered") {
      return "status-ready";
    }

    return "status-testing";
  }

  function clearFilters() {
    setSearch("");
    setMonth("All");
    setYear("2026");
    setService("All");
    setLocation("All");
  }

  return (
    <>
      <DemoGuard />
      <PortalHeader />

      <main className="client-main">
        {/* BREADCRUMB */}
        <div className="client-breadcrumb">
          <Link href="/client/dashboard">Dashboard</Link>
          <span>›</span>
          <strong>Reports</strong>
        </div>

        {/* PAGE HEADING */}
        <section className="client-page-heading">
          <div>
            <span className="client-section-kicker">
              REPORT LIBRARY
            </span>

            <h1>Your laboratory reports</h1>

            <p>
              View current reports or search previous months to find
              and download your historical laboratory reports.
            </p>
          </div>

          <div className="client-period">
            <CalendarDays size={17} />
            Report History
          </div>
        </section>

        {/* DEMO NOTICE */}
        <div className="client-demo-notice">
          <strong>Demo environment:</strong> All customers, samples,
          dates and reports shown here are fictional. No real Nexus
          customer information is being used.
        </div>

        {/* FILTER CARD */}
        <section className="client-card client-report-filter-card">
          <div className="client-report-filter-heading">
            <div>
              <strong>Find your report</strong>

              <span>
                Search current or previous testing records.
              </span>
            </div>

            <div className="client-report-result-count">
              <FileCheck2 size={17} />
              {downloadableCount} downloadable
            </div>
          </div>

          <div className="client-report-filters">
            {/* SEARCH */}
            <div className="client-searchbox">
              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search report, sample or service..."
              />
            </div>

            {/* MONTH */}
            <label className="client-filter-field">
              <span>Month</span>

              <select
                value={month}
                onChange={(event) =>
                  setMonth(event.target.value)
                }
              >
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All months" : item}
                  </option>
                ))}
              </select>
            </label>

            {/* YEAR */}
            <label className="client-filter-field">
              <span>Year</span>

              <select
                value={year}
                onChange={(event) =>
                  setYear(event.target.value)
                }
              >
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All years" : item}
                  </option>
                ))}
              </select>
            </label>

            {/* SERVICE */}
            <label className="client-filter-field">
              <span>Service</span>

              <select
                value={service}
                onChange={(event) =>
                  setService(event.target.value)
                }
              >
                {services.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All services" : item}
                  </option>
                ))}
              </select>
            </label>

            {/* LOCATION */}
            <label className="client-filter-field">
              <span>Location</span>

              <select
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All locations" : item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* REPORT LIBRARY */}
        <section className="client-card client-report-library">
          <div className="client-report-toolbar">
            <div>
              <strong>
                {month === "All"
                  ? "All available reports"
                  : `${month} ${
                      year === "All" ? "" : year
                    }`}
              </strong>

              <span className="client-report-subtext">
                {filteredReports.length} report
                {filteredReports.length === 1 ? "" : "s"} found
              </span>
            </div>

            <span>
              Individual PDF view & download
            </span>
          </div>

          {filteredReports.length > 0 ? (
            <div className="client-report-table-wrap">
              <table className="client-report-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Sample</th>
                    <th>Service</th>
                    <th>Collected</th>
                    <th>Report Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id}>
                      {/* REPORT */}
                      <td>
                        <strong>{report.id}</strong>

                        <small>
                          <MapPin size={11} />
                          {report.location}
                        </small>
                      </td>

                      {/* SAMPLE */}
                      <td>
                        <span className="client-text-link">
                          {report.sample}
                        </span>
                      </td>

                      {/* SERVICE */}
                      <td>{report.service}</td>

                      {/* COLLECTED */}
                      <td>{report.collected}</td>

                      {/* REPORT DATE */}
                      <td>{report.reportDate}</td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`client-status ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        {report.file ? (
                          <div className="client-report-actions">
                            <a
                              href={report.file}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Eye size={16} />
                              View
                            </a>

                            <a
                              href={report.file}
                              download
                            >
                              <Download size={16} />
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="client-muted-action">
                            <FileClock size={16} />
                            Not ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="client-report-empty">
              <FileClock size={32} />

              <strong>No reports found</strong>

              <p>
                No reports match the selected filters. Try another
                month, service, location or search term.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* CUSTOMER EXPLANATION */}
        <section className="client-help-card">
          <FileCheck2 size={22} />

          <div>
            <strong>
              Previous reports stay available in your portal
            </strong>

            <p>
              Once the real Client Portal is connected, authorized
              customers will be able to select a previous month or
              year and download the required individual PDF directly
              to their phone or computer without contacting Nexus to
              resend the report.
            </p>
          </div>
        </section>
      </main>

      <footer className="client-footer">
        Nexus Test Labs Client Portal • Demonstration data only
      </footer>
    </>
  );
}