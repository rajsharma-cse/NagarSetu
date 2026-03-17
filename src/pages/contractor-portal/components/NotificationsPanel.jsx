import { AlertOctagon, CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useOutletContext } from "react-router-dom";

const typeStyles = {
  warning: {
    icon: ShieldAlert,
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  status: {
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  blocked: {
    icon: AlertOctagon,
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

const NotificationsPanel = () => {
  const { contractor } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      if (!contractor?.id) return;
      const { data, error } = await supabase
        .from("contractor_notifications")
        .select("id,title,message,type,created_at")
        .eq("contractor_id", contractor.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (!error && (data || []).length) {
        setNotifications(data || []);
        setLoading(false);
        return;
      }

      if (contractor?.contractor_id) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("contractor_notifications")
          .select("id,title,message,type,created_at")
          .eq("contractor_id", contractor.contractor_id)
          .order("created_at", { ascending: false });
        if (!mounted) return;
        if (!fallbackError) {
          setNotifications(fallbackData || []);
        }
      }
      setLoading(false);
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [contractor?.id]);

  return (
    <div className="portal-card p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Admin Alerts</h2>
          <p className="text-sm text-slate-500">
            Warnings, blocks, and status updates from the municipal admin team.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length ? (
          notifications.map((notice) => {
            const style = typeStyles[notice.type] ?? typeStyles.status;
            const Icon = style.icon;
            return (
              <div
                key={notice.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {notice.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {notice.message}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
                  >
                    {notice.type}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{notice.created_at?.slice(0, 10) || "—"}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
            <AlertOctagon className="h-8 w-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-600">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Alerts from the municipal admin team will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
