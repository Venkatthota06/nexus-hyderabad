"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Settings2,
  UploadCloud,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import AdminLogoutButton from "@/components/AdminLogoutButton";
import "./AdminSidebar.css";

type SearchResult = {
  id: string;
  type: "company" | "contact" | "lead" | "quotation" | "sample" | "report";
  title: string;
  subtitle: string;
  detail: string;
  href: string;
  companyId: string | null;
};

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Operations", href: "/admin/operations", icon: Activity },
  { label: "Clients", href: "/admin/companies", icon: Building2 },
  { label: "Lead Management", href: "/admin/leads", icon: Users },
  { label: "Quotations", href: "/admin/quotations", icon: CircleDollarSign },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Recurring Services", href: "/admin/recurring-services", icon: RefreshCw },
  { label: "Sample Collection", href: "/admin/samples", icon: FlaskConical },
  { label: "Identification Import", href: "/admin/identification-import", icon: UploadCloud },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Payments", href: "/admin/payments", icon: WalletCards },
  { label: "Follow-ups", href: "/admin/follow-ups", icon: CalendarDays },
  { label: "Monthly Plan", href: "/admin/monthly-plan", icon: CalendarDays },
  { label: "Digital Marketing", href: "/admin/digital-marketing", icon: Megaphone },
  { label: "Documents", href: "/admin/documents", icon: FolderOpen },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];

function SearchResultIcon({ type }: { type: SearchResult["type"] }) {
  switch (type) {
    case "company": return <Building2 size={16} />;
    case "contact": return <UserRound size={16} />;
    case "lead": return <Users size={16} />;
    case "quotation": return <CircleDollarSign size={16} />;
    case "sample": return <FlaskConical size={16} />;
    case "report": return <FileText size={16} />;
    default: return <Search size={16} />;
  }
}

function resultTypeLabel(type: SearchResult["type"]) {
  switch (type) {
    case "company": return "Company";
    case "contact": return "Contact";
    case "lead": return "Lead";
    case "quotation": return "Quotation";
    case "sample": return "Sample";
    case "report": return "Report";
    default: return "Result";
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Sidebar search error:", error);
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-brand-mark">N</div>
        <div>
          <strong>Nexus Test Labs</strong>
          <span>Hyderabad Operations</span>
        </div>
      </div>

      <div className="admin-sidebar-search" ref={searchRef}>
        <div className="admin-sidebar-search-input">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search CRM..."
            aria-label="Search CRM"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setResults([]); }} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        {searchOpen && query.trim() && (
          <div className="admin-sidebar-search-results">
            {searching ? (
              <div className="admin-sidebar-search-state"><Loader2 size={16} className="spin" /> Searching...</div>
            ) : results.length ? (
              results.map((result) => (
                <Link key={`${result.type}-${result.id}`} href={result.href} className="admin-sidebar-search-result" onClick={() => setSearchOpen(false)}>
                  <SearchResultIcon type={result.type} />
                  <div>
                    <strong>{result.title}</strong>
                    <span>{resultTypeLabel(result.type)} · {result.subtitle}</span>
                    {result.detail && <small>{result.detail}</small>}
                  </div>
                  <ArrowUpRight size={14} />
                </Link>
              ))
            ) : (
              <div className="admin-sidebar-search-state">No matching CRM records.</div>
            )}
          </div>
        )}
      </div>

      <nav className="admin-sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={`admin-sidebar-link ${active ? "active" : ""}`}>
              <Icon size={18} />
              <span>{item.label}</span>
              {active && <ArrowRight size={14} className="admin-sidebar-active-arrow" />}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer"><AdminLogoutButton /></div>
    </aside>
  );
}
