const MetricCard = ({ title, value, helper, icon: Icon, accent }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <span
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${accent} opacity-15 blur-2xl`}
      />
      <span
        className={`pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full ${accent} opacity-10 blur-2xl`}
      />
      <span
        className={`sparkle-dot ${accent} h-2.5 w-2.5 blur-[1px]`}
        style={{ top: "20%", left: "18%", animationDelay: "0.4s" }}
      />
      <span
        className={`sparkle-dot ${accent} h-2 w-2 blur-[1px]`}
        style={{ top: "55%", left: "70%", animationDelay: "1.2s" }}
      />
      <span
        className={`sparkle-dot ${accent} h-1.5 w-1.5 blur-[1px]`}
        style={{ top: "35%", left: "42%", animationDelay: "2s" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 animate-count-in group-hover:animate-count-hover">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${accent} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
