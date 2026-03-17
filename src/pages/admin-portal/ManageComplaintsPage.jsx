import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { wardDirectory } from "../../data/dummyData";

const statusStyles = {
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-200 text-slate-700 border-slate-300",
  Rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const priorityStyles = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ManageComplaintsPage = () => {
  const [openId, setOpenId] = useState(null);
  const [complainantInfo, setComplainantInfo] = useState({});
  const [complainantLoading, setComplainantLoading] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvedRows, setResolvedRows] = useState([]);
  const [rejectedRows, setRejectedRows] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [errorMessage, setErrorMessage] = useState("");
  const [replyText, setReplyText] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [activeOfficer, setActiveOfficer] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionView, setActionView] = useState("list");
  const [parshadNotified, setParshadNotified] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [aiSummary, setAiSummary] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiReplyLoading, setAiReplyLoading] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assignForm, setAssignForm] = useState({
    taskType: "COMPLAINT",
    contractorId: "",
    contractorCode: "",
    title: "",
    department: "",
    ward: "",
    priority: "Medium",
    budgetAllocated: "",
    deadline: "",
    notes: "",
  });

  const createTaskRef = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "TSK-";
    for (let i = 0; i < 5; i += 1) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  };

  const parshadDirectory = wardDirectory.reduce((acc, ward) => {
    acc[ward.ward] = {
      name: ward.councilor,
      contact: ward.contact,
      address: ward.address,
    };
    return acc;
  }, {});

  const rejectionReasons = [
    "Invalid Complain",
    "Lack of Credibility",
    "Already Addressed",
    "Not in work zone",
  ];

  const departmentOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      if (row.department) set.add(row.department);
    });
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const deptOk =
        departmentFilter === "All" || row.department === departmentFilter;
      const priorityOk =
        priorityFilter === "All" || row.priority === priorityFilter;
      return deptOk && priorityOk;
    });
  }, [rows, departmentFilter, priorityFilter]);

  const toggleRow = (id) => {
    setOpenId((current) => {
      const next = current === id ? null : id;
      if (next && !complainantInfo[id] && !complainantLoading[id]) {
        fetchComplainantInfo(id);
      }
      return next;
    });
    setReplyText("");
    setActionStatus("");
  };

  const API_BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:5050";

  const formatWithAi = async (text) => {
    const response = await fetch(`${API_BASE}/api/ai/format`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint: text }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "AI formatting failed.");
    }
    return data?.text || data?.result || data?.message || "";
  };

  const fetchComplainantInfo = async (complaintId) => {
    try {
      setComplainantLoading((prev) => ({ ...prev, [complaintId]: true }));
      const response = await fetch(`${API_BASE}/api/admin/complaint-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: complaintId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to fetch complainant details.");
      }
      setComplainantInfo((prev) => ({ ...prev, [complaintId]: data }));
    } catch (error) {
      setComplainantInfo((prev) => ({
        ...prev,
        [complaintId]: {
          is_anonymous: false,
          name: "Unable to load",
          contact: "N/A",
          error: true,
          errorMessage: error?.message || "Unable to fetch complainant details.",
        },
      }));
    } finally {
      setComplainantLoading((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const refreshComplaints = async (mountedGuard = () => true) => {
    const [activeResult, resolvedResult, rejectedResult] = await Promise.all([
      supabase
        .from("complaints")
        .select(
          "id,complaint_ref,citizen_id,department,ward,status,priority,priority_score,description,created_at,removed"
        )
        .or("removed.is.null,removed.eq.false")
        .order("created_at", { ascending: false }),
      supabase
        .from("resolved_complaints")
          .select(
            "id,complaint_ref,citizen_id,department,ward,status,priority,priority_score,description,created_at,closed_at"
          )
        .order("closed_at", { ascending: false }),
      supabase
        .from("rejected_complaints")
          .select(
            "id,complaint_ref,citizen_id,department,ward,status,priority,priority_score,description,created_at,closed_at"
          )
        .order("closed_at", { ascending: false }),
    ]);

    if (!mountedGuard()) {
      return;
    }

    const combinedError =
      activeResult.error || resolvedResult.error || rejectedResult.error;

    if (combinedError) {
      setErrorMessage(combinedError.message);
      setLoading(false);
      return;
    }

      const mapRow = (item) => ({
        id: item.id,
        complaintRef: item.complaint_ref,
        citizenId: item.citizen_id,
        department: item.department,
        ward: item.ward,
        status: item.status || "Pending",
        priority: item.priority || "Medium",
        priorityScore: item.priority_score ?? null,
        description: item.description,
        date: item.created_at?.slice(0, 10) || "",
        imageUrl: null,
      });

      const mapArchiveRow = (item) => ({
        id: item.id,
        complaintRef: item.complaint_ref,
        citizenId: item.citizen_id,
        department: item.department,
        ward: item.ward,
        status: item.status || "Resolved",
        priority: item.priority || "Medium",
        priorityScore: item.priority_score ?? null,
        description: item.description,
        date: item.closed_at?.slice(0, 10) || item.created_at?.slice(0, 10) || "",
      });

    const mapped = (activeResult.data || []).map((item) => mapRow(item));

    const complaintIds = mapped.map((item) => item.id);
    if (complaintIds.length) {
      const { data: imageRows } = await supabase
        .from("complaint_images")
        .select("complaint_id,file_path")
        .in("complaint_id", complaintIds);

      const firstImages = (imageRows || []).reduce((acc, img) => {
        if (!acc[img.complaint_id]) {
          acc[img.complaint_id] = img.file_path;
        }
        return acc;
      }, {});

      const signedUrls = await Promise.all(
        Object.entries(firstImages).map(async ([complaintId, path]) => {
          const { data: signed } = await supabase.storage
            .from("complaint-images")
            .createSignedUrl(path, 60 * 60);
          return { complaintId, url: signed?.signedUrl || null };
        })
      );

      const urlMap = signedUrls.reduce((acc, item) => {
        acc[item.complaintId] = item.url;
        return acc;
      }, {});

      mapped.forEach((item) => {
        item.imageUrl = urlMap[item.id] || null;
      });
    }

    setRows(mapped);
    setResolvedRows((resolvedResult.data || []).map((item) => mapArchiveRow(item)));
    setRejectedRows((rejectedResult.data || []).map((item) => mapArchiveRow(item)));
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    refreshComplaints(() => mounted);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchContractors = async () => {
      const { data, error } = await supabase
        .from("contractors")
        .select("id,contractor_id,name,phone,email,ward,wards,expertise")
        .order("name", { ascending: true });

      if (!mounted) return;
      if (!error) {
        setContractors(data || []);
      }
    };

    fetchContractors();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchOfficer = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        return;
      }

      let { data, error } = await supabase
        .from("admin_officers")
        .select("admin_id,full_name,designation,mobile_number,email")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!data) {
        const sessionUser = sessionData?.session?.user;
        const email = sessionUser?.email || "";
        const phoneDigits = (sessionUser?.phone || "").replace(/\D/g, "");
        if (email) {
          const fallback = await supabase
            .from("admin_officers")
            .select("admin_id,full_name,designation,mobile_number,email")
            .ilike("email", email)
            .maybeSingle();
          data = fallback.data || data;
          error = fallback.error || error;
        }
        if (!data && phoneDigits) {
          const fallback = await supabase
            .from("admin_officers")
            .select("admin_id,full_name,designation,mobile_number,email")
            .ilike("mobile_number", `%${phoneDigits}`)
            .maybeSingle();
          data = fallback.data || data;
          error = fallback.error || error;
        }
      }

      if (!mounted) {
        return;
      }

      if (!error && data) {
        setActiveOfficer(data);
      }
    };

    fetchOfficer();

    return () => {
      mounted = false;
    };
  }, []);

  const handleReply = async (row) => {
    if (!replyText.trim()) {
      setActionStatus("Write a reply before sending.");
      return;
    }
    const officerName = activeOfficer?.full_name || "Municipal Officer";
    const officerDesignation = activeOfficer?.designation || "Officer";
    const officerContact =
      activeOfficer?.mobile_number || activeOfficer?.email || "N/A";
    const footer = `\n\nOfficer: ${officerName}\nDesignation: ${officerDesignation}\nContact: ${officerContact}`;

    const { error } = await supabase.from("notifications").insert({
      user_id: row.citizenId,
      title: `Update on ${row.complaintRef || "your complaint"}`,
      message: `${replyText.trim()}${footer}`,
      is_read: false,
    });

    if (error) {
      setActionStatus(error.message);
      return;
    }
    setActionStatus("Reply sent to citizen.");
    setReplyText("");
  };

  const handleSummarize = async (row) => {
    if (!row?.description) return;
    setAiLoading((prev) => ({ ...prev, [row.id]: true }));
    try {
      const text = await formatWithAi(row.description);
      setAiSummary((prev) => ({ ...prev, [row.id]: text || "No summary returned." }));
    } catch (error) {
      setAiSummary((prev) => ({
        ...prev,
        [row.id]: error?.message || "AI summarize failed.",
      }));
    } finally {
      setAiLoading((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  const handleAiReply = async (row) => {
    if (!row?.description) {
      setActionStatus("Description is required to generate a reply.");
      return;
    }
    setAiReplyLoading((prev) => ({ ...prev, [row.id]: true }));
    try {
      const text = await formatWithAi(row.description);
      setReplyText(text);
      await handleReply(row);
    } catch (error) {
      setActionStatus(error?.message || "AI reply failed.");
    } finally {
      setAiReplyLoading((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  const openAssignModal = (row) => {
    setAssignTarget(row);
    setAssignForm({
      taskType: "COMPLAINT",
      contractorId: "",
      contractorCode: "",
      title: `Complaint ${row.complaintRef || row.id}`,
      department: row.department,
      ward: row.ward,
      priority: row.priority || "Medium",
      budgetAllocated: "",
      deadline: "",
      notes: row.description || "",
    });
    setAssignModalOpen(true);
  };

  const submitAssignTask = async () => {
    if (!assignTarget) return;
    if (!assignForm.contractorId) {
      setActionStatus("Select a contractor to assign.");
      return;
    }

    const contractor = contractors.find((c) => c.id === assignForm.contractorId);
    const { data: sessionData } = await supabase.auth.getSession();
    const officerId = sessionData?.session?.user?.id || null;
    const officerName = activeOfficer?.full_name || "Municipal Officer";
    const officerDesignation = activeOfficer?.designation || "Officer";

    const { error: taskError } = await supabase.from("tasks").insert({
      task_ref: createTaskRef(),
      complaint_id: assignForm.taskType === "COMPLAINT" ? assignTarget.id : null,
      task_type: assignForm.taskType,
      contractor_id: assignForm.contractorId,
      contractor_code: contractor?.contractor_id || assignForm.contractorCode,
      title: assignForm.title,
      department: assignForm.department,
      ward: assignForm.ward,
      priority: assignForm.priority,
      status: "Assigned",
      assigned_by: officerId,
      assigned_by_name: officerName,
      assigned_by_designation: officerDesignation,
      budget_allocated: assignForm.budgetAllocated
        ? Number(assignForm.budgetAllocated)
        : null,
      deadline: assignForm.deadline || null,
      notes: assignForm.notes || null,
    });

    if (taskError) {
      setActionStatus(taskError.message);
      return;
    }

    if (assignForm.taskType === "COMPLAINT") {
      const { error: complaintError } = await supabase
        .from("complaints")
        .update({ status: "In Progress" })
        .eq("id", assignTarget.id);

      if (complaintError) {
        setActionStatus(complaintError.message);
        return;
      }
    }

    setAssignModalOpen(false);
    setActionStatus("Task assigned successfully.");
    await refreshComplaints();
  };

  const handleReview = (row) => {
    setReviewTarget(row);
    setActionTarget(row);
    setActionView("review");
    setActionStatus("");
    setActionModalOpen(true);
  };

  const openRejectModal = (row) => {
    setRejectTarget(row);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason) {
      setActionStatus("Select a rejection reason.");
      return;
    }
    await applyReviewStatus(rejectTarget, "Rejected", rejectReason);
    setRejectModalOpen(false);
    setRejectTarget(null);
    setRejectReason("");
  };

  const resolveOfficerMeta = async () => {
    if (activeOfficer?.full_name) {
      const email = activeOfficer.email || "N/A";
      const mobile = activeOfficer.mobile_number || "N/A";
      return {
        name: activeOfficer.full_name,
        role: activeOfficer.designation || "Officer",
        contact: `${email} | ${mobile}`,
        adminId: activeOfficer.admin_id || null,
      };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const userEmail = sessionData?.session?.user?.email || "";
    const userPhoneDigits = (sessionData?.session?.user?.phone || "").replace(/\D/g, "");
    const storedAdminId =
      typeof window !== "undefined" ? sessionStorage.getItem("admin_id") : "";

    let profile = null;
    if (userId) {
      const { data } = await supabase
        .from("admin_officers")
        .select("admin_id,full_name,designation,mobile_number,email")
        .eq("auth_user_id", userId)
        .maybeSingle();
      profile = data || profile;
    }
    if (!profile && userEmail) {
      const { data } = await supabase
        .from("admin_officers")
        .select("admin_id,full_name,designation,mobile_number,email")
        .ilike("email", userEmail)
        .maybeSingle();
      profile = data || profile;
    }
    if (!profile && userPhoneDigits) {
      const { data } = await supabase
        .from("admin_officers")
        .select("admin_id,full_name,designation,mobile_number,email")
        .ilike("mobile_number", `%${userPhoneDigits}`)
        .maybeSingle();
      profile = data || profile;
    }
    if (!profile && storedAdminId) {
      const { data } = await supabase
        .from("admin_officers")
        .select("admin_id,full_name,designation,mobile_number,email")
        .ilike("admin_id", storedAdminId)
        .maybeSingle();
      profile = data || profile;
    }

    const email = profile?.email || "N/A";
    const mobile = profile?.mobile_number || "N/A";
    return {
      name: profile?.full_name || "Municipal Officer",
      role: profile?.designation || "Officer",
      contact: `${email} | ${mobile}`,
      adminId: profile?.admin_id || storedAdminId || null,
    };
  };

  const moveComplaintToArchive = async (
    row,
    tableName,
    finalStatus,
    officerMeta
  ) => {
    const { data: fullRow, error: fetchError } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", row.id)
      .maybeSingle();

    if (fetchError || !fullRow) {
      setActionStatus(fetchError?.message || "Unable to locate complaint.");
      return false;
    }

    const payload = {
      complaint_id: fullRow.id,
      complaint_ref: fullRow.complaint_ref,
      citizen_id: fullRow.citizen_id,
      category: fullRow.category,
      department: fullRow.department,
      ward: fullRow.ward,
      description: fullRow.description,
      status: finalStatus,
      priority: fullRow.priority,
      priority_score: fullRow.priority_score,
      created_at: fullRow.created_at,
      closed_at: new Date().toISOString(),
      officer_name: officerMeta?.name || fullRow.officer_name,
      officer_role: officerMeta?.role || fullRow.officer_role,
      officer_contact: officerMeta?.contact || fullRow.officer_contact,
      officer_admin_id: officerMeta?.adminId || fullRow.officer_admin_id,
      rejection_reason:
        finalStatus === "Rejected"
          ? officerMeta?.rejectionReason || fullRow.rejection_reason || null
          : null,
    };

    if (tableName === "resolved_complaints") {
      payload.rating = fullRow.rating;
      payload.rating_submitted_at = fullRow.rating_submitted_at;
    }

    const { error: insertError } = await supabase
      .from(tableName)
      .insert(payload);

    if (insertError) {
      setActionStatus(insertError.message);
      return false;
    }

    const { error: deleteImagesError } = await supabase
      .from("complaint_images")
      .delete()
      .eq("complaint_id", row.id);

    if (deleteImagesError) {
      setActionStatus(deleteImagesError.message);
      return false;
    }

    const { data: deletedRows, error: deleteError } = await supabase
      .from("complaints")
      .delete()
      .eq("id", row.id)
      .select("id");

    if (deleteError) {
      setActionStatus(deleteError.message);
      return false;
    }

    if (!deletedRows || deletedRows.length === 0) {
      setActionStatus(
        "Delete blocked by database policy. Update RLS for complaints."
      );
      return false;
    }

    return true;
  };

  const applyReviewStatus = async (row, status, reason = "") => {
    const nextStatus =
      status === "Accepted"
        ? "Pending"
        : status === "Closed"
        ? "Resolved"
        : status === "Rejected"
        ? "Rejected"
        : status;
    const officerMeta = await resolveOfficerMeta();
    const officerName = officerMeta.name;
    const officerDesignation = officerMeta.role;
    const officerContact = officerMeta.contact;
    const officerAdminId = officerMeta.adminId || null;
    if (nextStatus === "Resolved" || nextStatus === "Rejected") {
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          status: nextStatus,
          officer_name: officerName,
          officer_role: officerDesignation,
          officer_contact: officerContact,
          officer_admin_id: officerAdminId,
          rejection_reason: nextStatus === "Rejected" ? reason || null : null,
        })
        .eq("id", row.id);
      if (updateError) {
        setActionStatus(updateError.message);
        return;
      }
      const tableName =
        nextStatus === "Resolved" ? "resolved_complaints" : "rejected_complaints";
      const moved = await moveComplaintToArchive(
        row,
        tableName,
        nextStatus,
        {
          ...officerMeta,
          rejectionReason: reason || null,
        }
      );
      if (moved) {
        setActionStatus(`${nextStatus} complaint archived.`);
        setActionModalOpen(false);
        await refreshComplaints();
      }
      return;
    }

    const { error } = await supabase
      .from("complaints")
      .update({
        status: nextStatus,
        officer_name: officerName,
        officer_role: officerDesignation,
        officer_contact: officerContact,
        officer_admin_id: officerAdminId,
      })
      .eq("id", row.id);

    if (error) {
      setActionStatus(error.message);
      return;
    }

    setActionStatus(`Status updated to ${nextStatus}.`);
    setActionModalOpen(false);
    await refreshComplaints();
  };

  const handleTakeAction = (row) => {
    setActionTarget(row);
    setActionView("list");
    setParshadNotified(false);
    setActionModalOpen(true);
  };

  const applyAction = async (actionLabel) => {
    if (!actionTarget) {
      return;
    }
    const officerMeta = await resolveOfficerMeta();
    const officerName = officerMeta.name;
    const officerDesignation = officerMeta.role;
    const officerContact = officerMeta.contact;
    const officerAdminId = officerMeta.adminId || null;
    const moved = await moveComplaintToArchive(
      actionTarget,
      "resolved_complaints",
      "Resolved",
      {
        name: officerName,
        role: officerDesignation,
        contact: officerContact,
        adminId: officerAdminId,
      }
    );
    if (!moved) {
      return;
    }
    setActionStatus(`Action taken: ${actionLabel}`);
    setActionModalOpen(false);
    await refreshComplaints();
  };

  const getWardKey = (wardLabel) => {
    if (!wardLabel) return "";
    const match = wardLabel.match(/Ward\s*\d+/i);
    return match?.[0] || wardLabel;
  };

  const renderArchiveTable = (title, entries, emptyText, badgeColor) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor}`}>
          {entries.length}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="pb-4 pr-4">Complaint ID</th>
              <th className="pb-4 pr-4">Department</th>
              <th className="pb-4 pr-4">Ward</th>
              <th className="pb-4 pr-4">Status</th>
              <th className="pb-4">Closed On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-sm text-slate-500">
                  Loading records...
                </td>
              </tr>
            ) : entries.length ? (
              entries.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 pr-4 font-mono text-slate-900">
                    {row.complaintRef || row.id}
                  </td>
                  <td className="py-4 pr-4 font-semibold text-slate-800">
                    {row.department}
                  </td>
                  <td className="py-4 pr-4 text-slate-600">{row.ward}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${
                        statusStyles[row.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500">{row.date || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-sm text-slate-500">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabOptions = [
    { id: "active", label: "Active Complaints", count: rows.length },
    { id: "resolved", label: "Resolved Complaints", count: resolvedRows.length },
    { id: "rejected", label: "Rejected Complaints", count: rejectedRows.length },
  ];


  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Manage Complaints</h1>
        <p className="text-sm text-slate-500">
          Track, assign, and resolve citizen complaints across wards.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {tabOptions.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            Department
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            Priority
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {["All", "High", "Medium", "Low"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {activeTab === "active" ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Complaint ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Ward</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-sm text-slate-500">
                      Loading complaints...
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-sm text-rose-600">
                      {errorMessage}
                    </td>
                  </tr>
                ) : filteredRows.length ? (
                  filteredRows.map((row) => (
                    <Fragment key={row.id}>
                      <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-900">
                          {row.complaintRef || row.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {row.department}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.ward}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${
                              statusStyles[row.status]
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${
                              priorityStyles[row.priority] ??
                              "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{row.date}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => toggleRow(row.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Read more
                          </button>
                        </td>
                      </tr>
                      {openId === row.id ? (
                        <tr className="border-b border-slate-100">
                          <td colSpan={7} className="px-4 pb-5 pt-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="grid gap-6 lg:grid-cols-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase text-slate-500">
                                    Description
                                  </p>
                                  <p className="mt-2 text-sm text-slate-700">
                                    {row.description}
                                  </p>
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSummarize(row)}
                                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                    >
                                      {aiLoading[row.id] ? "Summarizing..." : "Summarize with AI"}
                                    </button>
                                    {aiSummary[row.id] ? (
                                      <span className="text-xs text-slate-500">
                                        AI summary ready
                                      </span>
                                    ) : null}
                                  </div>
                                  {aiSummary[row.id] ? (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                      {aiSummary[row.id]}
                                    </div>
                                  ) : null}
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                      Evidence
                                    </p>
                                    {row.imageUrl ? (
                                      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <img
                                          src={row.imageUrl}
                                          alt="Complaint evidence"
                                          className="h-44 w-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                                        No image uploaded.
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="rounded-xl border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                      Complainant Information
                                    </p>
                                    {complainantLoading[row.id] ? (
                                      <p className="mt-2 text-sm text-slate-500">
                                        Loading complainant details...
                                      </p>
                                    ) : complainantInfo[row.id]?.error ? (
                                      <p className="mt-2 text-sm text-rose-600">
                                        {complainantInfo[row.id]?.errorMessage ||
                                          "Unable to fetch complainant details."}
                                      </p>
                                    ) : complainantInfo[row.id]?.is_anonymous ? (
                                      <p className="mt-2 text-sm text-slate-500">
                                        User requested anonymity.
                                      </p>
                                    ) : (
                                      <div className="mt-2 space-y-1 text-sm text-slate-700">
                                        <p className="font-semibold text-slate-900">
                                          {complainantInfo[row.id]?.name || "Citizen"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {complainantInfo[row.id]?.contact || "N/A"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                      Reply to citizen
                                    </p>
                                    <textarea
                                      rows={3}
                                      value={replyText}
                                      onChange={(event) =>
                                        setReplyText(event.target.value)
                                      }
                                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                      placeholder="Write a reply to be sent as notification..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleReply(row)}
                                      className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                    >
                                      Send reply
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAiReply(row)}
                                      className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                    >
                                      {aiReplyLoading[row.id] ? "Sending with AI..." : "Send using AI"}
                                    </button>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                      Actions
                                    </p>
                                    <div className="mt-3 grid gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleReview(row)}
                                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                      >
                                        Review
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openAssignModal(row)}
                                      className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                      >
                                        Assign Contractor
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleTakeAction(row)}
                                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                                      >
                                        Take action
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {actionStatus ? (
                                <p className="mt-3 text-xs font-semibold text-slate-500">
                                  {actionStatus}
                                </p>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-sm text-slate-500">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "resolved" ? (
        renderArchiveTable(
          "Resolved Complaints",
          resolvedRows,
          "No resolved complaints yet.",
          "bg-emerald-100 text-emerald-700 border-emerald-200"
        )
      ) : (
        renderArchiveTable(
          "Rejected Complaints",
          rejectedRows,
          "No rejected complaints yet.",
          "bg-rose-100 text-rose-700 border-rose-200"
        )
      )}

      {actionModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 text-white shadow-2xl">
            <div className="relative overflow-hidden px-6 py-5">
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/40 blur-2xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/30 blur-3xl" />
              </div>
              <h3 className="relative text-lg font-semibold">Take Action</h3>
              <p className="relative mt-1 text-sm text-slate-200">
                Select the action to initiate for this complaint.
              </p>
            </div>

            <div className="bg-white/5 px-6 py-5">
              {actionView === "review" ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Review action
                  </p>
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      onClick={() => applyReviewStatus(actionTarget, "Closed")}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => applyReviewStatus(actionTarget, "Accepted")}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionModalOpen(false);
                        openRejectModal(actionTarget);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : actionView === "parshad" ? (
                (() => {
                  const wardKey = getWardKey(actionTarget?.ward);
                  const parshad = wardKey ? parshadDirectory[wardKey] : null;
                  return (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                        Ward Parshad Contact
                      </p>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                        {parshadNotified ? (
                          <div className="flex items-center gap-3 text-emerald-200">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-lg">
                              ✓
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-emerald-100">
                                Notification sent
                              </p>
                              <p className="text-xs text-emerald-200">
                                Parshad has been notified.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-base font-semibold">
                              {parshad?.name || "Not available"}
                            </p>
                            <p className="mt-1 text-sm text-slate-200">
                              Ward: {wardKey || "—"}
                            </p>
                            <p className="mt-1 text-sm text-slate-200">
                              Contact: {parshad?.contact || "Not available"}
                            </p>
                            <p className="mt-1 text-sm text-slate-200">
                              Address: {parshad?.address || "Not available"}
                            </p>
                            <button
                              type="button"
                              onClick={() => setParshadNotified(true)}
                              className="mt-4 rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                            >
                              Ask for report
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="grid gap-2">
                  {[
                    "Sent Audit team",
                    "Call Police",
                    "Call Ambulance",
                    "Ask ward Parshad report",
                  ].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() =>
                        action === "Ask ward Parshad report"
                          ? setActionView("parshad")
                          : applyAction(action)
                      }
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4">
              {actionView === "parshad" ? (
                <button
                  type="button"
                  onClick={() => setActionView("list")}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {assignModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Assign Task
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Create task for contractor
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Fill all task details before assigning.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Task Type
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "Complaint-related", value: "COMPLAINT" },
                    { label: "Officer-assigned", value: "OFFICER" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setAssignForm((prev) => ({
                          ...prev,
                          taskType: option.value,
                        }))
                      }
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        assignForm.taskType === option.value
                          ? "border-blue-500 bg-blue-600 text-white shadow-[0_8px_20px_-12px_rgba(37,99,235,0.6)]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Choose complaint-related to link with the current complaint, or officer-assigned for standalone work.
                </p>
              </div>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Select Contractor
                <select
                  value={assignForm.contractorId}
                  onChange={(event) => {
                    const value = event.target.value;
                    const selected = contractors.find((c) => c.id === value);
                    setAssignForm((prev) => ({
                      ...prev,
                      contractorId: value,
                      contractorCode: selected?.contractor_id || "",
                    }));
                  }}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select contractor</option>
                  {contractors.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name} ({contractor.contractor_id})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Task Title
                <input
                  value={assignForm.title}
                  onChange={(event) =>
                    setAssignForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Department
                <input
                  value={assignForm.department}
                  onChange={(event) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      department: event.target.value,
                    }))
                  }
                  disabled={assignForm.taskType === "COMPLAINT"}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Ward
                <input
                  value={assignForm.ward}
                  onChange={(event) =>
                    setAssignForm((prev) => ({ ...prev, ward: event.target.value }))
                  }
                  disabled={assignForm.taskType === "COMPLAINT"}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Priority
                <select
                  value={assignForm.priority}
                  onChange={(event) =>
                    setAssignForm((prev) => ({ ...prev, priority: event.target.value }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Deadline
                <input
                  type="date"
                  value={assignForm.deadline}
                  onChange={(event) =>
                    setAssignForm((prev) => ({ ...prev, deadline: event.target.value }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Budget Allocation (INR)
                <input
                  type="number"
                  value={assignForm.budgetAllocated}
                  onChange={(event) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      budgetAllocated: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="md:col-span-2 flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Notes
                <textarea
                  rows={3}
                  value={assignForm.notes}
                  onChange={(event) =>
                    setAssignForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submitAssignTask}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Assign Task
              </button>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                  Reject Complaint
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  Select a reason
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  The selected reason will be shown to the citizen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {rejectionReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${
                    rejectReason === reason
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50/50"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {actionStatus ? (
              <p className="mt-3 text-xs font-semibold text-rose-500">
                {actionStatus}
              </p>
            ) : null}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={confirmReject}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
              >
                Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
};

export default ManageComplaintsPage;
