import { MapPin, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { wardDirectory } from "../../../data/dummyData";

const departmentOptions = [
  "Public Works Department",
  "Sanitation & Waste",
  "Water Supply",
  "Street Lighting",
  "Parks & Horticulture",
];

const AddContractorModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  formError,
  formSuccess,
  onResetFeedback,
}) => {
  const [wardQuery, setWardQuery] = useState("");
  const [showWardList, setShowWardList] = useState(false);
  const wardOptions = useMemo(
    () =>
      wardDirectory.map((ward) => ({
        label: `${ward.ward} - ${ward.name}`,
        value: ward.ward,
        area: ward.name,
      })),
    []
  );
  const filteredWards = useMemo(() => {
    const query = wardQuery.trim().toLowerCase();
    if (!query) return wardOptions;
    return wardOptions.filter(
      (ward) =>
        ward.label.toLowerCase().includes(query) ||
        ward.area.toLowerCase().includes(query)
    );
  }, [wardOptions, wardQuery]);

  const [formData, setFormData] = useState({
    contractorId: "",
    name: "",
    phone: "",
    email: "",
    ward: "",
    wards: "",
    expertise: [],
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpertiseChange = (event) => {
    const { value, checked } = event.target;
    setFormData((prev) => {
      const next = new Set(prev.expertise);
      if (checked) {
        if (next.size >= 2) {
          return prev;
        }
        next.add(value);
      } else {
        next.delete(value);
      }
      return { ...prev, expertise: Array.from(next) };
    });
  };

  useEffect(() => {
    if (open) {
      onResetFeedback?.();
    }
  }, [open, onResetFeedback]);

  const submitForm = async (event) => {
    event.preventDefault();
    await onSubmit(formData, setFormData);
    setWardQuery(formData.ward || "");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Contractor Registry
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              Add Contractor
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Capture contractor details and assign ward responsibility.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submitForm} className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            name="contractorId"
            value={formData.contractorId}
            onChange={handleChange}
            placeholder="Contractor ID (C-ID)"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contractor Name"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="ward"
              value={wardQuery}
              onChange={(event) => {
                const next = event.target.value;
                setWardQuery(next);
                setFormData((prev) => ({ ...prev, ward: next }));
              }}
              onFocus={() => setShowWardList(true)}
              onBlur={() => window.setTimeout(() => setShowWardList(false), 120)}
              placeholder="Search Primary Ward"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-9 text-sm text-slate-900"
            />
            {showWardList ? (
              <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-xl">
                {filteredWards.length ? (
                  filteredWards.map((ward) => (
                    <button
                      key={ward.value}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        const selected = `${ward.area} (${ward.label})`;
                        setWardQuery(selected);
                        setFormData((prev) => ({ ...prev, ward: selected }));
                        setShowWardList(false);
                      }}
                      className="flex w-full items-start rounded-lg px-3 py-2 text-left transition hover:bg-slate-100"
                    >
                      <span className="text-sm font-semibold">{ward.area}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {ward.label}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    No matching wards found.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          <input
            name="wards"
            value={formData.wards}
            onChange={handleChange}
            placeholder="Assigned Wards (comma separated)"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Expertise (select up to 2)
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {departmentOptions.map((dept) => (
                <label
                  key={dept}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    value={dept}
                    checked={formData.expertise.includes(dept)}
                    onChange={handleExpertiseChange}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !formData.expertise.length}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:from-indigo-600 hover:to-blue-700 disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Submit Contractor"}
            </button>
            {formError ? (
              <span className="text-sm text-rose-600">{formError}</span>
            ) : null}
            {formSuccess ? (
              <span className="text-sm text-emerald-600">{formSuccess}</span>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContractorModal;
