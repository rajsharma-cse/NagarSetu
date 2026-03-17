import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Droplets,
  FileText,
  Filter,
  Home,
  MapPin,
  Menu,
  Plus,
  Search,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  citizenBills,
  citizenComplaints,
  citizenPaymentHistory,
  citizenPortalStats,
  citizenRecentActivities,
  complaintCategories,
  complaintPriorityOptions,
} from "../data/dummyData";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "file-complaint", label: "File Complaint", icon: Plus },
  { id: "track-complaints", label: "Track Complaint", icon: FileText },
  { id: "bills", label: "Bills", icon: CreditCard },
];

const getStatusClasses = (status) => {
  switch (status) {
    case "Resolved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "In Progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Pending":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "High":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "Medium":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Low":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const shellCardClass =
  "rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.22)]";

const CitizenPortalPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: "",
    title: "",
    location: "",
    description: "",
    priority: "",
  });

  const complaintPreview = useMemo(() => citizenComplaints.slice(0, 2), []);
  const searchComplaints = useMemo(() => citizenComplaints, []);

  const handleComplaintChange = (event) => {
    const { name, value } = event.target;
    setComplaintForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const renderMenuContent = () => (
    <>
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
          NagarSetu
        </p>
        <h1 className="mt-2 text-xl font-bold text-white">Citizen Portal</h1>
        <p className="mt-1 text-sm text-slate-400">Prayagraj Nagar Nigam services</p>
      </div>

      <nav className="space-y-2 px-4 py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.6)]"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-white/10"
        >
          Back to home
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_28%),linear-gradient(to_bottom,rgba(248,250,252,0.98),rgba(241,245,249,1))] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 20 }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Menu</p>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderMenuContent()}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-h-[calc(100vh-2rem)]">
          <header className="sticky top-4 z-30 rounded-[1.5rem] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.22)] backdrop-blur sm:px-5 lg:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3 sm:items-center">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                    Citizen Workspace
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">Welcome back, Rajesh Kumar</h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-blue-600 text-white shadow-[0_16px_35px_-20px_rgba(37,99,235,0.6)]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    3
                  </span>
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    RK
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">Rajesh Kumar</p>
                    <p className="text-xs text-slate-500">Citizen ID: CTZ-2026-5678</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-5 space-y-5">
            {activeTab === "dashboard" && (
              <>
                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#22d3ee_100%)] p-6 text-white shadow-[0_32px_80px_-34px_rgba(37,99,235,0.55)]"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
                          Civic Command Center
                        </p>
                        <h3 className="mt-2 text-3xl font-bold leading-tight">
                          Everything important, visible at one glance
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-blue-50 sm:text-base">
                          Track complaints, review billing, and act on municipal services without leaving this dashboard.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                        {citizenPortalStats.map((item) => (
                          <div key={item.label} className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                              {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                            <p className="mt-1 text-xs text-blue-100/90">{item.helper}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <div className={`${shellCardClass} p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Live Activity</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-950">Recent account updates</h3>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Today</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {citizenRecentActivities.map((activity) => (
                        <div key={activity.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${activity.tone}`} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <div className={`${shellCardClass} p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Action Deck</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-950">Quick citizen actions</h3>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("file-complaint")}
                        className="rounded-[1.5rem] bg-slate-950 px-5 py-5 text-left text-white transition hover:-translate-y-1"
                      >
                        <Plus className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 text-base font-semibold">Raise New Complaint</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Report roads, sanitation, drainage, or utility issues.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("bills")}
                        className="rounded-[1.5rem] bg-blue-600 px-5 py-5 text-left text-white transition hover:-translate-y-1"
                      >
                        <CreditCard className="h-5 w-5 text-blue-100" />
                        <p className="mt-3 text-base font-semibold">Bills and Payments</p>
                        <p className="mt-2 text-sm leading-6 text-blue-50">
                          View current dues and track completed transactions.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className={`${shellCardClass} p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Complaint Snapshot</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-950">Latest tracked issues</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("track-complaints")}
                        className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                      >
                        View all
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {complaintPreview.map((complaint) => (
                        <div key={complaint.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{complaint.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{complaint.id} • {complaint.location}</p>
                            </div>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span className={`inline-flex rounded-full border px-3 py-1 font-semibold ${getPriorityClasses(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                            <span>{complaint.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "file-complaint" && (
              <section className={`${shellCardClass} p-6`}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">File Complaint</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">Report a civic issue in your locality</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                  Submit the issue category, exact location, and supporting details so the municipal team can route it correctly.
                </p>

                <form className="mt-6 grid gap-5 lg:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Complaint Category</span>
                    <select
                      name="category"
                      value={complaintForm.category}
                      onChange={handleComplaintChange}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Select category</option>
                      {complaintCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Priority Level</span>
                    <select
                      name="priority"
                      value={complaintForm.priority}
                      onChange={handleComplaintChange}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Select priority</option>
                      {complaintPriorityOptions.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2 lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Complaint Title</span>
                    <input
                      type="text"
                      name="title"
                      value={complaintForm.title}
                      onChange={handleComplaintChange}
                      placeholder="Brief description of the issue"
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <label className="flex flex-col gap-2 lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Location</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="location"
                        value={complaintForm.location}
                        onChange={handleComplaintChange}
                        placeholder="Enter exact location or landmark"
                        className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
                    </div>
                  </label>

                  <label className="flex flex-col gap-2 lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Detailed Description</span>
                    <textarea
                      name="description"
                      value={complaintForm.description}
                      onChange={handleComplaintChange}
                      rows="5"
                      placeholder="Provide detailed information about the issue"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <div className="lg:col-span-2 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-700">Upload Photos (Optional)</p>
                    <p className="mt-2 text-sm text-slate-500">Drag and drop photos or click to browse supporting evidence.</p>
                    <button
                      type="button"
                      className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      Choose Files
                    </button>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Submit Complaint
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === "track-complaints" && (
              <section className={`${shellCardClass} p-6`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Track Complaints</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-950">Monitor the progress of all filed complaints</h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-[240px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search complaints"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {searchComplaints.map((complaint) => (
                    <div key={complaint.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-950">{complaint.title}</h4>
                          <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {complaint.location}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClasses(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-mono text-slate-700">{complaint.id}</span>
                        <span>Filed on: {complaint.date}</span>
                      </div>

                      <div className="mt-5 space-y-4 border-l-2 border-slate-200 pl-5">
                        {complaint.timeline.map((step, index) => (
                          <div key={`${complaint.id}-${step.label}`} className="relative">
                            <span className={`absolute -left-[1.7rem] top-1.5 h-3 w-3 rounded-full ${index === complaint.timeline.length - 1 ? "bg-blue-600" : "bg-emerald-500"}`} />
                            <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                            <p className="mt-1 text-xs text-slate-500">{step.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "bills" && (
              <>
                <section className="grid gap-4 xl:grid-cols-3">
                  {citizenBills.map((bill) => {
                    const BillIcon = bill.service === "Water Bill" ? Droplets : bill.service === "Electricity Bill" ? Zap : CreditCard;

                    return (
                      <div key={bill.service} className={`${shellCardClass} p-6`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-500">{bill.service}</p>
                            <p className="mt-3 text-3xl font-bold text-slate-950">{bill.amount}</p>
                          </div>
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bill.accent} text-white`}>
                            <BillIcon className="h-5 w-5" />
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Due Date: {bill.dueDate}</p>
                        <button
                          type="button"
                          className="mt-5 w-full rounded-full bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Pay Now
                        </button>
                      </div>
                    );
                  })}
                </section>

                <section className={`${shellCardClass} p-6`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Payment History</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">Review past transactions</h3>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                        <tr>
                          <th className="pb-3 pr-4">Transaction ID</th>
                          <th className="pb-3 pr-4">Service</th>
                          <th className="pb-3 pr-4">Amount</th>
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizenPaymentHistory.map((payment) => (
                          <tr key={payment.id} className="border-t border-slate-100">
                            <td className="py-4 pr-4 font-mono text-slate-700">{payment.id}</td>
                            <td className="py-4 pr-4 font-semibold text-slate-900">{payment.service}</td>
                            <td className="py-4 pr-4 text-slate-700">{payment.amount}</td>
                            <td className="py-4 pr-4 text-slate-500">{payment.date}</td>
                            <td className="py-4">
                              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CitizenPortalPage;
