import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

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

const contractorHighlights = [
  {
    icon: Building2,
    title: "Contractor ID access",
    description: "Use your registered contractor ID to access tenders and work assignments.",
  },
  {
    icon: Smartphone,
    title: "Mobile verification",
    description: "Confirm your contractor identity using the mobile number linked to your account.",
  },
  {
    icon: MessageSquareText,
    title: "OTP-secured sign in",
    description: "Request an OTP and verify your login before entering the contractor portal.",
  },
];

const ContractorLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const otpRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    contractorId: "",
    mobileNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const blockedMessage = location?.state?.message;
    if (blockedMessage) {
      setSubmitError(blockedMessage);
    }
  }, [location?.state]);
  const [otpStatus, setOtpStatus] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

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

  const getPhoneE164 = (mobile) => {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    if (digits.startsWith("91") && digits.length === 12) {
      return `+${digits}`;
    }
    return "";
  };

  const handleGetOtp = async () => {
    setSubmitError("");
    setOtpStatus("");

    const mobileDigits = (formData.mobileNumber || "").replace(/\D/g, "");
    const phone = getPhoneE164(formData.mobileNumber || "");
    if (!phone) {
      setSubmitError("Enter a valid 10-digit mobile number to receive OTP.");
      return;
    }

    setIsSendingOtp(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: "sms",
        shouldCreateUser: true,
      },
    });

    if (error) {
      setSubmitError(error.message);
      setIsSendingOtp(false);
      return;
    }

    setOtpStatus("OTP sent to your registered mobile number.");
    setIsSendingOtp(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setOtpStatus("");

    const phone = getPhoneE164(formData.mobileNumber || "");
    const otpToken = otpValues.join("");
    const mobileDigits = (formData.mobileNumber || "").replace(/\D/g, "");
    const contractorId = formData.contractorId.trim();
    const contractorIdLower = contractorId.toLowerCase();

    if (!contractorId || !phone) {
      setSubmitError("Enter your contractor ID and mobile number.");
      return;
    }

    if (otpToken.length !== 6) {
      setSubmitError("Enter the 6-digit OTP sent to your mobile.");
      return;
    }

    setIsSubmitting(true);

    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      phone,
      token: otpToken,
      type: "sms",
    });

    if (otpError) {
      setSubmitError(otpError.message);
      setIsSubmitting(false);
      return;
    }

    if (!otpData?.session) {
      setSubmitError("OTP verification succeeded but no session was created.");
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.setSession(otpData.session);

    const { data: contractorRows, error: contractorError } = await supabase
      .from("contractors")
      .select("id,contractor_id,name,phone,email,ward,wards,status")
      .ilike("contractor_id", contractorId);

    if (contractorError) {
      await supabase.auth.signOut();
      setSubmitError(contractorError.message);
      setIsSubmitting(false);
      return;
    }

    if (!contractorRows?.length) {
      await supabase.auth.signOut();
      setSubmitError(
        "Contractor profile not accessible. Check credentials or contractor access policy."
      );
      setIsSubmitting(false);
      return;
    }

    const contractorData = (contractorRows || []).find((row) => {
      const storedPhoneDigits = (row.phone || "").replace(/\D/g, "");
      const storedIdLower = (row.contractor_id || "").toLowerCase();
      return storedIdLower === contractorIdLower && storedPhoneDigits === mobileDigits;
    });

    if (!contractorData) {
      await supabase.auth.signOut();
      setSubmitError(
        "Contractor profile not found. Check contractor ID and mobile number."
      );
      setIsSubmitting(false);
      return;
    }
    if ((contractorData.status || "").toLowerCase() === "blocked") {
      await supabase.auth.signOut();
      setSubmitError(
        "You are blocked by the municipality. Please contact the office."
      );
      setIsSubmitting(false);
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("contractor_id", contractorData.contractor_id);
      sessionStorage.setItem("contractor_uuid", contractorData.id);
    }
    navigate("/portal/contractor", { state: { contractor: contractorData } });
    setIsSubmitting(false);
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
            Contractor access
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
              Contractor Login
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-white lg:text-[2rem]">
              Sign in to your NagarSetu contractor workspace
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Access assigned projects, billing milestones, compliance workflows, and contractor-side updates through your verified account.
            </p>

            <div className="mt-5 space-y-3">
              {contractorHighlights.map((item) => {
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
                  <li>• Enter your contractor ID</li>
                  <li>• Use the linked mobile number</li>
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
                Contractor Login Form
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Enter your contractor credentials and verify with OTP to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-4">
              {submitError ? (
                <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}
              <motion.label variants={itemVariants} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Contractor ID
                </span>
                <input
                  type="text"
                  name="contractorId"
                  value={formData.contractorId}
                  onChange={handleChange}
                  placeholder="Enter contractor ID"
                  className={inputClassName}
                />
              </motion.label>

              <motion.label variants={itemVariants} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Mobile Number
                </span>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter registered mobile number"
                  className={inputClassName}
                />
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
                  {otpStatus ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-600">
                      {otpStatus}
                    </p>
                  ) : null}
                </div>
              </motion.div>

              <div className="mt-auto pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.55)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {isSubmitting ? "Signing in..." : "Login as Contractor"}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default ContractorLoginPage;





