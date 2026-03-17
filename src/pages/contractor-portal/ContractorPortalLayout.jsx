import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const ContractorPortalLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let statusChannel;

    const fetchContractor = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const phone = sessionData?.session?.user?.phone || "";
      const phoneDigits = phone.replace(/\D/g, "");

      let contractorRow = null;
      if (phoneDigits) {
        const { data } = await supabase
          .from("contractors")
          .select("id,contractor_id,name,phone,email,ward,wards,expertise,status")
          .ilike("phone", `%${phoneDigits}`)
          .maybeSingle();
        contractorRow = data || null;
      }

      if (!contractorRow) {
        const storedUuid =
          typeof window !== "undefined"
            ? sessionStorage.getItem("contractor_uuid")
            : null;
        if (storedUuid) {
          const { data } = await supabase
            .from("contractors")
            .select("id,contractor_id,name,phone,email,ward,wards,expertise,status")
            .eq("id", storedUuid)
            .maybeSingle();
          contractorRow = data || null;
        }
      }

      if (!mounted) return;

      if (!contractorRow) {
        navigate("/login/contractor");
        setLoading(false);
        return;
      }
      if ((contractorRow.status || "").toLowerCase() === "blocked") {
        setIsBlocked(true);
        setLoading(false);
        return;
      }

      setContractor(contractorRow);
      setIsBlocked(false);
      setLoading(false);

      statusChannel = supabase
        .channel(`contractor-status-${contractorRow.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "contractors",
            filter: `id=eq.${contractorRow.id}`,
          },
          (payload) => {
            const nextStatus = (payload.new?.status || "").toLowerCase();
            if (nextStatus === "blocked") {
              setIsBlocked(true);
              setContractor((prev) =>
                prev ? { ...prev, status: "Blocked" } : prev
              );
              setSidebarOpen(false);
            }
          }
        )
        .subscribe();
    };

    fetchContractor();

    return () => {
      mounted = false;
      if (statusChannel) {
        supabase.removeChannel(statusChannel);
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!contractor?.id) return undefined;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("contractors")
        .select("status")
        .eq("id", contractor.id)
        .maybeSingle();
      if ((data?.status || "").toLowerCase() === "blocked") {
        setIsBlocked(true);
        setSidebarOpen(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [contractor?.id, navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="relative flex min-h-screen">
        <div className={isBlocked ? "pointer-events-none blur-sm" : ""}>
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={() => {
              setSidebarOpen(false);
              navigate("/login/contractor");
            }}
          />
        </div>
        <div className={`flex min-h-screen flex-1 flex-col ${isBlocked ? "pointer-events-none blur-sm" : ""}`}>
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} contractor={contractor} />
          <main className="flex-1 px-6 py-6 lg:px-8">
            <Outlet context={{ contractor, loading }} />
          </main>
        </div>
        {isBlocked ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/40 backdrop-blur-sm">
            <div className="max-w-xl rounded-3xl border border-rose-200 bg-white/90 p-8 text-center shadow-[0_25px_70px_-45px_rgba(15,23,42,0.5)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
                Access Blocked
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-rose-600">
                You are blocked. Contact Municipality.
              </h1>
              <p className="mt-3 text-sm text-rose-500">
                Your contractor account has been temporarily disabled by the officer.
                Please contact Prayagraj Nagar Nigam to restore access.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ContractorPortalLayout;
