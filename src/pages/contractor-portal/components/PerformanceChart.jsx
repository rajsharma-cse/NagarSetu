import { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { supabase } from "../../../lib/supabaseClient";
import { useOutletContext } from "react-router-dom";
import { chartDefaults } from "../../admin-portal/chartConfig";

const PerformanceChart = () => {
  const { contractor } = useOutletContext();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      if (!contractor?.id) return;
      const { data } = await supabase
        .from("tasks")
        .select("department")
        .eq("contractor_id", contractor.id);
      if (!mounted) return;
      setRows(data || []);
    };
    fetchTasks();
    return () => {
      mounted = false;
    };
  }, [contractor?.id]);

  const chartData = useMemo(() => {
    const counts = rows.reduce((acc, row) => {
      const key = row.department || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    return {
      labels,
      datasets: [
        {
          label: "Tasks by Department",
          data: values,
          backgroundColor: [
            "#2563eb",
            "#22c55e",
            "#f97316",
            "#a855f7",
            "#14b8a6",
            "#ef4444",
            "#facc15",
            "#38bdf8",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [rows]);

  return (
    <div className="portal-card p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Department-wise Tasks
          </h2>
          <p className="text-sm text-slate-500">
            Active tasks grouped by department
          </p>
        </div>
      </div>
      <div className="relative h-64">
        <Pie
          data={chartData}
          options={{
            ...chartDefaults,
            plugins: {
              ...chartDefaults.plugins,
              legend: {
                ...chartDefaults.plugins.legend,
                position: "bottom",
              },
            },
            animation: {
              duration: 1200,
              easing: "easeOutQuart",
            },
          }}
        />
      </div>
    </div>
  );
};

export default PerformanceChart;
