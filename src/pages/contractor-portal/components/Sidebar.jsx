import { ClipboardList, Hammer, LayoutDashboard, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/portal/contractor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/contractor/tasks", label: "Assigned Tasks", icon: ClipboardList },
  { to: "/portal/contractor/updates", label: "Update Work", icon: Hammer },
];

const Sidebar = ({ open, onClose, onLogout }) => {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 -translate-x-full bg-white text-slate-700 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white">
                N
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-blue-600">
                  NagarSetu
                </p>
                <p className="text-sm font-semibold text-slate-900">Contractor</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 px-4 py-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
