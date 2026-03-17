import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        if (mounted) {
          setErrorMessage("Please log in to view your profile.");
          setLoading(false);
        }
        return;
      }

      let { data, error } = await supabase
        .from("admin_officers")
        .select("admin_id,full_name,email,mobile_number,role,designation")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!data) {
        const sessionUser = sessionData?.session?.user;
        const email = sessionUser?.email || "";
        const phoneDigits = (sessionUser?.phone || "").replace(/\D/g, "");
        const storedAdminId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("admin_id")
            : "";
        if (email) {
          const fallback = await supabase
            .from("admin_officers")
            .select("admin_id,full_name,email,mobile_number,role,designation")
            .ilike("email", email)
            .maybeSingle();
          data = fallback.data || data;
          error = fallback.error || error;
        }
        if (!data && phoneDigits) {
          const fallback = await supabase
            .from("admin_officers")
            .select("admin_id,full_name,email,mobile_number,role,designation")
            .ilike("mobile_number", `%${phoneDigits}`)
            .maybeSingle();
          data = fallback.data || data;
          error = fallback.error || error;
        }
        if (!data && storedAdminId) {
          const fallback = await supabase
            .from("admin_officers")
            .select("admin_id,full_name,email,mobile_number,role,designation")
            .ilike("admin_id", storedAdminId)
            .maybeSingle();
          data = fallback.data || data;
          error = fallback.error || error;
        }
      }

      if (!mounted) {
        return;
      }

      if (error || !data) {
        setErrorMessage(error?.message || "Officer profile not found.");
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!profile?.full_name) return "NS";
    return profile.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.full_name]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">
          Officer account details, role access, and contact information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)]">
          {loading ? (
            <p className="text-sm text-slate-500">Loading officer profile...</p>
          ) : errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-blue-600">
                  Officer Profile
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {profile?.full_name || "Officer"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Designation: {profile?.designation || "Municipal Officer"}
                </p>
                <p className="text-sm text-slate-500">
                  Email: {profile?.email || "—"}
                </p>
                <p className="text-sm text-slate-500">
                  Phone: {profile?.mobile_number || "—"}
                </p>
                <p className="text-sm text-slate-500">
                  Admin ID: {profile?.admin_id || "—"}
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-semibold text-white">
                {initials}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Full Name", value: profile?.full_name || "Officer" },
              { label: "Designation", value: profile?.designation || "Municipal Officer" },
              { label: "Contact Email", value: profile?.email || "—" },
              { label: "Contact Number", value: profile?.mobile_number || "—" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {["Complaint Escalation", "Contractor Oversight", "Ward Ops"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <button
            type="button"
            className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Edit profile
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
          <div className="mt-4 space-y-3">
            {[
              "Update contact information",
              "Manage notification preferences",
              "Review assigned complaints",
              "Download monthly report",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                {item}
                <span className="text-xs text-slate-400">View</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
