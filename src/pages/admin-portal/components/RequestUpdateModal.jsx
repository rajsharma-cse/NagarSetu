import { supabase } from "../../../lib/supabaseClient";

const RequestUpdateModal = ({
  contractor,
  onClose,
  requestTasks,
  requestTaskId,
  setRequestTaskId,
  requestStatus,
  setRequestStatus,
  activeOfficer,
}) => {
  if (!contractor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Request Update
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {contractor.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select a task and send an update request to the contractor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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
                    <p className="font-semibold text-slate-800">{task.title}</p>
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
                  contractor_id: contractor.id,
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
            onClick={onClose}
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
  );
};

export default RequestUpdateModal;
