import {
  BarChart3,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import { adminAreaDistribution, adminPerformanceMetrics } from "../../data/dummyData";
import { chartDefaults } from "./chartConfig";
import ChartCard from "./components/ChartCard";
import MetricCard from "./components/MetricCard";
import { supabase } from "../../lib/supabaseClient";

const iconMap = {
  LayoutDashboard,
  FileText,
  Users,
  CheckCircle2,
  BarChart3,
};

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [rejectedComplaints, setRejectedComplaints] = useState([]);
  const [trendView, setTrendView] = useState("day");
  const [dashboardMetrics, setDashboardMetrics] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [adminName, setAdminName] = useState("");

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

      const combinedError =
        activeResult.error || resolvedResult.error || rejectedResult.error;

      if (combinedError) {
        setLoadingComplaints(false);
        return;
      }

      const activeList = activeResult.data || [];
      const resolvedList = resolvedResult.data || [];
      const rejectedList = rejectedResult.data || [];
      setComplaints(activeList);
      setResolvedComplaints(resolvedList);
      setRejectedComplaints(rejectedList);

      const now = new Date();
      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);
      const startYesterday = new Date(startToday);
      startYesterday.setDate(startYesterday.getDate() - 1);
      const endYesterday = new Date(startToday);

      const totalToday = activeList.filter(
        (item) => item.created_at && new Date(item.created_at) >= startToday
      ).length;
      const totalYesterday = activeList.filter((item) => {
        if (!item.created_at) return false;
        const created = new Date(item.created_at);
        return created >= startYesterday && created < endYesterday;
      }).length;

      const deltaPercent =
        totalYesterday === 0
          ? totalToday > 0
            ? 100
            : 0
          : Math.round(((totalToday - totalYesterday) / totalYesterday) * 100);
      const deltaLabel =
        totalYesterday === 0 && totalToday === 0
          ? "No change from yesterday"
          : `${deltaPercent >= 0 ? "+" : ""}${deltaPercent}% from yesterday`;

      const pendingCount = activeList.filter(
        (item) => item.status === "Pending" || item.status === "In Progress"
      ).length;

      const rejectedCount = rejectedList.length;
      const resolvedCount = resolvedList.length;

      setDashboardMetrics([
        {
          title: "Total Complaints",
          value: activeList.length + resolvedCount + rejectedCount,
          delta: deltaLabel,
          helper: "Overall volume",
          accent: "bg-blue-600",
          icon: "LayoutDashboard",
        },
        {
          title: "Pending",
          value: pendingCount,
          delta: "Awaiting action",
          helper: "Active workload",
          accent: "bg-orange-500",
          icon: "FileText",
        },
        {
          title: "Rejected",
          value: rejectedCount,
          delta: "Needs review",
          helper: "Closed as invalid",
          accent: "bg-rose-500",
          icon: "Users",
        },
        {
          title: "Resolved",
          value: resolvedCount,
          delta: "Completed",
          helper: "Closed successfully",
          accent: "bg-emerald-500",
          icon: "CheckCircle2",
        },
      ]);
      setLoadingComplaints(false);
    };

    fetchComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      const sessionUser = sessionData?.session?.user;
      const email = sessionUser?.email || "";
      const phoneDigits = (sessionUser?.phone || "").replace(/\D/g, "");
      const storedAdminId =
        typeof window !== "undefined" ? sessionStorage.getItem("admin_id") : "";

      let profile = null;
      if (userId) {
        const { data } = await supabase
          .from("admin_officers")
          .select("full_name")
          .eq("auth_user_id", userId)
          .maybeSingle();
        profile = data || profile;
      }
      if (!profile && storedAdminId) {
        const { data } = await supabase
          .from("admin_officers")
          .select("full_name")
          .ilike("admin_id", storedAdminId)
          .maybeSingle();
        profile = data || profile;
      }
      if (!profile && email) {
        const { data } = await supabase
          .from("admin_officers")
          .select("full_name")
          .ilike("email", email)
          .maybeSingle();
        profile = data || profile;
      }
      if (!profile && phoneDigits) {
        const { data } = await supabase
          .from("admin_officers")
          .select("full_name")
          .ilike("mobile_number", `%${phoneDigits}`)
          .maybeSingle();
        profile = data || profile;
      }

      if (mounted) {
        setAdminName(profile?.full_name || "");
      }
    };

    fetchAdmin();

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

  const departmentData = useMemo(() => {
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
    const palette = ["#2563eb", "#0ea5e9", "#22c55e", "#f97316", "#facc15", "#94a3b8"];

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
        <h1 className="text-2xl font-bold text-slate-900">Officer Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back{adminName ? `, ${adminName}` : ""}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(dashboardMetrics.length ? dashboardMetrics : []).map((metric) => {
          const Icon = iconMap[metric.icon] ?? LayoutDashboard;
          return (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              delta={metric.delta}
              helper={metric.helper}
              accent={metric.accent}
              icon={Icon}
            />
          );
        })}
      </section>

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
        <ChartCard title="Complaints by Department">
          <Pie data={departmentData} options={chartDefaults} />
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
          <p className="text-sm font-semibold text-slate-900">Sector Distribution</p>
          <div className="mt-4 space-y-4">
            {(() => {
              const sectorCounts = complaints.reduce((acc, item) => {
                if (!item.ward) {
                  return acc;
                }
                const wardName = item.ward.split("(")[0].trim();
                const key = wardName || item.ward;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {});

              const topSectors = Object.entries(sectorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

              if (!topSectors.length) {
                return (
                  <p className="text-sm text-slate-500">
                    No sector data available.
                  </p>
                );
              }

              const maxValue = topSectors[0][1] || 1;

              return topSectors.map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.min((value / maxValue) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
