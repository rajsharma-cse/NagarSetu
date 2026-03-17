const ProfileModal = ({ contractor, onClose }) => {
  if (!contractor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Contractor Profile
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {contractor.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {contractor.contractor_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Phone
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {contractor.phone || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {contractor.email || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Primary Ward
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {contractor.ward || "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Assigned Wards
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {contractor.wards || "Not set"}
            </p>
          </div>
          <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Expertise
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {contractor.expertise || "Not specified"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
