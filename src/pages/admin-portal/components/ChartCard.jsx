const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)]">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {subtitle ? (
          <p className="text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="relative h-64">{children}</div>
    </div>
  );
};

export default ChartCard;

