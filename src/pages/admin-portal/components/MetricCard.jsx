const MetricCard = ({ title, value, delta, helper, icon: Icon, accent }) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-28px_rgba(15,23,42,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">{delta}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{helper}</p>
    </div>
  );
};

export default MetricCard;

