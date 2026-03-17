import { Filter, Search, SlidersHorizontal } from "lucide-react";

const FiltersBar = ({
  search,
  onSearchChange,
  ward,
  onWardChange,
  expertise,
  onExpertiseChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  wardOptions,
  expertiseOptions,
  showStatus = false,
  onClear,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search contractors by name or email..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={ward}
              onChange={(event) => onWardChange(event.target.value)}
              className="bg-transparent text-sm text-slate-600 focus:outline-none"
            >
              <option value="">All Wards</option>
              {wardOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {expertiseOptions?.length ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={expertise}
                onChange={(event) => onExpertiseChange(event.target.value)}
                className="bg-transparent text-sm text-slate-600 focus:outline-none"
              >
                <option value="">All Expertise</option>
                {expertiseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {showStatus ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value)}
                className="bg-transparent text-sm text-slate-600 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          ) : null}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className="bg-transparent text-sm text-slate-600 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="tasks">Most Tasks</option>
              <option value="budget">Highest Budget</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
