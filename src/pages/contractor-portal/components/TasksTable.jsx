import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useOutletContext } from "react-router-dom";

const priorityStyles = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  Low: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const statusStyles = {
  Assigned: "bg-slate-100 text-slate-700 border-slate-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TasksTable = () => {
  const { contractor } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      if (!contractor?.id) return;
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id,task_ref,title,department,ward,priority,deadline,status,complaint_id,notes,task_type"
        )
        .eq("contractor_id", contractor.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (!error) {
        const taskRows = data || [];
        const complaintIds = taskRows
          .map((item) => item.complaint_id)
          .filter(Boolean);
        if (complaintIds.length) {
          const { data: complaintRows } = await supabase
            .from("complaints")
            .select("id,description")
            .in("id", complaintIds);
          const noteMap = (complaintRows || []).reduce((acc, row) => {
            acc[row.id] = row.description;
            return acc;
          }, {});
          taskRows.forEach((task) => {
            if (task.complaint_id && noteMap[task.complaint_id]) {
              task.notes = noteMap[task.complaint_id];
            }
          });
        }
        setTasks(taskRows);
      }
      setLoading(false);
    };

    fetchTasks();

    return () => {
      mounted = false;
    };
  }, [contractor?.id]);

  return (
    <>
      <div id="tasks" className="portal-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Assigned Tasks</h2>
          <p className="text-xs text-slate-500">Priority work orders for your team.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="pb-4 pr-4">Task ID</th>
                <th className="pb-4 pr-4">Title</th>
                <th className="pb-4 pr-4">Location</th>
                <th className="pb-4 pr-4">Priority</th>
                <th className="pb-4 pr-4">Deadline</th>
                <th className="pb-4 pr-4">Status</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-sm text-slate-500">
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length ? (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="py-4 pr-4 font-mono text-slate-900">
                      {task.task_ref || task.id}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-slate-800">
                      {task.title}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-slate-600">{task.ward}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {task.department}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          priorityStyles[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-slate-600">
                        {task.deadline || "N/A"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {task.complaint_id ? "Complaint linked" : "Officer task"}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[task.status]
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTask(task)}
                        className="rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-sm text-slate-500">
                    No tasks assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeTask ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Task Details
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {activeTask.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTask.task_ref || activeTask.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Department
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {activeTask.department}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Ward
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {activeTask.ward}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Priority
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {activeTask.priority}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Deadline
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {activeTask.deadline || "N/A"}
                </p>
              </div>
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Notes
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {activeTask.notes || "No additional notes."}
                </p>
              </div>
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Task Type
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {activeTask.complaint_id ? "Complaint-linked" : "Officer-assigned"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TasksTable;