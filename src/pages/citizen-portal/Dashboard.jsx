import { motion } from "framer-motion";
import { CreditCard, FileText, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { citizenBills } from "../../data/dummyData";
import BillCard from "./components/BillCard";
import ComplaintCard from "./components/ComplaintCard";
import { supabase } from "../../lib/supabaseClient";

const shellCard =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)]";

const Dashboard = () => {
  const navigate = useNavigate();
  const dueBills = citizenBills.slice(0, 2);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [complaintError, setComplaintError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchComplaints = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        if (mounted) {
          setComplaintError("Please log in to view complaints.");
          setLoadingComplaints(false);
        }
        return;
      }

      const [activeResult, resolvedResult, rejectedResult] = await Promise.all([
        supabase
          .from("complaints")
          .select(
            "id,complaint_ref,category,department,ward,status,description,created_at,removed"
          )
          .eq("citizen_id", userId)
          .or("removed.is.null,removed.eq.false"),
        supabase
          .from("resolved_complaints")
          .select(
            "id,complaint_ref,category,department,ward,status,description,created_at,closed_at"
          )
          .eq("citizen_id", userId),
        supabase
          .from("rejected_complaints")
          .select(
            "id,complaint_ref,category,department,ward,status,description,created_at,closed_at"
          )
          .eq("citizen_id", userId),
      ]);

      if (!mounted) {
        return;
      }

      const combinedError =
        activeResult.error || resolvedResult.error || rejectedResult.error;

      if (combinedError) {
        setComplaintError(combinedError.message);
        setLoadingComplaints(false);
        return;
      }

      const mapRow = (item, source) => ({
        id: item.id,
        complaintRef: item.complaint_ref,
        title: `${item.category} - ${item.department}`,
        status:
          item.status ||
          (source === "resolved_complaints"
            ? "Resolved"
            : source === "rejected_complaints"
            ? "Rejected"
            : "Pending"),
        date: item.created_at?.slice(0, 10) || "",
        location: item.ward,
        sortDate: item.closed_at || item.created_at || "",
      });

      const mapped = [
        ...(activeResult.data || []).map((item) => mapRow(item, "complaints")),
        ...(resolvedResult.data || []).map((item) =>
          mapRow(item, "resolved_complaints")
        ),
        ...(rejectedResult.data || []).map((item) =>
          mapRow(item, "rejected_complaints")
        ),
      ]
        .sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || ""))
        .slice(0, 10);

      setComplaints(mapped);
      setLoadingComplaints(false);
    };

    fetchComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  const recentComplaints = useMemo(() => complaints.slice(0, 3), [complaints]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const rejected = complaints.filter((c) => c.status === "Rejected").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;

    return [
      { label: "Total Complaints", value: total.toString(), helper: "All time" },
      { label: "Pending", value: pending.toString(), helper: "Needs review" },
      { label: "Rejected", value: rejected.toString(), helper: "Closed" },
      { label: "Resolved", value: resolved.toString(), helper: "Completed" },
    ];
  }, [complaints]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Citizen Portal
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Prayagraj Nagar Nigam Services
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            File complaints, track progress, and pay bills from one place. (Prototype)
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/portal/citizen/file-complaint")}
              className="group rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-[1px] text-left"
            >
              <div className="h-full rounded-3xl bg-[#020817]/70 p-4 transition group-hover:bg-[#020817]/55">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      File New Complaint
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Raise a civic issue in minutes.
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/portal/citizen/track-complaints")}
              className="group rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-[1px] text-left"
            >
              <div className="h-full rounded-3xl bg-[#020817]/70 p-4 transition group-hover:bg-[#020817]/55">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Track Complaints
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      View status and timelines.
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/portal/citizen/bills")}
              className="group rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-[1px] text-left"
            >
              <div className="h-full rounded-3xl bg-[#020817]/70 p-4 transition group-hover:bg-[#020817]/55">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Pay Bills</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Clear dues with reminders.
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          <div className={`${shellCard} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Recent
                </p>
                <h2 className="mt-2 text-lg font-bold text-white">
                  Latest complaints
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/portal/citizen/track-complaints")}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                View all
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {loadingComplaints ? (
                <p className="text-sm text-slate-400">Loading complaints...</p>
              ) : complaintError ? (
                <p className="text-sm text-rose-300">{complaintError}</p>
              ) : recentComplaints.length ? (
                recentComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={() => navigate("/portal/citizen/track-complaints")}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No complaints submitted yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-4">
          <div className={`${shellCard} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Snapshot
            </p>
            <h2 className="mt-2 text-lg font-bold text-white">Your stats</h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs font-semibold text-slate-300">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl font-extrabold tracking-tight text-white">
                    {loadingComplaints ? "..." : stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{stat.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${shellCard} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Bills
                </p>
                <h2 className="mt-2 text-lg font-bold text-white">Due soon</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/portal/citizen/bills")}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                See bills
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {dueBills.map((bill) => (
                <BillCard key={bill.service} bill={bill} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
