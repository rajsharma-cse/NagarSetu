import { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { adminAreaDistribution, adminPerformanceMetrics } from "../../data/dummyData";
import { chartDefaults } from "./chartConfig";
import ChartCard from "./components/ChartCard";
import { supabase } from "../../lib/supabaseClient";

const AnalyticsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [rejectedComplaints, setRejectedComplaints] = useState([]);
  const [trendView, setTrendView] = useState("day");

  useEffect(() => {
    let mounted = true;

    const fetchComplaints = async () => {
      const [activeResult, resolvedResult, rejectedResult] = await Promise.all([
        supabase
          .from("complaints")
          .select("department,status,created_at,ward,removed")
          .or("removed.is.null,removed.eq.false"),
        supabase
          .from("resolved_complaints")
          .select("department,status,created_at,closed_at,ward"),
        supabase
          .from("rejected_complaints")
          .select("department,status,created_at,closed_at,ward"),
      ]);

      if (!mounted) {
        return;
      }

      if (activeResult.error || resolvedResult.error || rejectedResult.error) {
        return;
      }

      setComplaints(activeResult.data || []);
      setResolvedComplaints(resolvedResult.data || []);
      setRejectedComplaints(rejectedResult.data || []);
    };

    fetchComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  const trendData = useMemo(() => {
    const range = trendView === "sixHour" ? 4 : 7;
    const anchors = Array.from({ length: range }, (_, idx) => {
      const date = new Date();
      if (trendView === "sixHour") {
        date.setHours(date.getHours() - (range - 1 - idx) * 6);
        date.setMinutes(0, 0, 0);
      } else {
        date.setDate(date.getDate() - (range - 1 - idx));
        date.setHours(0, 0, 0, 0);
      }
      return date;
    });

    const labels =
      trendView === "sixHour"
        ? anchors.map((date) => {
            const start = date.getHours().toString().padStart(2, "0");
            const end = ((date.getHours() + 6) % 24).toString().padStart(2, "0");
            return `${start}:00-${end}:00`;
          })
        : anchors.map((date) =>
            date.toLocaleDateString("en-US", { weekday: "short" })
          );

    const totalCounts = Array(range).fill(0);
    const resolvedCounts = Array(range).fill(0);
    const pendingCounts = Array(range).fill(0);

    const matchBucket = (dateValue, anchorDate) => {
      if (!dateValue) return false;
      const diffMs = dateValue - anchorDate;
      if (trendView === "sixHour") {
        return diffMs >= 0 && diffMs < 6 * 60 * 60 * 1000;
      }
      return diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000;
    };

    complaints.forEach((item) => {
      if (!item.created_at) return;
      const created = new Date(item.created_at);
      anchors.forEach((anchor, index) => {
        if (matchBucket(created, anchor)) {
          totalCounts[index] += 1;
          if (item.status === "Pending" || item.status === "In Progress") {
            pendingCounts[index] += 1;
          }
        }
      });
    });

    resolvedComplaints.forEach((item) => {
      const dateValue = new Date(item.closed_at || item.created_at);
      anchors.forEach((anchor, index) => {
        if (matchBucket(dateValue, anchor)) {
          totalCounts[index] += 1;
          resolvedCounts[index] += 1;
        }
      });
    });

    rejectedComplaints.forEach((item) => {
      const dateValue = new Date(item.closed_at || item.created_at);
      anchors.forEach((anchor, index) => {
        if (matchBucket(dateValue, anchor)) {
          totalCounts[index] += 1;
        }
      });
    });

    return {
      labels,
      datasets: [
        {
          label: "Total",
          data: totalCounts,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.15)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Resolved",
          data: resolvedCounts,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Pending",
          data: pendingCounts,
          borderColor: "#f97316",
          backgroundColor: "rgba(249,115,22,0.12)",
          tension: 0.4,
          fill: false,
        },
      ],
    };
  }, [complaints, resolvedComplaints, rejectedComplaints, trendView]);

  const categoryData = useMemo(() => {
    const combined = [
      ...complaints,
      ...resolvedComplaints,
      ...rejectedComplaints,
    ];
    const counts = combined.reduce((acc, item) => {
      const key = item.department || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const palette = [
      "#2563eb",
      "#0ea5e9",
      "#22c55e",
      "#f97316",
      "#facc15",
      "#94a3b8",
    ];

    return {
      labels: labels.length ? labels : ["No data"],
      datasets: [
        {
          data: values.length ? values : [1],
          backgroundColor: labels.length
            ? labels.map((_, idx) => palette[idx % palette.length])
            : ["#94a3b8"],
          borderWidth: 0,
        },
      ],
    };
  }, [complaints, resolvedComplaints, rejectedComplaints]);

  const volumeData = useMemo(() => {
    const range = trendView === "sixHour" ? 4 : 7;
    const anchors = Array.from({ length: range }, (_, idx) => {
      const date = new Date();
      if (trendView === "sixHour") {
        date.setHours(date.getHours() - (range - 1 - idx) * 6);
        date.setMinutes(0, 0, 0);
      } else {
        date.setDate(date.getDate() - (range - 1 - idx));
        date.setHours(0, 0, 0, 0);
      }
      return date;
    });
    const labels =
      trendView === "sixHour"
        ? anchors.map((date) => {
            const start = date.getHours().toString().padStart(2, "0");
            const end = ((date.getHours() + 6) % 24).toString().padStart(2, "0");
            return `${start}:00-${end}:00`;
          })
        : anchors.map((date) =>
            date.toLocaleDateString("en-US", { weekday: "short" })
          );

    const totalCounts = Array(range).fill(0);
    const resolvedCounts = Array(range).fill(0);
    const pendingCounts = Array(range).fill(0);

    const matchBucket = (dateValue, anchorDate) => {
      if (!dateValue) return false;
      const diffMs = dateValue - anchorDate;
      if (trendView === "sixHour") {
        return diffMs >= 0 && diffMs < 6 * 60 * 60 * 1000;
      }
      return diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000;
    };

    complaints.forEach((item) => {
      if (!item.created_at) return;
      const created = new Date(item.created_at);
      anchors.forEach((anchor, index) => {
        if (matchBucket(created, anchor)) {
          totalCounts[index] += 1;
          if (item.status === "Pending" || item.status === "In Progress") {
            pendingCounts[index] += 1;
          }
        }
      });
    });

    resolvedComplaints.forEach((item) => {
      const dateValue = new Date(item.closed_at || item.created_at);
      anchors.forEach((anchor, index) => {
        if (matchBucket(dateValue, anchor)) {
          totalCounts[index] += 1;
          resolvedCounts[index] += 1;
        }
      });
    });

    rejectedComplaints.forEach((item) => {
      const dateValue = new Date(item.closed_at || item.created_at);
      anchors.forEach((anchor, index) => {
        if (matchBucket(dateValue, anchor)) {
          totalCounts[index] += 1;
        }
      });
    });

    return {
      labels,
      datasets: [
        {
          label: "Total",
          data: totalCounts,
          backgroundColor: "rgba(37,99,235,0.6)",
        },
        {
          label: "Resolved",
          data: resolvedCounts,
          backgroundColor: "rgba(34,197,94,0.6)",
        },
        {
          label: "Pending",
          data: pendingCounts,
          backgroundColor: "rgba(249,115,22,0.6)",
        },
      ],
    };
  }, [complaints, resolvedComplaints, rejectedComplaints, trendView]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">
          Full analytics for complaint tracking and city performance.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Complaint Trends"
            subtitle={trendView === "sixHour" ? "6-hour resolution trends (last 24h)" : "Daily resolution trends"}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                { id: "day", label: "Day Wise" },
                { id: "sixHour", label: "6-Hour Wise" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTrendView(option.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    trendView === option.id
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Line data={trendData} options={chartDefaults} />
          </ChartCard>
        </div>
        <ChartCard title="Complaints by Category">
          <Pie data={categoryData} options={chartDefaults} />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Complaint Volume by Month">
          <Bar data={volumeData} options={chartDefaults} />
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold text-slate-900">Performance Metrics</p>
          <div className="mt-4 space-y-3">
            {adminPerformanceMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm text-slate-500">{metric.label}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold text-slate-900">Area Distribution</p>
          <div className="mt-4 space-y-4">
            {adminAreaDistribution.map((area) => (
              <div key={area.label}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{area.label}</span>
                  <span>{area.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${Math.min(area.value * 1.8, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
