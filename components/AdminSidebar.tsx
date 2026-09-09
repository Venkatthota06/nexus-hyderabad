"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Users,
} from "lucide-react";

import AdminLogoutButton from "@/components/AdminLogoutButton";

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

export default function AdminSidebar() {
  const pathname = usePathname();

  /* =========================================================
     UNREAD LEAD NOTIFICATION COUNT
  ========================================================= */

  const [newLeadCount, setNewLeadCount] = useState(0);

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

        const data = await response.json();

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

    // Check immediately
    loadNotifications();

    // Check every 30 seconds for new website leads
    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);

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
              {/* ICON */}

              <span className="admin-shell-nav-icon">
                <Icon
                  size={18}
                  strokeWidth={1.9}
                />
              </span>

              {/* LABEL */}

              <span className="admin-shell-nav-label">
                {item.label}
              </span>

              {/* =============================================
                  UNREAD LEAD NOTIFICATION

                  Only appears for Leads.
                  Shows number of unread website enquiries.
              ============================================= */}

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

              {/* =============================================
                  ACTIVE PAGE DOT

                  Hide the normal active dot when the Leads
                  notification badge is visible.
              ============================================= */}

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
        {/* CRM STATUS */}

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

        {/* WEBSITE */}

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

        {/* LOGOUT */}

        <div className="admin-shell-logout">
          <AdminLogoutButton />
        </div>

        {/* VERSION */}

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