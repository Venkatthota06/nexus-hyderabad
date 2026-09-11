"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import AdminLogoutButton from "@/components/AdminLogoutButton";

type SearchResult = {
  id: string;
  type:
    | "company"
    | "contact"
    | "lead"
    | "quotation"
    | "sample"
    | "report";
  title: string;
  subtitle: string;
  detail: string;
  href: string;
  companyId: string | null;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users,
  },
  {
    label: "Follow-ups",
    href: "/admin/follow-ups",
    icon: CalendarDays,
  },
  {
    label: "Companies",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    label: "Quotations",
    href: "/admin/quotations",
    icon: CircleDollarSign,
  },
  {
    label: "Samples",
    href: "/admin/samples",
    icon: FlaskConical,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
];

function SearchResultIcon({
  type,
}: {
  type: SearchResult["type"];
}) {
  switch (type) {
    case "company":
      return <Building2 size={16} />;

    case "contact":
      return <UserRound size={16} />;

    case "lead":
      return <Users size={16} />;

    case "quotation":
      return <CircleDollarSign size={16} />;

    case "sample":
      return <FlaskConical size={16} />;

    case "report":
      return <FileText size={16} />;

    default:
      return <Search size={16} />;
  }
}

function resultTypeLabel(
  type: SearchResult["type"]
) {
  switch (type) {
    case "company":
      return "Company";

    case "contact":
      return "Contact";

    case "lead":
      return "Lead";

    case "quotation":
      return "Quotation";

    case "sample":
      return "Sample";

    case "report":
      return "Report";

    default:
      return "Result";
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();

  /* =========================================================
     UNREAD LEAD NOTIFICATION COUNT
  ========================================================= */

  const [newLeadCount, setNewLeadCount] =
    useState(0);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setNewLeadCount(
          data.newLeads ?? 0
        );
      } catch (error) {
        console.error(
          "Sidebar notification error:",
          error
        );
      }
    }

    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);

  /* =========================================================
     GLOBAL CRM SEARCH
  ========================================================= */

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<SearchResult[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const searchRequestRef =
    useRef<AbortController | null>(null);

  useEffect(() => {
    const query =
      searchQuery.trim();

    if (query.length < 2) {
      searchRequestRef.current?.abort();

      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");

      return;
    }

    const timer = setTimeout(
      async () => {
        searchRequestRef.current?.abort();

        const controller =
          new AbortController();

        searchRequestRef.current =
          controller;

        setSearchLoading(true);
        setSearchError("");

        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(
              query
            )}`,
            {
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            throw new Error(
              "Search request failed"
            );
          }

          const data =
            await response.json();

          setSearchResults(
            data.results ?? []
          );

          setSearchOpen(true);
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          console.error(
            "CRM search error:",
            error
          );

          setSearchResults([]);

          setSearchError(
            "Unable to search CRM."
          );

          setSearchOpen(true);
        } finally {
          if (
            searchRequestRef.current ===
            controller
          ) {
            setSearchLoading(false);
          }
        }
      },
      300
    );

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  }, [pathname]);

  function clearSearch() {
    searchRequestRef.current?.abort();

    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchOpen(false);
    setSearchLoading(false);
  }

  /* =========================================================
     ACTIVE NAVIGATION
  ========================================================= */

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="admin-shell-sidebar">
      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="admin-shell-brand">
        <div className="admin-shell-logo">
          <img
            src="/nexus-logo.png"
            alt="Nexus Test Labs"
          />
        </div>

        <div className="admin-shell-brand-text">
          <strong>
            Nexus Hyderabad
          </strong>

          <span>
            Business CRM
          </span>
        </div>
      </div>

      {/* =====================================================
          CRM SEARCH
      ===================================================== */}

      <div className="admin-crm-search">
        <div className="admin-crm-search-box">
          <Search
            size={16}
            className="admin-crm-search-icon"
          />

          <input
            type="text"
            value={searchQuery}
            placeholder="Search CRM..."
            autoComplete="off"
            aria-label="Search CRM"
            onFocus={() => {
              if (
                searchQuery.trim().length >= 2
              ) {
                setSearchOpen(true);
              }
            }}
            onChange={(event) => {
              setSearchQuery(
                event.target.value
              );
            }}
          />

          {searchLoading && (
            <Loader2
              size={15}
              className="admin-crm-search-loader"
            />
          )}

          {!searchLoading &&
            searchQuery && (
              <button
                type="button"
                className="admin-crm-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
        </div>

        {searchOpen &&
          searchQuery.trim().length >= 2 && (
            <div className="admin-crm-search-results">
              <div className="admin-crm-search-results-header">
                <span>
                  Search Results
                </span>

                {!searchLoading && (
                  <strong>
                    {searchResults.length}
                  </strong>
                )}
              </div>

              {searchLoading &&
                searchResults.length === 0 && (
                  <div className="admin-crm-search-state">
                    <Loader2
                      size={18}
                      className="admin-crm-search-state-loader"
                    />

                    <span>
                      Searching CRM...
                    </span>
                  </div>
                )}

              {!searchLoading &&
                searchError && (
                  <div className="admin-crm-search-state error">
                    <span>
                      {searchError}
                    </span>
                  </div>
                )}

              {!searchLoading &&
                !searchError &&
                searchResults.length ===
                  0 && (
                  <div className="admin-crm-search-state">
                    <Search size={18} />

                    <span>
                      No matching records
                    </span>

                    <small>
                      Try company, contact,
                      phone, email, quotation,
                      sample or report number.
                    </small>
                  </div>
                )}

              {!searchError &&
                searchResults.length > 0 && (
                  <div className="admin-crm-search-result-list">
                    {searchResults.map(
                      (result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.href}
                          className="admin-crm-search-result"
                          onClick={() => {
                            setSearchOpen(
                              false
                            );
                          }}
                        >
                          <div
                            className={`admin-crm-search-result-icon ${result.type}`}
                          >
                            <SearchResultIcon
                              type={
                                result.type
                              }
                            />
                          </div>

                          <div className="admin-crm-search-result-content">
                            <div className="admin-crm-search-result-top">
                              <strong>
                                {result.title}
                              </strong>

                              <span>
                                {resultTypeLabel(
                                  result.type
                                )}
                              </span>
                            </div>

                            <p>
                              {
                                result.subtitle
                              }
                            </p>

                            {result.detail && (
                              <small>
                                {
                                  result.detail
                                }
                              </small>
                            )}
                          </div>

                          <ArrowRight
                            size={14}
                            className="admin-crm-search-result-arrow"
                          />
                        </Link>
                      )
                    )}
                  </div>
                )}
            </div>
          )}
      </div>

      {/* =====================================================
          WORKSPACE
      ===================================================== */}

      <div className="admin-shell-section-label">
        Workspace
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="admin-shell-nav">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            isActive(item.href);

          const hasLeadNotification =
            item.label === "Leads" &&
            newLeadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "admin-shell-nav-link active"
                  : "admin-shell-nav-link"
              }
            >
              <span className="admin-shell-nav-icon">
                <Icon
                  size={18}
                  strokeWidth={1.9}
                />
              </span>

              <span className="admin-shell-nav-label">
                {item.label}
              </span>

              {hasLeadNotification && (
                <span
                  className="admin-shell-notification-badge"
                  title={`${newLeadCount} unread ${
                    newLeadCount === 1
                      ? "lead"
                      : "leads"
                  }`}
                >
                  {newLeadCount > 99
                    ? "99+"
                    : newLeadCount}
                </span>
              )}

              {active &&
                !hasLeadNotification && (
                  <span className="admin-shell-active-dot" />
                )}
            </Link>
          );
        })}
      </nav>

      {/* =====================================================
          SIDEBAR FOOTER
      ===================================================== */}

      <div className="admin-shell-sidebar-footer">
        <div className="admin-shell-system-status">
          <span className="admin-shell-status-dot" />

          <div>
            <strong>
              CRM Online
            </strong>

            <span>
              Neon database connected
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="admin-shell-website-link"
        >
          <span>
            Open Website
          </span>

          <ArrowUpRight
            size={15}
          />
        </Link>

        <div className="admin-shell-logout">
          <AdminLogoutButton />
        </div>

        <div className="admin-shell-version">
          Nexus Business CRM

          <span>
            Hyderabad Operations
          </span>
        </div>
      </div>
    </aside>
  );
}