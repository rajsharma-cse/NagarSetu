import { Bell, Menu, Search } from "lucide-react";

const Navbar = ({ onOpenSidebar }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
            Officer Portal
          </p>
          <p className="text-lg font-semibold text-slate-900">NagarSetu Admin</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden items-center md:flex">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search contractors, complaints..."
            className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
            5
          </span>
        </button>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          SM
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
