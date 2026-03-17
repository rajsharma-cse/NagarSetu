import { Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const shellCard =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.65)]";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        if (isMounted) {
          setErrorMessage("No active session found. Please log in again.");
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name,mobile_number,email,city,ward_area,ward_number,address,pin_code"
        )
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section className={`lg:col-span-8 ${shellCard} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Profile
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">
          {profile?.full_name || "Citizen Profile"}
        </h2>
        {errorMessage ? (
          <p className="mt-3 text-sm text-rose-300">{errorMessage}</p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Mobile
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Phone className="h-4.5 w-4.5 text-slate-400" />
              {loading ? "Loading..." : profile?.mobile_number || "Not available"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Email
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Mail className="h-4.5 w-4.5 text-slate-400" />
              {loading ? "Loading..." : profile?.email || "Not provided"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              City
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {loading ? "Loading..." : profile?.city || "Not available"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Ward
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {loading
                ? "Loading..."
                : `Ward ${profile?.ward_number || "--"} · ${profile?.ward_area || "--"}`}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Address
            </p>
            <div className="mt-2 flex items-start gap-2 text-sm font-semibold text-white">
              <MapPin className="mt-0.5 h-4.5 w-4.5 text-slate-400" />
              <div>
                <p>{loading ? "Loading..." : profile?.address || "Not available"}</p>
                <p className="mt-1 text-xs text-slate-400">
                  PIN: {loading ? "Loading..." : profile?.pin_code || "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className={`lg:col-span-4 ${shellCard} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Actions
        </p>
        <h3 className="mt-2 text-lg font-bold text-white">Citizen services</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-400">
          <li>File complaints with ward based routing.</li>
          <li>Track complaint timelines and updates.</li>
          <li>View bills and payment history.</li>
        </ul>
      </aside>
    </div>
  );
};

export default ProfilePage;
