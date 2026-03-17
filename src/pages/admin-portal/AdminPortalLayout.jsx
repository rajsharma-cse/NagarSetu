import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const AdminPortalLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={() => {
            setSidebarOpen(false);
            navigate("/login/admin");
          }}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 px-6 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalLayout;
