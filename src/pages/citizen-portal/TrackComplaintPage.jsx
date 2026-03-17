import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, MapPin } from "lucide-react";
import ComplaintCard from "./components/ComplaintCard";
import { supabase } from "../../lib/supabaseClient";

const shellCard =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)]";

const TrackComplaintPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const buildTimeline = (status, submittedDate) => {
    const normalized = (status || "Pending").toLowerCase();
    const submittedStep = { label: "Submitted", date: submittedDate || "" };

    if (normalized === "rejected") {
      return [
        submittedStep,
        { label: "Rejected (Closed)", date: submittedDate || "Pending update" },
      ];
    }

    if (normalized === "resolved" || normalized === "closed") {
      return [
        submittedStep,
        { label: "Accepted", date: "Pending update" },
        { label: "Pending", date: "Pending update" },
        { label: "Resolved (Closed)", date: submittedDate || "Pending update" },
      ];
    }

    if (normalized === "accepted") {
      return [
        submittedStep,
        { label: "Accepted", date: "Pending update" },
        { label: "Pending", date: "Pending update" },
      ];
    }

    if (normalized === "pending") {
      return [
        submittedStep,
        { label: "Accepted", date: "Pending update" },
        { label: "Pending", date: "In progress" },
      ];
    }

    return [
      submittedStep,
      { label: "Accepted", date: "Pending update" },
      { label: "Pending", date: "Pending update" },
    ];
  };

  useEffect(() => {
    let mounted = true;

    const fetchComplaints = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        if (mounted) {
          setErrorMessage("Please log in to view complaints.");
          setLoading(false);
        }
        return;
      }

      const [activeResult, resolvedResult, rejectedResult] = await Promise.all([
        supabase
          .from("complaints")
          .select(
            "id,complaint_ref,category,department,ward,status,description,created_at,removed,rating,officer_name,officer_role,officer_contact,officer_admin_id"
          )
          .eq("citizen_id", userId)
          .or("removed.is.null,removed.eq.false"),
        supabase
          .from("resolved_complaints")
          .select(
            "id,complaint_ref,category,department,ward,status,description,created_at,closed_at,rating,officer_name,officer_role,officer_contact,officer_admin_id"
          )
          .eq("citizen_id", userId),
        supabase
          .from("rejected_complaints")
          .select(
            "id,complaint_ref,category,department,ward,status,description,created_at,closed_at,officer_name,officer_role,officer_contact,officer_admin_id,rejection_reason"
          )
          .eq("citizen_id", userId),
      ]);

      if (!mounted) {
        return;
      }

      const combinedError =
        activeResult.error || resolvedResult.error || rejectedResult.error;

      if (combinedError) {
        setErrorMessage(combinedError.message);
        setLoading(false);
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
        createdAt: item.created_at || "",
        location: item.ward,
        description: item.description,
        rejectionReason: item.rejection_reason || null,
        rating: item.rating ?? null,
        source,
        officerAdminId: item.officer_admin_id || null,
        officer: {
          name: item.officer_name,
          role: item.officer_role,
          contact: item.officer_contact,
        },
        timeline: buildTimeline(item.status, item.created_at?.slice(0, 10) || ""),
      });

      const mapped = [
        ...(activeResult.data || []).map((item) => mapRow(item, "complaints")),
        ...(resolvedResult.data || []).map((item) =>
          mapRow(item, "resolved_complaints")
        ),
        ...(rejectedResult.data || []).map((item) =>
          mapRow(item, "rejected_complaints")
        ),
      ];

      const adminIds = Array.from(
        new Set(
          mapped
            .map((item) => item.officerAdminId)
            .filter((value) => typeof value === "string" && value.length > 0)
        )
      );

      if (adminIds.length) {
        const { data: officerRows, error: officerError } = await supabase
          .from("admin_officers")
          .select("admin_id,full_name,designation,email,mobile_number")
          .in("admin_id", adminIds);

        if (!officerError && officerRows?.length) {
          const officerMap = officerRows.reduce((acc, row) => {
            acc[row.admin_id] = row;
            return acc;
          }, {});

          mapped.forEach((item) => {
            if (item.officerAdminId && officerMap[item.officerAdminId]) {
              const officer = officerMap[item.officerAdminId];
              const contact = `${officer.email || "N/A"} | ${
                officer.mobile_number || "N/A"
              }`;
              item.officer = {
                name: officer.full_name || item.officer.name,
                role: officer.designation || item.officer.role,
                contact,
              };
            }
          });
        }
      }

      mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      setComplaints(mapped);
      setActiveId(mapped[0]?.id ?? null);
      setLoading(false);
    };

    fetchComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  const active = useMemo(
    () => complaints.find((c) => c.id === activeId),
    [complaints, activeId]
  );

  const handleWithdraw = async () => {
    if (!active || actionLoading) {
      return;
    }
    setActionError("");
    setActionLoading(true);
    try {
    if (active.source !== "complaints") {
      setActionError("Only active complaints can be removed.");
      setActionLoading(false);
      return;
    }

    const { error } = await supabase
      .from("complaints")
      .update({ removed: true, removed_at: new Date().toISOString() })
      .eq("id", active.id);

      if (error) {
        setActionError(error.message);
        return;
      }

      const remaining = complaints.filter((item) => item.id !== active.id);
      setComplaints(remaining);
      setActiveId(remaining[0]?.id ?? null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRating = async (value) => {
    if (!active || actionLoading) {
      return;
    }
    setActionError("");
    setActionLoading(true);
    try {
    const tableName =
      active.source === "resolved_complaints"
        ? "resolved_complaints"
        : active.source === "complaints"
        ? "complaints"
        : null;

    if (!tableName) {
      setActionError("Ratings can only be submitted for resolved complaints.");
      setActionLoading(false);
      return;
    }

    const { error } = await supabase
      .from(tableName)
      .update({ rating: value, rating_submitted_at: new Date().toISOString() })
      .eq("id", active.id);

      if (error) {
        setActionError(error.message);
        return;
      }

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === active.id ? { ...item, rating: value } : item
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section className="space-y-3 lg:col-span-7">
        <div className={`${shellCard} p-5`}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Complaints
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">Track status</h2>
          <div className="mt-4 grid gap-3">
            {loading ? (
              <p className="text-sm text-slate-400">Loading complaints...</p>
            ) : errorMessage ? (
              <p className="text-sm text-rose-300">{errorMessage}</p>
            ) : complaints.length ? (
              complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onClick={() => setActiveId(complaint.id)}
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

      <aside className="lg:col-span-5">
        <div className={`${shellCard} p-5`}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Timeline
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">
            {active?.title ?? "Select a complaint"}
          </h2>

          {active ? (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="max-w-[16rem] truncate">{active.location}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Clock3 className="h-4 w-4 text-slate-500" />
                  <span>{active.date}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Complaint handled by
                </p>
                {active.officer?.name ? (
                  <div className="mt-3 space-y-1 text-sm text-slate-200">
                    <p className="font-semibold text-white">{active.officer.name}</p>
                    {active.officer.role ? (
                      <p className="text-xs text-slate-400">{active.officer.role}</p>
                    ) : null}
                    {active.officer.contact ? (
                      <p className="text-xs text-slate-400">{active.officer.contact}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    Not assigned yet.
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4 border-l border-white/10 pl-5">
                {active.timeline.map((step, index) => {
                  const isLast = index === active.timeline.length - 1;
                  return (
                    <motion.div
                      key={`${active.id}-${step.label}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className="relative"
                    >
                      <span
                        className={`absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full ${
                          isLast ? "bg-blue-500" : "bg-emerald-500"
                        }`}
                      />
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{step.date}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Actions
                </p>
                {active.status === "Resolved" ? (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-white">Rate experience</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Rate service quality (out of 5).
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleRating(value)}
                          disabled={actionLoading || active.rating === value}
                          className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                            active.rating >= value
                              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                              : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                      {active.rating ? (
                        <span className="text-xs text-emerald-200">
                          Rated {active.rating}/5
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : active.status === "Rejected" ? (
                  <div className="mt-3">
                    <p className="text-sm text-slate-300">
                      This complaint was rejected and closed by the officer.
                    </p>
                    {active.rejectionReason ? (
                      <p className="mt-2 text-xs text-rose-300">
                        Reason: {active.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm text-slate-300">
                      Need to withdraw this complaint?
                    </p>
                    <button
                      type="button"
                      onClick={handleWithdraw}
                      disabled={actionLoading || active.source !== "complaints"}
                      className="mt-3 inline-flex items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? "Removing..." : "Remove complaint"}
                    </button>
                  </div>
                )}

                {actionError ? (
                  <p className="mt-3 text-xs text-rose-300">{actionError}</p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Select a complaint from the list to view its timeline.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default TrackComplaintPage;
