import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

const statusOptions = ["Assigned", "In Progress", "Completed"];

const WorkUpdateForm = () => {
  const { contractor } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [nextStatus, setNextStatus] = useState("Assigned");
  const [updateNotes, setUpdateNotes] = useState("");
  const [beforeWorkImage, setBeforeWorkImage] = useState(null);
  const [afterWorkImage, setAfterWorkImage] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    const loadTasks = async () => {
      if (!contractor?.id) return;
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id,task_ref,title,department,ward,priority,deadline,status,notes,complaint_id,task_type"
        )
        .eq("contractor_id", contractor.id)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (!error) {
        setTasks(data || []);
      }
      setLoading(false);
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, [contractor?.id]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  useEffect(() => {
    if (selectedTask?.status) {
      setNextStatus(selectedTask.status);
    }
  }, [selectedTask?.status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!selectedTaskId) {
      setMessage({ type: "error", text: "Please select a task first." });
      return;
    }

    setSubmitting(true);

    const existingNotes = selectedTask?.notes || "";
    const trimmedUpdate = updateNotes.trim();
    const combinedNotes = trimmedUpdate
      ? `${existingNotes}${existingNotes ? "\n\n" : ""}Update (${new Date().toLocaleString()}): ${trimmedUpdate}`
      : existingNotes;

    const payload = {
      status: nextStatus,
      notes: combinedNotes,
    };

    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", selectedTaskId);

    if (error) {
      setMessage({
        type: "error",
        text: "Could not update the task. Please try again.",
      });
      setSubmitting(false);
      return;
    }

    const uploadImage = async (file, label) => {
      if (!file || !contractor?.id) return null;
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${label}-${Date.now()}.${ext}`;
      const filePath = `${contractor.id}/${selectedTaskId}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("contractor-updates")
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage
        .from("contractor-updates")
        .getPublicUrl(filePath);
      return data?.publicUrl || null;
    };

    let beforeUrl = null;
    let afterUrl = null;
    try {
      beforeUrl = await uploadImage(beforeWorkImage, "before");
      afterUrl = await uploadImage(afterWorkImage, "after");
    } catch (uploadErr) {
      setMessage({
        type: "error",
        text: `Image upload failed: ${uploadErr?.message || "Please try again."}`,
      });
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("contractor_task_updates")
      .insert([
        {
          task_id: selectedTaskId,
          contractor_id: contractor.id,
          status: nextStatus,
          notes: combinedNotes,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
        },
      ]);

    if (updateError) {
      setMessage({
        type: "error",
        text: "Task updated, but update log could not be saved.",
      });
      setSubmitting(false);
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTaskId
          ? { ...task, status: nextStatus, notes: combinedNotes }
          : task
      )
    );

    setUpdateNotes("");
    setBeforeWorkImage(null);
    setAfterWorkImage(null);
    setMessage({ type: "success", text: "Update stored successfully." });
    setSubmitting(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="portal-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Work Update Form
          </h2>
          <p className="text-sm text-slate-500">
            Update task status and share work progress with the officer.
          </p>
        </div>

        <div className="space-y-5">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Select Task
            <select
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Choose a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {(task.task_ref || task.id).toUpperCase()} — {task.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Current Status
              <input
                value={selectedTask?.status || "—"}
                readOnly
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Update Status
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Work Update Notes
            <textarea
              value={updateNotes}
              onChange={(event) => setUpdateNotes(event.target.value)}
              rows={5}
              placeholder="Provide a concise update for the officer."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Previous Work Image
              <div className="group rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 transition hover:border-blue-200 hover:bg-blue-50/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setBeforeWorkImage(event.target.files?.[0] || null)}
                  className="hidden"
                  id="before-work-image"
                />
                <label
                  htmlFor="before-work-image"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition group-hover:shadow-md"
                >
                  {beforeWorkImage ? beforeWorkImage.name : "Upload Before Photo"}
                </label>
                <p className="mt-3 text-[11px] text-slate-400">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              After Work Image
              <div className="group rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAfterWorkImage(event.target.files?.[0] || null)}
                  className="hidden"
                  id="after-work-image"
                />
                <label
                  htmlFor="after-work-image"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition group-hover:shadow-md"
                >
                  {afterWorkImage ? afterWorkImage.name : "Upload After Photo"}
                </label>
                <p className="mt-3 text-[11px] text-slate-400">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </label>
          </div>
        </div>

        {message ? (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
              message.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting || loading}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Update"}
          </button>
          <span className="text-xs text-slate-500">
            Updates are stored against the selected task.
          </span>
        </div>
      </form>

      <div className="portal-card p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            Task Summary
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {selectedTask?.title || "Select a task to view details"}
          </h3>
          <p className="text-sm text-slate-500">
            {selectedTask
              ? selectedTask.task_ref || selectedTask.id
              : "No task selected"}
          </p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading tasks...</p>
          ) : selectedTask ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Department
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedTask.department}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Ward
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedTask.ward}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Priority
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedTask.priority}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Deadline
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedTask.deadline || "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Task Type
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedTask.complaint_id
                    ? "Complaint-linked"
                    : "Officer-assigned"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Select a task to see department, ward, and priority details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkUpdateForm;
