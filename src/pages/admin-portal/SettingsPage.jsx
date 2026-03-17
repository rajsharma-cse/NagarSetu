const SettingsPage = () => {
  const settings = [
    {
      title: "Profile settings",
      description: "Update officer profile, department, and role information.",
    },
    {
      title: "Notification preferences",
      description: "Choose alerts for critical complaints and escalations.",
    },
    {
      title: "System configuration",
      description: "Configure ward allocation, contractor access, and SLAs.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage officer preferences and system configuration.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {settings.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5"
          >
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            <button
              type="button"
              className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;

