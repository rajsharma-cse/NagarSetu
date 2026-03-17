import { CreditCard } from "lucide-react";

const BillCard = ({ bill, onPay }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {bill.service}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {bill.amount}
          </p>
          <p className="mt-2 text-xs text-slate-400">Due: {bill.dueDate}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-[0_18px_40px_-24px_rgba(37,99,235,0.6)]">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onPay?.(bill)}
        className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        Pay now
      </button>
    </div>
  );
};

export default BillCard;
