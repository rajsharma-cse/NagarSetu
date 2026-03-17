import { motion } from "framer-motion";
import { ArrowLeft, Bell, Menu, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

const iconButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)] transition hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500/20";

const PortalNavbar = ({ onOpenMenu, showBack, onBack, title, subtitle }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      if (!notificationsOpen) {
        return;
      }
      setLoadingNotifications(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        if (mounted) {
          setNotifications([]);
          setLoadingNotifications(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id,title,message,created_at,is_read")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!mounted) {
        return;
      }

      if (error) {
        setNotifications([]);
      } else {
        setNotifications(data || []);
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [notificationsOpen]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  return (
    <div className="sticky top-0 z-50">
      <div className="relative overflow-visible border-b border-white/10 bg-[#020817]/70 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute right-[-6rem] top-[-5rem] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onOpenMenu} className={iconButtonClass}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="leading-tight">
              <p className="font-brand text-sm font-extrabold tracking-tight text-white">
                NagarSetu
              </p>
              <p className="text-[11px] font-medium text-slate-400">Citizen Portal</p>
            </div>
          </div>

          <div className="min-w-0 flex-1 px-2">
            <div className="mx-auto flex max-w-xl items-center justify-center gap-2">
              {showBack ? (
                <motion.button
                  type="button"
                  onClick={onBack}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10 sm:inline-flex"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </motion.button>
              ) : null}

              <div className="min-w-0 text-center">
                <p className="truncate text-sm font-semibold text-white">{title}</p>
                {subtitle ? (
                  <p className="truncate text-[11px] font-medium text-slate-400">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              className={iconButtonClass}
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((prev) => !prev)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0b132b] shadow-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Notifications
                  </p>
                </div>
                <div className="max-h-72 overflow-auto p-3">
                  {loadingNotifications ? (
                    <p className="text-xs text-slate-400">Loading...</p>
                  ) : notifications.length ? (
                    notifications.map((note) => (
                      <div
                        key={note.id}
                        className="mb-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
                      >
                        <p className="font-semibold text-white">{note.title}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {note.message}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {note.created_at?.slice(0, 10)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No notifications yet.</p>
                  )}
                </div>
              </div>
            ) : null}
            <Link to="/portal/citizen/profile" className={iconButtonClass} aria-label="Profile">
              <UserCircle2 className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalNavbar;
