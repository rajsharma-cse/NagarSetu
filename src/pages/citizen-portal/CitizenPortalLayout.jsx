import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import PortalNavbar from "./components/PortalNavbar";
import SidebarDrawer from "./components/SidebarDrawer";
import { supabase } from "../../lib/supabaseClient";

const routeMeta = [
  {
    match: "/portal/citizen/dashboard",
    title: "Dashboard",
    subtitle: "At-a-glance citizen services",
  },
  {
    match: "/portal/citizen/file-complaint",
    title: "File Complaint",
    subtitle: "Submit a civic issue",
  },
  {
    match: "/portal/citizen/track-complaints",
    title: "Track Complaints",
    subtitle: "Follow status updates",
  },
  {
    match: "/portal/citizen/bills",
    title: "Bills",
    subtitle: "View and pay dues",
  },
  {
    match: "/portal/citizen/profile",
    title: "Profile",
    subtitle: "Your citizen details",
  },
];

const CitizenPortalLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const meta = useMemo(() => {
    return (
      routeMeta.find((item) => location.pathname.startsWith(item.match)) ?? {
        title: "Citizen Portal",
        subtitle: "Prayagraj Nagar Nigam services",
      }
    );
  }, [location.pathname]);

  const showBack = !location.pathname.startsWith("/portal/citizen/dashboard");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }
      if (!data.session) {
        navigate("/login/citizen", { replace: true });
      }
      setCheckingAuth(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login/citizen", { replace: true });
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] text-slate-100">
        <p className="text-sm text-slate-300">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100">
      <PortalNavbar
        onOpenMenu={() => setDrawerOpen(true)}
        showBack={showBack}
        onBack={() => navigate("/portal/citizen/dashboard")}
        title={meta.title}
        subtitle={meta.subtitle}
      />

      <SidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={() => {
          setDrawerOpen(false);
          navigate("/login/citizen");
        }}
      />

      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CitizenPortalLayout;
