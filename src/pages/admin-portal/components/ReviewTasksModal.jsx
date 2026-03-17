import { supabase } from "../../../lib/supabaseClient";

const ReviewTasksModal = ({
  contractor,
  onClose,
  reviewTasks,
  reviewTaskId,
  setReviewTaskId,
  setReviewUpdates,
  reviewUpdates,
  reviewStatus,
  setReviewStatus,
  setReviewTasks,
  selectedReviewTask,
}) => {
  if (!contractor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              Review Tasks
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {contractor.name}
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
              onClose();
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
                        ? `INR ${Number(
                            selectedReviewTask.budget_allocated
                          ).toLocaleString("en-IN")}`
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
                        Submitted:{" "}
                        {reviewUpdates[0].created_at?.slice(0, 10) || "-"}
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
  );
};

export default ReviewTasksModal;
