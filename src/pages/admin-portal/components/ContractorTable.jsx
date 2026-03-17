import {
  Mail,
  Phone,
  ShieldCheck,
  ShieldX,
  ClipboardList,
  ShieldAlert,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Blocked: "bg-rose-50 text-rose-700 border-rose-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const highlight = (text, query) => {
  if (!query) return text;
  const lower = text.toLowerCase();
  const index = lower.indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="rounded bg-amber-100 px-1 text-amber-700">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
};

const ContractorTable = ({
  contractors,
  loading,
  page,
  perPage,
  total,
  onPageChange,
  onAction,
  searchTerm,
  showExpertise = false,
  showStatus = false,
  showRegNo = false,
  registryMeta,
  taskCounts = {},
}) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const rows = useMemo(() => contractors, [contractors]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.4)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Contractor Registry</h3>
          <p className="mt-1 text-sm text-slate-500">
            Monitor contractors, ward coverage, and registry growth in real time.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {total} Records
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Total Registered
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {registryMeta?.total ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Live contractors in registry
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Wards Covered
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {registryMeta?.wardsCovered ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Unique primary wards
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Latest Contractor
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {registryMeta?.latestName ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {registryMeta?.latestDate
              ? new Date(registryMeta.latestDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "No recent update"}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 h-3 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-200" />
            </div>
          ))
        ) : rows.length ? (
          rows.map((contractor) => {
            const status = contractor.status || "Active";
            return (
              <div
                key={contractor.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_25px_55px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_35px_70px_-35px_rgba(15,23,42,0.45)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-indigo-100/70 blur-2xl transition group-hover:bg-indigo-200/80" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-slate-900">
                      {highlight(contractor.name, searchTerm)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {contractor.contractor_id}
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-200/60">
                      {taskCounts[contractor.id] || 0}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Tasks
                    </span>
                  </div>
                </div>

                <div className="relative z-10 mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span>{contractor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span>{highlight(contractor.email, searchTerm)}</span>
                  </div>
                </div>

                <div className="relative z-10 mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Assign Task", icon: ClipboardList, tone: "bg-indigo-600 text-white" },
                    { label: "Review Tasks", icon: ShieldCheck, tone: "bg-emerald-500 text-white" },
                    { label: "Request Update", icon: RefreshCw, tone: "bg-blue-500 text-white" },
                    { label: "Send Warning", icon: ShieldAlert, tone: "bg-amber-500 text-white" },
                    { label: "View Profile", icon: UserRound, tone: "bg-slate-900 text-white" },
                    status === "Blocked"
                      ? { label: "Unblock Contractor", icon: ShieldCheck, tone: "bg-emerald-600 text-white" }
                      : { label: "Block Contractor", icon: ShieldX, tone: "bg-rose-600 text-white" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => onAction(action.label, contractor)}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.tone}`}
                      >
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                {showStatus ? (
                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusStyles[status] || statusStyles.Active
                      }`}
                    >
                      {status === "Blocked" ? (
                        <ShieldX className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      {status}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500 md:col-span-3">
            No contractors found. Try adjusting your filters.
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractorTable;
