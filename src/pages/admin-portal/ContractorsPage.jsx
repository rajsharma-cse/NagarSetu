import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import StatsCards from "./components/StatsCards";
import BudgetOverviewCards from "./components/BudgetOverviewCards";
import FiltersBar from "./components/FiltersBar";
import ContractorTable from "./components/ContractorTable";
import AddContractorModal from "./components/AddContractorModal";
import ProfileModal from "./components/ProfileModal";
import WarningModal from "./components/WarningModal";
import RequestUpdateModal from "./components/RequestUpdateModal";
import ReviewTasksModal from "./components/ReviewTasksModal";
 
const ContractorsPage = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [taskCounts, setTaskCounts] = useState({});
  const [tasksToday, setTasksToday] = useState(0);
  const [profileModal, setProfileModal] = useState(null);
  const [warningModal, setWarningModal] = useState(null);
  const [warningTasks, setWarningTasks] = useState([]);
  const [warningTaskId, setWarningTaskId] = useState("");
  const [warningReason, setWarningReason] = useState("");
  const [warningStatus, setWarningStatus] = useState("");
  const [requestModal, setRequestModal] = useState(null);
  const [requestTasks, setRequestTasks] = useState([]);
  const [requestTaskId, setRequestTaskId] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewTasks, setReviewTasks] = useState([]);
  const [reviewTaskId, setReviewTaskId] = useState("");
  const [reviewUpdates, setReviewUpdates] = useState([]);
  const [reviewStatus, setReviewStatus] = useState("");
  const [activeOfficer, setActiveOfficer] = useState(null);
  const [allocatedBudget, setAllocatedBudget] = useState(0);
  const [assignForm, setAssignForm] = useState({
    taskType: "OFFICER",
    complaintId: "",
    title: "",
    department: "",
    ward: "",
    priority: "Medium",
    budgetAllocated: "",
    deadline: "",
    notes: "",
  });
  const departmentOptions = [
    "Public Works Department",
    "Sanitation & Waste",
    "Water Supply",
    "Street Lighting",
    "Parks & Horticulture",
  ];
 
  const createTaskRef = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "TSK-";
    for (let i = 0; i < 5; i += 1) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  };
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [ward, setWard] = useState("");
  const [expertise, setExpertise] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const perPage = 3;
 
  const fetchContractors = async () => {
    const { data, error } = await supabase
      .from("contractors")
      .select(
        "id,contractor_id,name,phone,email,ward,wards,expertise,created_at,status"
      )
      .order("created_at", { ascending: false });
 
    if (error) {
      setLoading(false);
      return;
    }
 
    setContractors(data || []);
    setLoading(false);
  };
 
  const fetchTaskCounts = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("contractor_id,created_at");
 
    if (error) return;
    const now = new Date();
    const todayKey = now.toDateString();
    let todayCount = 0;
    const counts = (data || []).reduce((acc, row) => {
      if (!row.contractor_id) return acc;
      acc[row.contractor_id] = (acc[row.contractor_id] || 0) + 1;
      if (row.created_at && new Date(row.created_at).toDateString() === todayKey) {
        todayCount += 1;
      }
      return acc;
    }, {});
    setTaskCounts(counts);
    setTasksToday(todayCount);
  };
 
  const fetchAllocatedBudget = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("budget_allocated,contractor_id");
 
    if (error) {
      return;
    }
 
    const blockedIds = new Set(
      contractors
        .filter((item) => (item.status || "").toLowerCase() === "blocked")
        .map((item) => item.id)
    );
    const totalAllocated = (data || []).reduce((sum, row) => {
      if (row.contractor_id && blockedIds.has(row.contractor_id)) return sum;
      return sum + (row.budget_allocated || 0);
    }, 0);
    setAllocatedBudget(totalAllocated);
  };
 
  useEffect(() => {
    fetchContractors();
    fetchAllocatedBudget();
    fetchTaskCounts();
  }, []);

  useEffect(() => {
    fetchAllocatedBudget();
  }, [contractors]);
 
  useEffect(() => {
    let mounted = true;
 
    const fetchOfficer = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;
 
      const { data, error } = await supabase
        .from("admin_officers")
        .select("full_name,designation")
        .eq("auth_user_id", userId)
        .maybeSingle();
 
      if (!mounted) return;
      if (!error) {
        setActiveOfficer(data);
      }
    };
 
    fetchOfficer();
 
    return () => {
      mounted = false;
    };
  }, []);
 
  const wardOptions = useMemo(() => {
    const wards = contractors
      .map((item) => item.ward)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return wards;
  }, [contractors]);
 
  const filtered = useMemo(() => {
    return contractors
      .filter((item) => {
        if (search) {
          const searchValue = search.toLowerCase();
          const match =
            item.name?.toLowerCase().includes(searchValue) ||
            item.email?.toLowerCase().includes(searchValue);
          if (!match) return false;
        }
        if (ward && item.ward !== ward) return false;
        return true;
      })
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [contractors, search, ward]);
 
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);
 
  const registryMeta = useMemo(() => {
    const wardsCovered = new Set(
      contractors.map((item) => item.ward).filter(Boolean)
    );
    const latest = contractors[0];
    return {
      total: filtered.length,
      wardsCovered: wardsCovered.size,
      latestName: latest?.name || "—",
      latestDate: latest?.created_at || null,
    };
  }, [contractors, filtered.length]);
 
  const stats = useMemo(() => {
    const total = contractors.length;
    const totalTasks = Object.values(taskCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const blocked = contractors.filter(
      (item) => (item.status || "").toLowerCase() === "blocked"
    ).length;
    return {
      total,
      tasksAssigned: totalTasks,
      blocked,
      tasksToday,
    };
  }, [contractors, taskCounts, tasksToday]);
 
  const budgetValues = useMemo(() => {
    const total = 35000000;
    const infra = 12000000;
    const allocated = allocatedBudget || 0;
    const remaining = Math.max(0, infra - allocated);
    return { total, infra, allocated, remaining };
  }, [allocatedBudget]);
 
  const handleAddContractor = async (payload, reset) => {
    setFormError("");
    setFormSuccess("");
 
    const contractorId = payload.contractorId.trim();
    const name = payload.name.trim();
    const email = payload.email.trim();
    const phoneDigits = payload.phone.replace(/\D/g, "");
    const ward = payload.ward.trim();
    const wards = payload.wards.trim();
 
    if (!contractorId || !name || !phoneDigits || !email) {
      setFormError("Contractor ID, name, phone, and email are required.");
      return;
    }
    if (!ward) {
      setFormError("Primary ward is required.");
      return;
    }
    if (!payload.expertise.length) {
      setFormError("Select up to 2 expertise areas.");
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase.from("contractors").insert({
      contractor_id: contractorId,
      name,
      phone: phoneDigits,
      email,
      ward,
      wards,
      expertise: payload.expertise.join(", "),
      status: "Active",
    }).select().single();
 
    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }
    if (!data) {
      setFormError("Unable to save contractor. Check access policies (RLS) for contractors table.");
      setIsSubmitting(false);
      return;
    }
 
    setFormSuccess("Contractor added successfully.");
    reset({
      contractorId: "",
      name: "",
      phone: "",
      email: "",
      ward: "",
      wards: "",
      expertise: [],
    });
    await fetchContractors();
    setIsSubmitting(false);
  };
 
  const handleAction = (action, contractor) => {
    if (action === "Assign Task") {
      setAssignModal(contractor);
      setAssignError("");
      setAssignSuccess("");
      setAssignForm({
        taskType: "OFFICER",
        complaintId: "",
        title: `Task for ${contractor.name}`,
        department: "",
        ward: contractor.ward || "",
        priority: "Medium",
        budgetAllocated: "",
        deadline: "",
        notes: "",
      });
      return;
    }
    if (action === "View Profile") {
      setProfileModal(contractor);
      return;
    }
    if (action === "Send Warning") {
      setWarningModal(contractor);
      setWarningTaskId("");
      setWarningReason("");
      setWarningStatus("");
      (async () => {
        const { data } = await supabase
          .from("tasks")
          .select("id,task_ref,title,status,priority,deadline")
          .eq("contractor_id", contractor.id)
          .order("created_at", { ascending: false });
        setWarningTasks(data || []);
      })();
      return;
    }
    if (action === "Request Update") {
      setRequestModal(contractor);
      setRequestTaskId("");
      setRequestStatus("");
      (async () => {
        const { data } = await supabase
          .from("tasks")
          .select("id,task_ref,title,status,priority,deadline")
          .eq("contractor_id", contractor.id)
          .order("created_at", { ascending: false });
        setRequestTasks(data || []);
      })();
      return;
    }
    if (action === "Review Tasks") {
      setReviewModal(contractor);
      setReviewTaskId("");
      setReviewUpdates([]);
      setReviewStatus("");
      (async () => {
        const { data } = await supabase
          .from("tasks")
          .select(
            "id,task_ref,title,status,priority,deadline,department,ward,budget_allocated,notes,task_type"
          )
          .eq("contractor_id", contractor.id)
          .order("created_at", { ascending: false });
        setReviewTasks(data || []);
      })();
    }
    if (action === "Block Contractor" || action === "Unblock Contractor") {
      const nextStatus = action === "Block Contractor" ? "Blocked" : "Active";
      const updateStatus = async () => {
        const { error } = await supabase
          .from("contractors")
          .update({ status: nextStatus })
          .eq("id", contractor.id);
        if (error) return;
        setContractors((prev) =>
          prev.map((item) =>
            item.id === contractor.id ? { ...item, status: nextStatus } : item
          )
        );
      };
      updateStatus();
    }
  };
 
  const submitAssignTask = async () => {
    if (!assignModal || isAssigning) return;
    setAssignError("");
    setAssignSuccess("");
 
    if (!assignForm.title || !assignForm.department || !assignForm.ward) {
      setAssignError("Title, department, and ward are required.");
      return;
    }
 
    if (assignForm.taskType === "COMPLAINT" && !assignForm.complaintId.trim()) {
      setAssignError("Complaint ID starting with CPL is required.");
      return;
    }
 
    const complaintRef = assignForm.complaintId.trim().toUpperCase();
    if (assignForm.taskType === "COMPLAINT" && !complaintRef.startsWith("CPL")) {
      setAssignError("Complaint ID must start with CPL.");
      return;
    }
 
    let complaintIdToUse = null;
    if (assignForm.taskType === "COMPLAINT") {
      const { data: complaintRow, error: complaintLookupError } = await supabase
        .from("complaints")
        .select("id")
        .eq("complaint_ref", complaintRef)
        .maybeSingle();
 
      if (complaintLookupError || !complaintRow) {
        setAssignError("Complaint ID not found. Check the CPL number.");
        return;
      }
 
      complaintIdToUse = complaintRow.id;
    }
 
    setIsAssigning(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const officerId = sessionData?.session?.user?.id || null;
 
    const { error: taskError } = await supabase.from("tasks").insert({
      task_ref: createTaskRef(),
      complaint_id: complaintIdToUse,
      task_type: assignForm.taskType,
      contractor_id: assignModal.id,
      contractor_code: assignModal.contractor_id,
      title: assignForm.title,
      department: assignForm.department,
      ward: assignForm.ward,
      priority: assignForm.priority,
      status: "Assigned",
      assigned_by: officerId,
      assigned_by_name: activeOfficer?.full_name || "Municipal Officer",
      assigned_by_designation: activeOfficer?.designation || "Officer",
      budget_allocated: assignForm.budgetAllocated
        ? Number(assignForm.budgetAllocated)
        : null,
      deadline: assignForm.deadline || null,
      notes: assignForm.notes || null,
    });
 
    if (taskError) {
      setAssignError(taskError.message);
      setIsAssigning(false);
      return;
    }
 
    if (assignForm.taskType === "COMPLAINT" && complaintIdToUse) {
      await supabase
        .from("complaints")
        .update({ status: "In Progress" })
        .eq("id", complaintIdToUse);
    }
 
    setAssignSuccess("Task assigned successfully.");
    fetchAllocatedBudget();
    fetchTaskCounts();
    setAssignModal(null);
    setIsAssigning(false);
  };
 
  useEffect(() => {
    let mounted = true;
 
    const hydrateFromComplaint = async () => {
      if (assignForm.taskType !== "COMPLAINT") return;
      const complaintRef = assignForm.complaintId.trim().toUpperCase();
      if (!complaintRef.startsWith("CPL")) return;
 
      const { data: complaintRow } = await supabase
        .from("complaints")
        .select("department,ward,priority,description")
        .eq("complaint_ref", complaintRef)
        .maybeSingle();
 
      if (!mounted || !complaintRow) return;
 
      setAssignForm((prev) => ({
        ...prev,
        department: complaintRow.department || prev.department,
        ward: complaintRow.ward || prev.ward,
        priority: complaintRow.priority || prev.priority,
        notes: complaintRow.description || prev.notes,
      }));
    };
 
    hydrateFromComplaint();
 
    return () => {
      mounted = false;
    };
  }, [assignForm.complaintId, assignForm.taskType]);
 
  const selectedReviewTask = reviewTasks.find((task) => task.id === reviewTaskId);
 
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            Dashboard / Resource Management / Contractors
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Contractors</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage contractor registry and assign municipal tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError("");
            setFormSuccess("");
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:from-indigo-600 hover:to-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Contractor
        </button>
      </div>
 
      <StatsCards values={stats} />
 
      <BudgetOverviewCards values={budgetValues} />
 
      <FiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        ward={ward}
        onWardChange={(value) => {
          setWard(value);
          setPage(1);
        }}
        expertise={expertise}
        onExpertiseChange={setExpertise}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        wardOptions={wardOptions}
        expertiseOptions={[]}
        showStatus={false}
        onClear={() => {
          setSearch("");
          setWard("");
          setExpertise("");
          setStatus("");
          setSort("newest");
          setPage(1);
        }}
      />
 
      <ContractorTable
        contractors={paginated}
        loading={loading}
        page={page}
        perPage={perPage}
        total={filtered.length}
        onPageChange={setPage}
        onAction={handleAction}
        searchTerm={search}
        showExpertise={false}
        showStatus={false}
        showRegNo={false}
        registryMeta={registryMeta}
        taskCounts={taskCounts}
      />
 
      <AddContractorModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddContractor}
        isSubmitting={isSubmitting}
        formError={formError}
        formSuccess={formSuccess}
        onResetFeedback={() => {
          setFormError("");
          setFormSuccess("");
        }}
      />
 
      {assignModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                  Assign Task
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {assignModal.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create a structured task and assign it to this contractor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
 
            <form className="mt-6 grid gap-4 md:grid-cols-2">
              {assignError ? (
                <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                  {assignError}
                </div>
              ) : null}
 
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
              </div>

              {assignForm.taskType === "COMPLAINT" ? (
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
                  Complaint ID (CPL-*)
                  <input
                    value={assignForm.complaintId}
                    onChange={(event) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        complaintId: event.target.value,
                      }))
                    }
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="CPL-2026-XXXXXX"
                  />
                </label>
              ) : null}

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Task Title
                <input
                  value={assignForm.title}
                  onChange={(event) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Department
                <select
                  value={assignForm.department}
                  onChange={(event) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      department: event.target.value,
                    }))
                  }
                  disabled={assignForm.taskType === "COMPLAINT"}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Ward
                <input
                  value={assignForm.ward}
                  onChange={(event) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      ward: event.target.value,
                    }))
                  }
                  disabled={assignForm.taskType === "COMPLAINT"}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Priority
                <select
                  value={assignForm.priority}
                  onChange={(event) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      priority: event.target.value,
                    }))
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
                    setAssignForm((prev) => ({
                      ...prev,
                      deadline: event.target.value,
                    }))
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
                    setAssignForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submitAssignTask}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Assign Task
              </button>
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
 
      <ProfileModal
        contractor={profileModal}
        onClose={() => setProfileModal(null)}
      />
      <WarningModal
        contractor={warningModal}
        onClose={() => setWarningModal(null)}
        warningTasks={warningTasks}
        warningTaskId={warningTaskId}
        setWarningTaskId={setWarningTaskId}
        warningReason={warningReason}
        setWarningReason={setWarningReason}
        warningStatus={warningStatus}
        setWarningStatus={setWarningStatus}
        activeOfficer={activeOfficer}
      />

      {/*
      {warningModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
                  Send Warning
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {warningModal.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Review tasks assigned to this contractor before issuing a warning.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWarningModal(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
 
            <div className="mt-5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              {warningTasks.length ? (
                warningTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-200/60 py-2 last:border-b-0"
                  >
                    <label className="flex flex-1 items-start gap-3">
                      <input
                        type="radio"
                        name="warningTask"
                        value={task.id}
                        checked={warningTaskId === task.id}
                        onChange={() => {
                          setWarningTaskId(task.id);
                          setWarningStatus("");
                        }}
                        className="mt-1 h-4 w-4 rounded-full border-slate-300 text-amber-500"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {task.task_ref || task.id} · {task.status || "Assigned"}
                        </p>
                      </div>
                    </label>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {task.priority || "Medium"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No tasks assigned to this contractor yet.
                </p>
              )}
            </div>
 
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Warning Reason
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Budget Misuse", "Deadline Exceed", "Irresponsible Work"].map(
                  (reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setWarningReason(reason)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        warningReason === reason
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700"
                      }`}
                    >
                      {reason}
                    </button>
                  )
                )}
              </div>
            </div>
 
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!warningTaskId) {
                    setWarningStatus("Select a task to issue a warning.");
                    return;
                  }
                  if (!warningReason) {
                    setWarningStatus("Select a warning reason.");
                    return;
                  }
                  const task = warningTasks.find((t) => t.id === warningTaskId);
                  const officerName = activeOfficer?.full_name || "Municipal Officer";
                  const officerDesignation = activeOfficer?.designation || "Officer";
                  const title = `Warning: ${warningReason}`;
                  const message = `Officer ${officerName} (${officerDesignation}) warns you about task ${task?.task_ref || task?.id} for: ${warningReason}.`;
 
                  const { error } = await supabase.from("contractor_notifications").insert({
                    contractor_id: warningModal.id,
                    title,
                    message,
                    type: "warning",
                    is_read: false,
                  });
 
                  if (error) {
                    setWarningStatus(error.message);
                    return;
                  }
                  setWarningStatus("Warning sent to contractor.");
                }}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Send Warning
              </button>
              <button
                type="button"
                onClick={() => setWarningModal(null)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-700"
              >
                Cancel
              </button>
              {warningStatus ? (
                <span className="text-sm font-semibold text-emerald-600">
                  {warningStatus}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      */}
 
      <RequestUpdateModal
        contractor={requestModal}
        onClose={() => setRequestModal(null)}
        requestTasks={requestTasks}
        requestTaskId={requestTaskId}
        setRequestTaskId={setRequestTaskId}
        requestStatus={requestStatus}
        setRequestStatus={setRequestStatus}
        activeOfficer={activeOfficer}
      />

      {/*
      {requestModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                  Request Update
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {requestModal.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a task and send an update request to the contractor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequestModal(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
 
            <div className="mt-5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              {requestTasks.length ? (
                requestTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-200/60 py-2 last:border-b-0"
                  >
                    <label className="flex flex-1 items-start gap-3">
                      <input
                        type="radio"
                        name="requestTask"
                        value={task.id}
                        checked={requestTaskId === task.id}
                        onChange={() => {
                          setRequestTaskId(task.id);
                          setRequestStatus("");
                        }}
                        className="mt-1 h-4 w-4 rounded-full border-slate-300 text-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {task.task_ref || task.id} · {task.status || "Assigned"}
                        </p>
                      </div>
                    </label>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {task.priority || "Medium"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No tasks assigned to this contractor yet.
                </p>
              )}
            </div>
 
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!requestTaskId) {
                    setRequestStatus("Select a task to request an update.");
                    return;
                  }
                  const task = requestTasks.find((t) => t.id === requestTaskId);
                  const officerName =
                    activeOfficer?.full_name || "Municipal Officer";
                  const officerDesignation =
                    activeOfficer?.designation || "Officer";
                  const title = "Update Request";
                  const message = `Officer ${officerName} (${officerDesignation}) requested a progress update on task ${
                    task?.task_ref || task?.id
                  }. Please submit the latest status and photos.`;
 
                  const { error } = await supabase
                    .from("contractor_notifications")
                    .insert({
                      contractor_id: requestModal.id,
                      title,
                      message,
                      type: "status",
                      is_read: false,
                    });
 
                  if (error) {
                    setRequestStatus(error.message);
                    return;
                  }
                  setRequestStatus("Update request sent.");
                }}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Send Request
              </button>
              <button
                type="button"
                onClick={() => setRequestModal(null)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                Cancel
              </button>
              {requestStatus ? (
                <span className="text-sm font-semibold text-emerald-600">
                  {requestStatus}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      */}
 
      <ReviewTasksModal
        contractor={reviewModal}
        onClose={() => setReviewModal(null)}
        reviewTasks={reviewTasks}
        reviewTaskId={reviewTaskId}
        setReviewTaskId={setReviewTaskId}
        setReviewUpdates={setReviewUpdates}
        reviewUpdates={reviewUpdates}
        reviewStatus={reviewStatus}
        setReviewStatus={setReviewStatus}
        setReviewTasks={setReviewTasks}
        selectedReviewTask={selectedReviewTask}
      />

      {/*
      {reviewModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                  Review Tasks
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {reviewModal.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a task to view contractor updates and status history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (reviewTaskId) {
                    setReviewTaskId("");
                    setReviewUpdates([]);
                    setReviewStatus("");
                    return;
                  }
                  setReviewModal(null);
                }}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {reviewTaskId ? "Back" : "Close"}
              </button>
            </div>
 
            <div
              className={`mt-5 grid gap-4 ${
                reviewTaskId ? "lg:grid-cols-1" : "lg:grid-cols-[1.1fr_0.9fr]"
              }`}
            >
              <div
                className={`max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm ${
                  reviewTaskId ? "hidden" : ""
                }`}
              >
                {reviewTasks.length ? (
                  reviewTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between gap-3 border-b border-slate-200/60 py-2 last:border-b-0 ${
                        reviewTaskId === task.id ? "rounded-xl bg-white px-3" : ""
                      }`}
                    >
                      <label className="flex flex-1 items-start gap-3">
                        <input
                          type="radio"
                          name="reviewTask"
                          value={task.id}
                          checked={reviewTaskId === task.id}
                          onChange={async () => {
                            setReviewTaskId(task.id);
                            setReviewStatus("");
                            const { data } = await supabase
                              .from("contractor_task_updates")
                              .select(
                                "id,status,notes,created_at,before_image_url,after_image_url"
                              )
                              .eq("task_id", task.id)
                              .order("created_at", { ascending: false });
                            setReviewUpdates(data || []);
                          }}
                          className="mt-1 h-4 w-4 rounded-full border-slate-300 text-emerald-500"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.task_ref || task.id} · {task.status || "Assigned"}
                          </p>
                        </div>
                      </label>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {task.priority || "Medium"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No tasks assigned to this contractor yet.
                  </p>
                )}
              </div>
 
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                {!reviewTaskId ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-sm text-slate-500">
                    Select a task to view update details.
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                          Task Details
                        </p>
                        <h4 className="mt-2 text-xl font-semibold text-slate-900">
                          {selectedReviewTask?.title || "Selected Task"}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedReviewTask?.task_ref || reviewTaskId}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!reviewTaskId) return;
                            const { error } = await supabase
                              .from("tasks")
                              .update({ status: "Completed" })
                              .eq("id", reviewTaskId);
                            if (error) {
                              setReviewStatus(error.message);
                              return;
                            }
                            setReviewTasks((prev) =>
                              prev.map((task) =>
                                task.id === reviewTaskId
                                  ? { ...task, status: "Completed" }
                                  : task
                              )
                            );
                            setReviewStatus("Task marked completed.");
                          }}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Mark Completed
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!reviewTaskId) return;
                            const { error } = await supabase
                              .from("tasks")
                              .update({ status: "Assigned" })
                              .eq("id", reviewTaskId);
                            if (error) {
                              setReviewStatus(error.message);
                              return;
                            }
                            setReviewTasks((prev) =>
                              prev.map((task) =>
                                task.id === reviewTaskId
                                  ? { ...task, status: "Assigned" }
                                  : task
                              )
                            );
                            setReviewStatus("Task sent back for re-examination.");
                          }}
                          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
                        >
                          Re-examine
                        </button>
                      </div>
                    </div>
 
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase text-slate-400">Status</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedReviewTask?.status || "Assigned"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase text-slate-400">Priority</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedReviewTask?.priority || "Medium"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase text-slate-400">Department</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedReviewTask?.department || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase text-slate-400">Ward</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedReviewTask?.ward || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase text-slate-400">Deadline</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedReviewTask?.deadline || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase text-slate-400">Budget Allocated</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedReviewTask?.budget_allocated
                            ? `INR ${Number(selectedReviewTask.budget_allocated).toLocaleString("en-IN")}`
                            : "-"}
                        </p>
                      </div>
                    </div>
 
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Task Notes
                      </p>
                      <p className="mt-1">
                        {selectedReviewTask?.notes || "No notes provided."}
                      </p>
                    </div>
 
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Latest Contractor Update
                      </p>
                      {reviewUpdates.length ? (
                        <div className="mt-3 space-y-3 text-sm text-slate-600">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Update Status
                            </p>
                            <p className="mt-1 font-semibold text-slate-800">
                              {reviewUpdates[0].status || "N/A"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Update Notes
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {reviewUpdates[0].notes || "No notes submitted."}
                            </p>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase text-slate-400">
                                Before
                              </p>
                              {reviewUpdates[0].before_image_url ? (
                                <img
                                  src={reviewUpdates[0].before_image_url}
                                  alt="Before work"
                                  className="mt-3 h-44 w-full rounded-xl object-cover shadow-sm"
                                />
                              ) : (
                                <p className="mt-2 text-xs text-slate-500">
                                  No image
                                </p>
                              )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase text-slate-400">
                                After
                              </p>
                              {reviewUpdates[0].after_image_url ? (
                                <img
                                  src={reviewUpdates[0].after_image_url}
                                  alt="After work"
                                  className="mt-3 h-44 w-full rounded-xl object-cover shadow-sm"
                                />
                              ) : (
                                <p className="mt-2 text-xs text-slate-500">
                                  No image
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                            Submitted: {reviewUpdates[0].created_at?.slice(0, 10) || "-"}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">
                          No contractor updates submitted yet.
                        </p>
                      )}
                    </div>
 
                    {reviewStatus ? (
                      <p className="text-sm font-semibold text-emerald-600">
                        {reviewStatus}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      */}
 
    </div>
  );
};
 
export default ContractorsPage;
