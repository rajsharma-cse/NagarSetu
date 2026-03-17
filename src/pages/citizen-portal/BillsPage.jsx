import { useMemo, useState } from "react";
import { citizenBills, citizenPaymentHistory } from "../../data/dummyData";
import BillCard from "./components/BillCard";

const shellCard =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)]";

const BillsPage = () => {
  const [bills, setBills] = useState(citizenBills ?? []);
  const [payments, setPayments] = useState(citizenPaymentHistory ?? []);
  const [activeBill, setActiveBill] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [payError, setPayError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const openPayment = (bill) => {
    setActiveBill(bill);
    setUpiId("");
    setPayError("");
    setReceipt(null);
  };

  const closePayment = () => {
    setActiveBill(null);
    setUpiId("");
    setPayError("");
  };

  const handlePay = async () => {
    if (!activeBill) {
      return;
    }
    if (!upiId.trim() || !upiId.includes("@")) {
      setPayError("Enter a valid UPI ID (example: name@bank).");
      return;
    }
    setPayError("");
    setIsPaying(true);

    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`;
    const paidOn = new Date().toISOString().slice(0, 10);

    const newPayment = {
      id: transactionId,
      service: activeBill.service,
      amount: activeBill.amount,
      date: paidOn,
      status: "Paid",
      upiId: upiId.trim(),
    };

    window.setTimeout(() => {
      setPayments((prev) => [newPayment, ...prev]);
      setReceipt(newPayment);
      setBills((prev) => prev.filter((bill) => bill.service !== activeBill.service));
      setIsPaying(false);
    }, 700);
  };

  const openUpiApp = () => {
    if (!activeBill) {
      return;
    }
    if (!upiId.trim() || !upiId.includes("@")) {
      setPayError("Enter a valid UPI ID before opening a UPI app.");
      return;
    }
    const amount = String(activeBill.amount).replace(/[^\d.]/g, "");
    const note = encodeURIComponent(`NagarSetu ${activeBill.service} payment`);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      upiId.trim()
    )}&pn=${encodeURIComponent("NagarSetu")}&am=${amount}&cu=INR&tn=${note}`;
    window.location.href = upiUrl;
  };

  const openPaytm = () => {
    if (!activeBill) {
      return;
    }
    if (!upiId.trim() || !upiId.includes("@")) {
      setPayError("Enter a valid UPI ID before opening Paytm.");
      return;
    }
    const amount = String(activeBill.amount).replace(/[^\d.]/g, "");
    const note = encodeURIComponent(`NagarSetu ${activeBill.service} payment`);
    const paytmUrl = `paytmmp://pay?pa=${encodeURIComponent(
      upiId.trim()
    )}&pn=${encodeURIComponent("NagarSetu")}&am=${amount}&cu=INR&tn=${note}`;
    window.location.href = paytmUrl;
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bills.map((bill) => (
          <BillCard key={bill.service} bill={bill} onPay={openPayment} />
        ))}
      </section>

      {activeBill ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className={`${shellCard} w-full max-w-lg p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  UPI Payment
                </p>
                <h2 className="mt-2 text-lg font-bold text-white">
                  Pay {activeBill.service}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Amount: <span className="text-white">{activeBill.amount}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closePayment}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm text-slate-300">
                UPI ID
                <input
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/15"
                  placeholder="example@bank"
                />
              </label>
              {payError ? (
                <p className="text-xs font-semibold text-rose-300">{payError}</p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openUpiApp}
                  disabled={isPaying}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Open UPI App
                </button>
                <button
                  type="button"
                  onClick={openPaytm}
                  disabled={isPaying}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/15 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Pay with Paytm
                </button>
              </div>
              <button
                type="button"
                onClick={handlePay}
                disabled={isPaying}
                className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)] transition hover:from-blue-500 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPaying ? "Processing..." : "Mark as Paid (Demo)"}
              </button>
            </div>

            {receipt ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                  Receipt
                </p>
                <p className="mt-2 text-sm">
                  Transaction ID:{" "}
                  <span className="font-mono text-emerald-50">{receipt.id}</span>
                </p>
                <p className="mt-1 text-sm">Service: {receipt.service}</p>
                <p className="mt-1 text-sm">Amount: {receipt.amount}</p>
                <p className="mt-1 text-sm">Paid via: {receipt.upiId}</p>
                <p className="mt-1 text-sm">Date: {receipt.date}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className={`${shellCard} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          History
        </p>
        <h2 className="mt-2 text-lg font-bold text-white">Payment history</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="pb-3 pr-5">Transaction</th>
                <th className="pb-3 pr-5">Service</th>
                <th className="pb-3 pr-5">Amount</th>
                <th className="pb-3 pr-5">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-white/10">
                  <td className="py-4 pr-5 font-mono text-slate-200">{payment.id}</td>
                  <td className="py-4 pr-5 font-semibold text-white">{payment.service}</td>
                  <td className="py-4 pr-5 text-slate-200">{payment.amount}</td>
                  <td className="py-4 pr-5 text-slate-400">{payment.date}</td>
                  <td className="py-4">
                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BillsPage;
