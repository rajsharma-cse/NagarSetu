import {
  FileText,
  LogOut,
  LayoutDashboard,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/portal/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/admin/complaints", label: "Manage Complaints", icon: FileText },
  { to: "/portal/admin/contractors", label: "Contractors", icon: Users },
  { to: "/portal/admin/settings", label: "Settings", icon: Settings },
  { to: "/portal/admin/profile", label: "Profile", icon: User },
];

const Sidebar = ({ open, onClose, onLogout }) => {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 -translate-x-full bg-[#1e293b] text-slate-100 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                N
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
                  NagarSetu
                </p>
                <p className="text-lg font-semibold">NagarSetu</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600/20 text-blue-100"
                        : "text-slate-200 hover:bg-white/10"
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-4 py-5">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-4.5 w-4.5" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm"
          aria-label="Close sidebar"
        />
      ) : null}
    </>
  );
};

export default Sidebar;
