import { Banknote, Coins, ShieldCheck, Wallet } from "lucide-react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
} from "recharts";

const baseCards = [
  {
    key: "total",
    label: "Total Budget",
    color: "#4F46E5",
    icon: Wallet,
  },
  {
    key: "infra",
    label: "Infra Budget",
    color: "#10B981",
    icon: Banknote,
  },
  {
    key: "allocated",
    label: "Allocated Budget",
    color: "#F59E0B",
    icon: Coins,
  },
  {
    key: "remaining",
    label: "Remaining Budget",
    color: "#3B82F6",
    icon: ShieldCheck,
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const BudgetOverviewCards = ({ values }) => {
  const infraBase = values?.infra || 0;
  const safeProgress = (value, base) =>
    base ? Math.min(1, Math.max(0, value / base)) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {baseCards.map((item) => {
        const value = values?.[item.key] ?? 0;
        const progress =
          item.key === "allocated" || item.key === "remaining"
            ? safeProgress(value, infraBase)
            : 1;
        const Icon = item.icon;
        const data = [
          { name: "used", value: progress * 100 },
          { name: "remaining", value: 100 - progress * 100 },
        ];
        return (
          <div
            key={item.key}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(value)}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-14 w-14">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      innerRadius={18}
                      outerRadius={28}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={item.color} />
                      <Cell fill="#E2E8F0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {item.key === "allocated"
                    ? `${Math.round(progress * 100)}% utilized`
                    : item.key === "remaining"
                    ? `${Math.round(progress * 100)}% remaining`
                    : "100% budgeted"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetOverviewCards;
