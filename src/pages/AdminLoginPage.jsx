import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const panelVariants = {
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

const adminHighlights = [
  {
    icon: LayoutDashboard,
    title: "Administrative access",
    description: "Use your admin ID to access monitoring, approvals, and department dashboards.",
  },
  {
    icon: Smartphone,
    title: "Linked mobile verification",
    description: "Confirm access using the mobile number registered with your admin account.",
  },
  {
    icon: MessageSquareText,
    title: "OTP-secured authentication",
    description: "Request an OTP and verify your session before entering the admin workspace.",
  },
];

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    adminId: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const otpSlots = useMemo(() => [0, 1, 2, 3, 4, 5], []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    setOtpValues((current) => {
      const next = [...current];
      next[index] = sanitized;
      return next;
    });

    if (sanitized && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const inputClassName =
    "h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoggingIn) {
      return;
    }
    setAuthError("");
    setAuthNotice("");

    const otp = otpValues.join("");
    if (!formData.adminId || !formData.password || otp.length !== 6) {
      setAuthError("Enter admin email, password, and 6-digit OTP.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const adminKey = formData.adminId.trim();
      const isEmail = adminKey.includes("@");
      const baseQuery = supabase
        .from("admin_officers")
        .select("mobile_number,role,email,admin_id");
      const { data: profileData, error: profileError } = isEmail
        ? await baseQuery.ilike("email", adminKey).maybeSingle()
        : await baseQuery.ilike("admin_id", adminKey).maybeSingle();

      if (profileError || !profileData) {
        setAuthError("Admin profile not found.");
        return;
      }
      if (profileData.role !== "officer") {
        setAuthError("This account is not authorized for officer access.");
        return;
      }

      const { error: otpError } = await supabase.auth.verifyOtp({
        phone: `+91${profileData.mobile_number}`,
        token: otp,
        type: "sms",
      });

      if (otpError) {
        setAuthError(otpError.message);
        return;
      }

      if (!profileData.email) {
        setAuthError("Admin email is missing. Please contact the system admin.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: formData.password,
      });

      if (signInError) {
        setAuthError(
          `Invalid credentials for ${profileData.email}. Make sure the officer Auth user exists and the password is correct.`
        );
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const authUserId = sessionData?.session?.user?.id;
      if (authUserId && profileData.admin_id) {
        await supabase
          .from("admin_officers")
          .update({ auth_user_id: authUserId })
          .eq("admin_id", profileData.admin_id);
      }
      if (typeof window !== "undefined" && profileData.admin_id) {
        sessionStorage.setItem("admin_id", profileData.admin_id);
      }

      navigate("/portal/admin");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGetOtp = async () => {
    if (isSendingOtp) {
      return;
    }
    setAuthError("");
    setAuthNotice("");
    if (!formData.adminId || !formData.password) {
      setAuthError("Enter admin email and password before requesting OTP.");
      return;
    }
    setIsSendingOtp(true);
    try {
      const adminKey = formData.adminId.trim();
      const isEmail = adminKey.includes("@");
      const baseQuery = supabase
        .from("admin_officers")
        .select("mobile_number,role,email,admin_id");
      const { data: profileData, error: profileError } = isEmail
        ? await baseQuery.ilike("email", adminKey).maybeSingle()
        : await baseQuery.ilike("admin_id", adminKey).maybeSingle();

      if (profileError || !profileData) {
        setAuthError("Admin profile not found.");
        return;
      }
      if (profileData.role !== "officer") {
        setAuthError("This account is not authorized for officer access.");
        return;
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `+91${profileData.mobile_number}`,
        shouldCreateUser: false,
      });

      if (otpError) {
        setAuthError(otpError.message);
        return;
      }
      setAuthNotice("OTP sent successfully.");
    } finally {
      setIsSendingOtp(false);
    }
  };

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
            Admin access
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" }}
            className="order-1 flex h-full flex-col rounded-[1.75rem] p-6 text-white shadow-xl lg:p-7"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Admin Login
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-white lg:text-[2rem]">
              Sign in to your NagarSetu admin dashboard
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Access municipal dashboards, approvals, escalations, and administrative workflows through your verified admin account.
            </p>

            <div className="mt-5 space-y-3">
              {adminHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/12 p-3.5">
                    <div className="rounded-xl bg-white/18 p-2.5">
                      <Icon className="h-[18px] w-[18px] text-cyan-200" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-sm leading-6 text-slate-100">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-5">
              <div className="rounded-xl bg-white/12 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Login checklist
                </p>
                <ul className="mt-2.5 space-y-1.5 text-sm leading-6 text-slate-100">
                  <li>• Enter your admin ID</li>
                  <li>• Use linked mobile number and password</li>
                  <li>• Request OTP and verify before login</li>
                </ul>
              </div>
            </div>
          </motion.aside>

          <motion.section
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            className="order-2 flex h-full flex-col rounded-[1.75rem] bg-white p-6 shadow-xl lg:p-7"
          >
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 lg:text-[2rem]">
                Admin Login Form
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Enter your admin credentials and verify with OTP to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-4">
              <motion.label variants={itemVariants} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Admin ID
                </span>
                <input
                  type="text"
                  name="adminId"
                  value={formData.adminId}
                  onChange={handleChange}
                  placeholder="Enter admin id"
                  className={inputClassName}
                />
              </motion.label>

              <motion.label variants={itemVariants} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`${inputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </motion.label>

              <motion.div variants={itemVariants} className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/70 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">OTP Verification</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Request an OTP and enter the code below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    disabled={isSendingOtp}
                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                  >
                    {isSendingOtp ? "Sending..." : "Get OTP"}
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Write OTP
                  </span>
                  <div className="mt-2 flex gap-2 sm:gap-3">
                    {otpSlots.map((slot) => (
                      <input
                        key={slot}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpValues[slot]}
                        onChange={(event) => handleOtpChange(slot, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(slot, event)}
                        ref={(el) => {
                          otpRefs.current[slot] = el;
                        }}
                        className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-center text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:h-11 sm:w-11"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="mt-auto pt-1">
                {authNotice ? (
                  <p className="mb-3 text-sm font-semibold text-emerald-600">
                    {authNotice}
                  </p>
                ) : null}
                {authError ? (
                  <p className="mb-3 text-sm font-semibold text-rose-600">
                    {authError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)] transition hover:bg-blue-700"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {isLoggingIn ? "Logging in..." : "Login as Admin"}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;



