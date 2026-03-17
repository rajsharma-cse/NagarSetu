import { supabase } from "../../../lib/supabaseClient";

const WarningModal = ({
  contractor,
  onClose,
  warningTasks,
  warningTaskId,
  setWarningTaskId,
  warningReason,
  setWarningReason,
  warningStatus,
  setWarningStatus,
  activeOfficer,
}) => {
  if (!contractor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
              Send Warning
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {contractor.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Review tasks assigned to this contractor before issuing a warning.
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
                    <p className="font-semibold text-slate-800">{task.title}</p>
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
              const officerName =
                activeOfficer?.full_name || "Municipal Officer";
              const officerDesignation =
                activeOfficer?.designation || "Officer";
              const title = `Warning: ${warningReason}`;
              const message = `Officer ${officerName} (${officerDesignation}) warns you about task ${
                task?.task_ref || task?.id
              } for: ${warningReason}.`;

              const { error } = await supabase
                .from("contractor_notifications")
                .insert({
                  contractor_id: contractor.id,
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
            onClick={onClose}
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
  );
};

export default WarningModal;
