import {
  ClipboardList,
  ShieldCheck,
  ShieldX,
  Users,
} from "lucide-react";

const stats = [
  {
    key: "total",
    label: "Total Contractors",
    icon: Users,
    tone: "from-indigo-500/10 to-indigo-500/30",
  },
  {
    key: "tasksAssigned",
    label: "Total Tasks Assigned",
    icon: ShieldCheck,
    tone: "from-emerald-500/10 to-emerald-500/30",
  },
  {
    key: "blocked",
    label: "Blocked Contractors",
    icon: ShieldX,
    tone: "from-rose-500/10 to-rose-500/30",
  },
  {
    key: "tasksToday",
    label: "Tasks Assigned Today",
    icon: ClipboardList,
    tone: "from-amber-500/10 to-amber-500/30",
  },
];

const StatsCards = ({ values }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className={`rounded-2xl border border-slate-200/70 bg-gradient-to-br ${item.tone} p-5 shadow-[0_20px_45px_-40px_rgba(15,23,42,0.4)]`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {values?.[item.key] ?? 0}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-slate-700 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
