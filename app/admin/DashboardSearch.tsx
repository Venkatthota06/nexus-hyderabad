"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Building2, FileText, Search, Target, Users, X } from "lucide-react";

type SearchResult = {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  quotationNumber?: string;
  sampleNumber?: string;
  reportNumber?: string;
  service?: string;
  status?: string;
};

type ApiSearchResult = {
  id: string;
  type: "company" | "contact" | "lead" | "quotation" | "sample" | "report";
  title: string;
  subtitle: string;
  detail: string;
  href: string;
  companyId: string | null;
};

type SearchPayload = {
  results?: ApiSearchResult[];
};

type FlatResult = {
  key: string;
  label: string;
  meta: string;
  href: string;
  icon: React.ReactNode;
};

export default function DashboardSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FlatResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      controllerRef.current?.abort();
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const timer = window.setTimeout(async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Search failed");

        const data = (await response.json()) as SearchPayload;

        const next: FlatResult[] = (data.results ?? []).map((item) => ({
          key: `${item.type}-${item.id}`,
          label: item.title,
          meta: [item.subtitle, item.detail].filter(Boolean).join(" · "),
          href: item.href,
          icon:
            item.type === "company" ? <Building2 size={15} /> :
            item.type === "lead" ? <Target size={15} /> :
            item.type === "contact" ? <Users size={15} /> :
            <FileText size={15} />,
        }));

        setResults(next.slice(0, 8));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setError("Unable to search right now.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const open = query.trim().length >= 2;

  return (
    <div className="v3-search-shell">
      <div className="v3-search">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients, quotations, reports..."
          aria-label="Search CRM"
        />
        {query ? (
          <button
            type="button"
            className="v3-search-clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="v3-search-results">
          {loading ? <div className="v3-search-state">Searching…</div> : null}
          {!loading && error ? <div className="v3-search-state">{error}</div> : null}
          {!loading && !error && results.length === 0 ? (
            <div className="v3-search-state">No matching CRM records.</div>
          ) : null}

          {!loading &&
            !error &&
            results.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="v3-search-result"
                onClick={() => setQuery("")}
              >
                <span className="v3-search-result-icon">{item.icon}</span>
                <span className="v3-search-result-copy">
                  <strong>{item.label}</strong>
                  <small>{item.meta}</small>
                </span>
              </Link>
            ))}
        </div>
      ) : null}
    </div>
  );
}
