import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ImagePlus, MapPin, Send } from "lucide-react";
import { wardDirectory } from "../../data/dummyData";
import { supabase } from "../../lib/supabaseClient";

const shellCard =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)]";

const inputClass =
  "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/15";

const FileComplaintPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [wardQuery, setWardQuery] = useState("");
  const [showWardList, setShowWardList] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const fileInputRef = useRef(null);
  const submitInFlightRef = useRef(false);
  const departments = useMemo(
    () => [
      "Public Works Department",
      "Sanitation & Waste",
      "Water Supply",
      "Street Lighting",
      "Parks & Horticulture",
    ],
    []
  );
  const categories = useMemo(() => ["Personal", "Social"], []);
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
    if (!query) {
      return wardOptions;
    }
    return wardOptions.filter(
      (ward) =>
        ward.label.toLowerCase().includes(query) ||
        ward.area.toLowerCase().includes(query)
    );
  }, [wardOptions, wardQuery]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || submitInFlightRef.current) {
      return;
    }
    setSubmitError("");
    setSubmitSuccess("");

    if (!selectedCategory || !selectedDepartment || !selectedWard || !description.trim()) {
      setSubmitError("Please complete category, department, ward, and description.");
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        setSubmitError("Please log in again to submit a complaint.");
        return;
      }

      const complaintRef = `CPL-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      let priorityScore = null;
      let priorityLevel = null;

      try {
        const aiResponse = await fetch("http://localhost:8005/predict-priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: description.trim(),
            department: selectedDepartment,
            has_evidence: Boolean(fileInputRef.current?.files?.length),
            location: selectedWard,
          }),
        });
        if (aiResponse.ok) {
          const aiPayload = await aiResponse.json();
          priorityScore = aiPayload.priority_score ?? null;
          priorityLevel = aiPayload.priority_level ?? null;
        }
      } catch (aiError) {
        // AI service is optional; fallback to default priority
      }

      const { data: complaint, error } = await supabase
        .from("complaints")
        .insert({
          citizen_id: userId,
          category: selectedCategory,
          department: selectedDepartment,
          ward: selectedWard,
          description: description.trim(),
          status: "Pending",
          complaint_ref: complaintRef,
          is_anonymous: isAnonymous,
          priority: priorityLevel || "Medium",
          priority_score: priorityScore,
        })
        .select("id,complaint_ref")
        .single();

      if (error) {
        setSubmitError(error.message);
        return;
      }

      const files = fileInputRef.current?.files
        ? Array.from(fileInputRef.current.files)
        : [];

      if (complaint?.id && files.length) {
        for (const file of files) {
          const filePath = `${userId}/${complaint.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("complaint-images")
            .upload(filePath, file);

          if (uploadError) {
            setSubmitError(uploadError.message);
            return;
          }

          const { error: imageError } = await supabase.from("complaint_images").insert({
            complaint_id: complaint.id,
            file_path: filePath,
            uploaded_by: userId,
          });

          if (imageError) {
            setSubmitError(imageError.message);
            return;
          }
        }
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Complaint registered",
        message: `Your complaint ${complaint?.complaint_ref || complaintRef} was registered successfully.`,
        is_read: false,
      });

      setSubmitSuccess(
        `Complaint submitted successfully. Your Complaint ID: ${complaint?.complaint_ref || complaintRef}`
      );
      setSubmitted(true);
      setSelectedCategory("");
      setSelectedDepartment("");
      setDescription("");
      setSelectedWard("");
      setWardQuery("");
      setIsAnonymous(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.setTimeout(() => setSubmitted(false), 2400);
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAiDescribe = async () => {
    if (aiLoading || !description.trim()) {
      if (!description.trim()) {
        setAiError("Please enter a short note before using AI.");
      }
      return;
    }
    setAiError("");
    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: description.trim(),
        }),
      });

      let payload = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          payload = await response.json();
        } catch (parseError) {
          payload = null;
        }
      } else {
        const textPayload = await response.text();
        payload = textPayload ? { text: textPayload } : null;
      }

      if (!response.ok) {
        setAiError(payload?.error || "AI service failed. Please try again.");
        return;
      }

      if (payload?.text) {
        setDescription(payload.text);
      } else {
        setAiError("AI service returned an empty response. Please try again.");
      }
    } catch (error) {
      setAiError(error.message || "AI service failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section className={`lg:col-span-8 ${shellCard} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          New request
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">File a complaint</h2>
        <p className="mt-2 text-sm text-slate-400">
          Submit the issue with location and a brief description. (UI only)
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-slate-300">Category</span>
            <select
              className={`${inputClass} bg-slate-900/80 text-white`}
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold text-slate-300">Department</span>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <select
                className={`${inputClass} pl-11 bg-slate-900/80 text-white`}
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
              >
                <option value="" disabled>
                  Select department
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="flex items-center justify-between text-xs font-semibold text-slate-300">
              Description
              <button
                type="button"
                onClick={handleAiDescribe}
                disabled={aiLoading}
                className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200 transition hover:border-blue-400/60 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading ? "Polishing..." : "Describe with AI"}
              </button>
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
              {selectedCategory ? (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                  Category: {selectedCategory}
                </span>
              ) : null}
              {selectedDepartment ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.35)]">
                  Department: {selectedDepartment}
                </span>
              ) : null}
              {selectedWard ? (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                  Ward: {selectedWard}
                </span>
              ) : null}
            </div>
            <textarea
              rows={6}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/15"
              placeholder="Describe the issue briefly"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            {aiLoading ? (
              <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-semibold text-blue-100">
                <span className="relative z-10">NagarSetu AI working...</span>
                <div className="pointer-events-none absolute inset-0 animate-[pulse_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            ) : null}
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-300">Ward</span>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={wardQuery}
                onChange={(event) => setWardQuery(event.target.value)}
                onFocus={() => setShowWardList(true)}
                onBlur={() => {
                  window.setTimeout(() => setShowWardList(false), 120);
                }}
                className={`${inputClass} pl-11`}
                placeholder="Search ward from list"
              />
              {showWardList ? (
                <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 text-sm text-white shadow-xl">
                  {filteredWards.length ? (
                    filteredWards.map((ward) => (
                      <button
                        key={ward.value}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          const selected = `${ward.area} (${ward.label})`;
                          setWardQuery(selected);
                          setSelectedWard(selected);
                          setShowWardList(false);
                        }}
                        className="flex w-full items-start rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                      >
                        <span className="text-sm font-semibold">{ward.area}</span>
                        <span className="ml-2 text-xs text-slate-400">
                          {ward.label}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-400">
                      No matching wards found.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white sm:col-span-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(event) => setIsAnonymous(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
            <span className="text-sm text-slate-200">
              Submit this complaint anonymously
            </span>
          </label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:col-span-1"
          >
            <ImagePlus className="h-5 w-5" />
            Upload image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)] transition hover:from-blue-500 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-1"
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? "Submitting..." : "Submit complaint"}
          </button>

          {submitError ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 sm:col-span-2">
              {submitError}
            </div>
          ) : null}

          {submitSuccess ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 sm:col-span-2">
              {submitSuccess}
            </div>
          ) : null}

          {aiError ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 sm:col-span-2">
              {aiError}
            </div>
          ) : null}

          <motion.div
            initial={false}
            animate={{ opacity: submitted ? 1 : 0, y: submitted ? 0 : 10 }}
            className="sm:col-span-2"
          >
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              Complaint submitted (prototype). You can track it from the Track page.
            </div>
          </motion.div>
        </form>
      </section>

      <aside className={`lg:col-span-4 ${shellCard} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Tips
        </p>
        <h3 className="mt-2 text-lg font-bold text-white">For faster resolution</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-400">
          <li>Share a clear landmark and ward area in location.</li>
          <li>Keep description short and specific.</li>
          <li>Select correct category for auto-routing.</li>
        </ul>
      </aside>
    </div>
  );
};

export default FileComplaintPage;
