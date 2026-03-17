import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const sectionCardClass =
  "rounded-[1.25rem] border border-slate-200/80 bg-slate-50/70 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.22)]";

const AdminRegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminId: "",
    fullName: "",
    email: "",
    mobileNumber: "",
    designation: "Municipal Officer",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!formData.adminId.trim()) {
      setSubmitError("Admin ID is required.");
      return;
    }
    if (!formData.fullName.trim()) {
      setSubmitError("Full name is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setSubmitError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.password || formData.password !== formData.confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: existingAdmin, error: adminLookupError } = await supabase
        .from("admin_officers")
        .select("id")
        .eq("admin_id", formData.adminId.trim())
        .maybeSingle();

      if (adminLookupError) {
        setSubmitError(adminLookupError.message);
        return;
      }
      if (existingAdmin) {
        setSubmitError("Admin ID already exists.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      const userId = data.user?.id || data.session?.user?.id;
      if (!userId) {
        setSubmitError("Unable to create admin account. Try again.");
        return;
      }

      const { error: phoneError } = await supabase.auth.updateUser({
        phone: `+91${formData.mobileNumber}`,
      });
      if (phoneError) {
        setSubmitError(phoneError.message);
        return;
      }

      const { error: insertError } = await supabase.from("admin_officers").insert({
        auth_user_id: userId,
        admin_id: formData.adminId.trim(),
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile_number: formData.mobileNumber,
        role: "officer",
        designation: formData.designation.trim(),
      });

      if (insertError) {
        setSubmitError(insertError.message);
        return;
      }

      navigate("/login/admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const renderInput = (label, name, type = "text", placeholder = "") => (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClassName}
      />
    </label>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.92),rgba(248,250,252,0.98))]" />
        <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-[-10rem] top-20 h-80 w-80 rounded-full bg-cyan-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex items-center justify-between gap-4"
        >
          <Link
            to="/login/admin"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm backdrop-blur sm:inline-flex">
            <ShieldCheck className="h-4 w-4" />
            Officer onboarding
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" }}
            className="flex h-full flex-col rounded-[1.75rem] p-6 text-white shadow-xl lg:p-7"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Officer Registration
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-white lg:text-[2rem]">
              Create an officer access profile
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Register a municipal officer to access the NagarSetu admin portal with OTP and password.
            </p>
            <div className="mt-auto pt-5">
              <div className="rounded-xl bg-white/12 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Required fields
                </p>
                <ul className="mt-2.5 space-y-1.5 text-sm leading-6 text-slate-100">
                  <li>• Admin ID and designation</li>
                  <li>• Official email and mobile</li>
                  <li>• Password for login</li>
                </ul>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex h-full flex-col rounded-[1.75rem] bg-white p-6 shadow-xl lg:p-7"
          >
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 lg:text-[2rem]">
                Admin Registration Form
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Create an officer account to enable OTP + password login.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-4">
              {submitError ? (
                <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}

              <div className={sectionCardClass}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderInput("Admin ID", "adminId", "text", "Ad-001")}
                  {renderInput("Full Name", "fullName", "text", "Officer name")}
                  {renderInput("Email", "email", "email", "official@email.com")}
                  {renderInput("Mobile Number", "mobileNumber", "tel", "10-digit mobile")}
                  {renderInput("Designation", "designation", "text", "Municipal Officer")}
                </div>
              </div>

              <div className={sectionCardClass}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderInput("Password", "password", "password", "Create password")}
                  {renderInput(
                    "Confirm Password",
                    "confirmPassword",
                    "password",
                    "Re-enter password"
                  )}
                </div>
              </div>

              <div className="mt-auto pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  <UserPlus className="h-4 w-4" />
                  {isSubmitting ? "Creating officer..." : "Create Officer"}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;
