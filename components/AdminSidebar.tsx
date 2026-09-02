"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="admin-shell-sidebar">
      {/* =========================================
          BRAND
      ========================================= */}

      <div className="admin-shell-brand">
        <div className="admin-shell-logo">
          <img
            src="/nexus-logo.png"
            alt="Nexus Test Labs"
          />
        </div>

        <div className="admin-shell-brand-text">
          <strong>Nexus Hyderabad</strong>
          <span>Business CRM</span>
        </div>
      </div>

      {/* =========================================
          WORKSPACE LABEL
      ========================================= */}

      <div className="admin-shell-section-label">
        Workspace
      </div>

      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav className="admin-shell-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

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
                <Icon size={18} strokeWidth={1.9} />
              </span>

              <span className="admin-shell-nav-label">
                {item.label}
              </span>

              {active && (
                <span className="admin-shell-active-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* =========================================
          SIDEBAR FOOTER
      ========================================= */}

      <div className="admin-shell-sidebar-footer">
        <div className="admin-shell-system-status">
          <span className="admin-shell-status-dot" />

          <div>
            <strong>CRM Online</strong>
            <span>Neon database connected</span>
          </div>
        </div>

        <Link
          href="/"
          className="admin-shell-website-link"
        >
          <span>Open Website</span>
          <ArrowUpRight size={15} />
        </Link>

        <div className="admin-shell-logout">
          <AdminLogoutButton />
        </div>

        <div className="admin-shell-version">
          Nexus Business CRM
          <span>Hyderabad Operations</span>
        </div>
      </div>
    </aside>
  );
}