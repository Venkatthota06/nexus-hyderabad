import {
  CalendarDays,
  Loader2,
} from "lucide-react";

export default function LoadingFollowUps() {
  return (
    <div className="mx-auto w-full max-w-[1480px]">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#0876c9]">
            Nexus Hyderabad CRM
          </span>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
            Follow-ups
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Loading current lead, activity and quotation follow-ups.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm">
          <Loader2
            size={15}
            className="animate-spin text-[#0876c9]"
          />
          Loading
        </div>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[104px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </section>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <section
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <CalendarDays size={17} />
              </div>

              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-2.5 w-52 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="h-28 animate-pulse rounded-xl bg-slate-50" />
          </section>
        ))}
      </div>
    </div>
  );
}
