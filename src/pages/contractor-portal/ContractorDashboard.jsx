import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock,
  Menu,
  Star,
  Wrench,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useOutletContext } from "react-router-dom";
import MetricCard from "./components/MetricCard";
import NotificationsPanel from "./components/NotificationsPanel";
import PerformanceChart from "./components/PerformanceChart";
import BudgetAllocationChart from "./components/BudgetAllocationChart";

const iconMap = {
  ClipboardList,
  CheckCircle2,
  Wrench: AlertTriangle,
  Star: Clock,
};

const ContractorDashboard = () => {
  const { contractor, loading: contractorLoading } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchTasks = async () => {
      if (!contractor?.id) return;
      const { data } = await supabase
        .from("tasks")
        .select("status,deadline,budget_allocated,task_ref,title")
        .eq("contractor_id", contractor.id);
      if (!mounted) return;
      setTasks(data || []);
    };

    fetchTasks();

    if (contractor?.id) {
      const channel = supabase
        .channel(`tasks-contractor-${contractor.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `contractor_id=eq.${contractor.id}`,
          },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      mounted = false;
    };
  }, [contractor?.id]);

  useEffect(() => {
    let mounted = true;

    const fetchAlerts = async () => {
      if (!contractor?.id) return;
      const { data, error } = await supabase
        .from("contractor_notifications")
        .select("id")
        .eq("contractor_id", contractor.id)
        .eq("type", "warning");
      if (!mounted) return;
      if (!error && (data || []).length) {
        setAlertsCount(data.length);
        return;
      }
      if (contractor?.contractor_id) {
        const { data: fallbackData } = await supabase
          .from("contractor_notifications")
          .select("id")
          .eq("contractor_id", contractor.contractor_id)
          .eq("type", "warning");
        if (!mounted) return;
        setAlertsCount(fallbackData?.length || 0);
      }
    };

    fetchAlerts();

    if (contractor?.id) {
      const channel = supabase
        .channel(`contractor-alerts-${contractor.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contractor_notifications",
            filter: `contractor_id=eq.${contractor.id}`,
          },
          () => {
            fetchAlerts();
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      mounted = false;
    };
  }, [contractor?.id, contractor?.contractor_id]);

  const summary = useMemo(() => {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(now.getDate() + 7);

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const assigned = tasks.filter((t) => t.status === "Assigned").length;

    const deadlinesInWeek = tasks.filter((task) => {
      if (!task.deadline || task.status === "Completed") return false;
      const deadlineDate = new Date(task.deadline);
      return deadlineDate >= now && deadlineDate <= inSevenDays;
    }).length;

    return { total, assigned, completed, alerts: alertsCount, deadlinesInWeek };
  }, [tasks, alertsCount]);

  const metrics = useMemo(
    () => [
      {
        title: "Total Assigned",
        value: summary.total,
        helper: "All tasks",
        icon: "ClipboardList",
        accent: "bg-indigo-500",
      },
      {
        title: "Completed",
        value: summary.completed,
        helper: "Finished tasks",
        icon: "CheckCircle2",
        accent: "bg-emerald-500",
      },
      {
        title: "Alerts",
        value: summary.alerts,
        helper: "Overdue deadlines",
        icon: "Wrench",
        accent: "bg-rose-500",
      },
      {
        title: "Deadlines",
        value: summary.deadlinesInWeek,
        helper: "Due within 7 days",
        icon: "Star",
        accent: "bg-amber-500",
      },
    ],
    [summary]
  );

  if (contractorLoading) {
    return <div className="text-sm text-slate-500">Loading contractor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full space-y-6 px-6 py-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = iconMap[metric.icon] ?? ClipboardList;
          return (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              helper={metric.helper}
              accent={metric.accent}
              icon={Icon}
            />
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <BudgetAllocationChart tasks={tasks} />
        <PerformanceChart />
      </section>

      <NotificationsPanel />
      </div>
    </div>
  );
};

export default ContractorDashboard;
