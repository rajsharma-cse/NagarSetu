import { CalendarDays, MapPin } from "lucide-react";

const statusTone = {
  Pending: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  "In Progress": "bg-blue-500/15 text-blue-200 border-blue-500/20",
  Resolved: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
  Rejected: "bg-rose-500/15 text-rose-200 border-rose-500/20",
  Closed: "bg-slate-500/15 text-slate-200 border-slate-500/20",
};

const ComplaintCard = ({ complaint, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)] transition hover:bg-white/10 hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{complaint.title}</p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {complaint.complaintRef
              ? `Complaint ID: ${complaint.complaintRef}`
              : "Complaint ID pending"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
            statusTone[complaint.status] ?? "bg-white/10 text-slate-200 border-white/10"
          }`}
        >
          {complaint.status}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="truncate">{complaint.location}</span>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span>{complaint.date}</span>
        </div>
      </div>
    </button>
  );
};

export default ComplaintCard;
