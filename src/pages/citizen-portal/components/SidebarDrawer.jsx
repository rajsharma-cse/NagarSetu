import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  FileText,
  Home,
  LogOut,
  PlusCircle,
  UserCircle2,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/portal/citizen/dashboard", label: "Dashboard", icon: Home },
  { to: "/portal/citizen/file-complaint", label: "File Complaint", icon: PlusCircle },
  { to: "/portal/citizen/track-complaints", label: "Track Complaint", icon: FileText },
  { to: "/portal/citizen/bills", label: "Bills", icon: CreditCard },
  { to: "/portal/citizen/profile", label: "Profile", icon: UserCircle2 },
];

const SidebarDrawer = ({ open, onClose, onLogout }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[19.5rem] flex-col border-r border-white/10 bg-[#020817] shadow-2xl"
          >
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-blue-600/15 blur-3xl" />
                <div className="absolute right-[-6rem] bottom-[-6rem] h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
              </div>
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                    NagarSetu
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Citizen Portal</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Prayagraj Nagar Nigam services
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-4 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)]"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 transition ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <LogOut className="h-4.5 w-4.5" />
                Log out
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default SidebarDrawer;

