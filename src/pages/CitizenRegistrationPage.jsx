import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  MapPinned,
  ShieldCheck,
  Smartphone,
  LockKeyhole,
} from "lucide-react";
import { wardDirectory } from "../data/dummyData";
import { supabase } from "../lib/supabaseClient";

// Backend integration (Supabase auth + profiles) starts here.

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

const initialForm = {
  fullName: "",
  mobileNumber: "",
  email: "",
  city: "Prayagraj",
  wardArea: "",
  wardNumber: "",
  address: "",
  pinCode: "",
  password: "",
  confirmPassword: "",
};

const registrationHighlights = [
  {
    icon: Smartphone,
    title: "Mobile-first access",
    description:
      "Use your mobile number to sign in and receive municipal updates.",
  },
  {
    icon: MapPinned,
    title: "Ward-based routing",
    description:
      "Ward and area details help route requests to the correct office.",
  },
  {
    icon: LockKeyhole,
    title: "Secure profile",
    description:
      "One password-secured account for NagarSetu civic workflows.",
  },
];

const sectionCardClass =
  "rounded-[1.25rem] border border-slate-200/80 bg-slate-50/70 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.22)]";

const CitizenRegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const wardOptions = useMemo(
    () =>
      wardDirectory.map((ward) => ({
        label: `${ward.ward} - ${ward.name}`,
        value: ward.ward,
        area: ward.name,
      })),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "wardNumber") {
      const matchedWard = wardOptions.find((ward) => ward.value === value);

      setFormData((current) => ({
        ...current,
        wardNumber: value,
        wardArea: matchedWard ? matchedWard.area : current.wardArea,
      }));

      return;
    }

    if (name === "wardArea") {
      const matchedWard = wardOptions.find(
        (ward) => ward.area.toLowerCase() === value.toLowerCase()
      );

      setFormData((current) => ({
        ...current,
        wardArea: value,
        wardNumber: matchedWard ? matchedWard.value : current.wardNumber,
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const email = formData.email?.trim();
    const mobile = formData.mobileNumber?.trim();
    const authEmail = mobile ? `${mobile}@nagars.local` : "";

    if (!formData.fullName?.trim()) {
      setSubmitError("Full name is required.");
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setSubmitError("Enter a valid email address.");
      return;
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      setSubmitError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.password || formData.password !== formData.confirmPassword) {
      setSubmitError("Passwords do not match. Please re-check.");
      return;
    }

    const withTimeout = (promise, ms = 15000) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out. Try again.")), ms)
        ),
      ]);

    setIsSubmitting(true);

    try {
      const { data: existingProfile, error: lookupError } = await withTimeout(
        supabase
          .from("profiles")
          .select("id")
          .eq("mobile_number", mobile)
          .maybeSingle()
      );

      if (lookupError) {
        setSubmitError(lookupError.message);
        return;
      }

      if (existingProfile) {
        setSubmitError("This mobile number is already registered. Please log in.");
        return;
      }

      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: authEmail,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              mobile_number: mobile,
              ward_number: formData.wardNumber,
              ward_area: formData.wardArea,
              city: formData.city,
            },
          },
        })
      );

      if (error) {
        const msg = error.message?.toLowerCase?.() || "";
        if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
          setSubmitError("Account already exists. Please log in or reset your password.");
        } else {
          setSubmitError(error.message);
        }
        return;
      }

      const userId = data.session?.user?.id || data.user?.id;

      if (!data.session && userId) {
        setSubmitError(
          "Registration created, but email confirmation is enabled. Disable email confirmation in Supabase to allow OTP + password login."
        );
        return;
      }

      if (userId) {
        const { error: phoneError } = await withTimeout(
          supabase.auth.updateUser({ phone: `+91${mobile}` })
        );
        if (phoneError) {
          setSubmitError(phoneError.message);
          return;
        }

        const { error: profileError } = await withTimeout(
          supabase.from("profiles").upsert({
            id: userId,
            full_name: formData.fullName,
            mobile_number: mobile,
            email,
            city: formData.city,
            ward_area: formData.wardArea,
            ward_number: formData.wardNumber,
            address: formData.address,
            pin_code: formData.pinCode,
            role: "citizen",
          })
        );

        if (profileError) {
          setSubmitError(profileError.message);
          return;
        }
      }

      navigate("/login/citizen", {
        state: {
          registrationSuccess: true,
          mobileNumber: mobile,
        },
      });
    } catch (err) {
      setSubmitError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const renderInput = (label, name, type = "text", placeholder = "", fullWidth = false) => (
    <motion.label variants={itemVariants} className={`flex flex-col gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</span>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClassName}
      />
    </motion.label>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.92),rgba(248,250,252,0.98))]" />
        <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-[-10rem] top-20 h-80 w-80 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[30%] h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex items-center justify-between gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm backdrop-blur sm:inline-flex">
            <ShieldCheck className="h-4 w-4" />
            Citizen onboarding
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
            }}
            className="order-1 flex h-full flex-col rounded-[1.75rem] p-6 text-white shadow-xl lg:p-7"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Citizen Registration
            </p>

            <h1 className="mt-3 text-2xl font-bold leading-tight text-white lg:text-[2rem]">
              Register once and access NagarSetu services
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-100">
              This registration creates your digital citizen profile for Prayagraj Nagar Nigam so you can raise complaints, track updates, and access municipal services from one account.
            </p>

            <div className="mt-5 space-y-3">
              {registrationHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl bg-white/12 p-3.5"
                  >
                    <div className="rounded-xl bg-white/18 p-2.5">
                      <Icon className="h-4.5 w-4.5 text-cyan-200" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-sm leading-6 text-slate-100">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-5">
              <div className="rounded-xl bg-white/12 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Before submitting
                </p>

                <ul className="mt-2.5 space-y-1.5 text-sm leading-6 text-slate-100">
                  <li>• Use an active mobile number</li>
                  <li>• Select correct ward and area</li>
                  <li>• Keep password secure</li>
                </ul>
              </div>
            </div>
          </motion.aside>

          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 flex h-full flex-col rounded-[1.75rem] bg-white p-6 shadow-xl lg:p-7"
          >
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 lg:text-[2rem]">
                Citizen Registration Form
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Fill your details carefully to complete your NagarSetu citizen account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-4">
              {submitError ? (
                <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}
              <motion.div variants={itemVariants} className={sectionCardClass}>
                <h3 className="mb-3 text-base font-bold text-slate-900">1. Basic Personal Information</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {renderInput("Full Name", "fullName", "text", "Enter your full name")}
                  {renderInput("Mobile Number", "mobileNumber", "tel", "Enter mobile number")}
                  {renderInput("Email ID", "email", "email", "Enter email address", true)}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className={sectionCardClass}>
                <h3 className="mb-3 text-base font-bold text-slate-900">2. Address / Location Information</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {renderInput("City", "city", "text", "Enter city")}

                  <motion.label variants={itemVariants} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Ward / Area</span>

                    <input
                      type="text"
                      name="wardArea"
                      list="ward-area-options"
                      value={formData.wardArea}
                      onChange={handleChange}
                      placeholder="Search ward area"
                      className={inputClassName}
                    />

                    <datalist id="ward-area-options">
                      {wardOptions.map((ward) => (
                        <option key={ward.label} value={ward.area}>
                          {ward.label}
                        </option>
                      ))}
                    </datalist>
                  </motion.label>

                  <motion.label variants={itemVariants} className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Residential Address</span>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter residential address"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </motion.label>

                  {renderInput("Pin Code", "pinCode", "text", "Enter pin code")}

                  <motion.label variants={itemVariants} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Ward Number</span>

                    <input
                      type="text"
                      name="wardNumber"
                      list="ward-number-options"
                      value={formData.wardNumber}
                      onChange={handleChange}
                      placeholder="Search ward number"
                      className={inputClassName}
                    />

                    <datalist id="ward-number-options">
                      {wardOptions.map((ward) => (
                        <option key={ward.value} value={ward.value}>
                          {ward.area}
                        </option>
                      ))}
                    </datalist>
                  </motion.label>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className={sectionCardClass}>
                <h3 className="mb-3 text-base font-bold text-slate-900">3. Login Credentials</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {renderInput("Password", "password", "password", "Create password")}
                  {renderInput("Confirm Password", "confirmPassword", "password", "Re-enter password")}
                </div>
              </motion.div>

              <div className="mt-auto pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? "Creating account..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default CitizenRegistrationPage;









