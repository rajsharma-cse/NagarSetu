import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { chartDefaults } from "../../admin-portal/chartConfig";

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const BudgetAllocationChart = ({ tasks }) => {
  const totalAllocated = tasks.reduce(
    (sum, task) => sum + Number(task.budget_allocated || 0),
    0
  );

  const chartData = useMemo(() => {
    const taskLabels = tasks.map(
      (task) => task.task_ref || task.title || "Task"
    );
    const taskBudgets = tasks.map((task) =>
      Number(task.budget_allocated || 0)
    );
    return {
      labels: ["Contractor Budget Total", ...taskLabels],
      datasets: [
        {
          label: "Budget Allocation (INR)",
          data: [totalAllocated, ...taskBudgets],
          backgroundColor: [
            "#2563eb",
            ...taskBudgets.map((_, index) =>
              ["#22c55e", "#f97316", "#a855f7", "#14b8a6", "#ef4444"][
                index % 5
              ]
            ),
          ],
          borderRadius: 12,
          maxBarThickness: 48,
        },
      ],
    };
  }, [tasks]);

  return (
    <div className="portal-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Budget Allocation Overview
          </h2>
          <p className="text-sm text-slate-500">
            Total budget allocated to this contractor vs. each task
          </p>
        </div>
        <div className="rounded-full bg-indigo-100 px-4 py-1 text-xs font-medium text-indigo-700">
          Allocated: {formatInr(totalAllocated)}
        </div>
      </div>
      <div className="relative h-64">
        <Bar
          data={chartData}
          options={{
            ...chartDefaults,
            animation: {
              duration: 1200,
              easing: "easeOutQuart",
            },
            scales: {
              x: {
                ticks: { color: "#64748b", font: { size: 10 } },
                grid: { display: false },
              },
              y: {
                ticks: { color: "#64748b", font: { size: 10 } },
                grid: { color: "rgba(148,163,184,0.2)" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default BudgetAllocationChart;
