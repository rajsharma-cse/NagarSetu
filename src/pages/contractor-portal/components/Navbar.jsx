import { Menu } from "lucide-react";

const getInitials = (name) => {
  if (!name) return "CN";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const Navbar = ({ onOpenSidebar, contractor }) => {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div>
        <button
          type="button"
          onClick={onOpenSidebar}
          className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
          Contractor Portal
        </p>
        <h1 className="text-lg font-semibold text-slate-900">
          Welcome back, {contractor?.name || "Contractor"}
        </h1>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
        {getInitials(contractor?.name)}
      </div>
    </header>
  );
};

export default Navbar;
