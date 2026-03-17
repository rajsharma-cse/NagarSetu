import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const CitizenRegistrationPage = lazy(() => import("./pages/CitizenRegistrationPage"));
const CitizenLoginPage = lazy(() => import("./pages/CitizenLoginPage"));
const ContractorLoginPage = lazy(() => import("./pages/ContractorLoginPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminRegistrationPage = lazy(() => import("./pages/AdminRegistrationPage"));

const CitizenPortalLayout = lazy(() => import("./pages/citizen-portal/CitizenPortalLayout"));
const Dashboard = lazy(() => import("./pages/citizen-portal/Dashboard"));
const FileComplaintPage = lazy(() => import("./pages/citizen-portal/FileComplaintPage"));
const TrackComplaintPage = lazy(() => import("./pages/citizen-portal/TrackComplaintPage"));
const BillsPage = lazy(() => import("./pages/citizen-portal/BillsPage"));
const ProfilePage = lazy(() => import("./pages/citizen-portal/ProfilePage"));

const AdminPortalLayout = lazy(() => import("./pages/admin-portal/AdminPortalLayout"));
const AdminDashboard = lazy(() => import("./pages/admin-portal/Dashboard"));
const ManageComplaintsPage = lazy(() => import("./pages/admin-portal/ManageComplaintsPage"));
const ContractorsPage = lazy(() => import("./pages/admin-portal/ContractorsPage"));
const SettingsPage = lazy(() => import("./pages/admin-portal/SettingsPage"));
const AdminProfilePage = lazy(() => import("./pages/admin-portal/ProfilePage"));

const ContractorPortalLayout = lazy(() => import("./pages/contractor-portal/ContractorPortalLayout"));
const ContractorDashboard = lazy(() => import("./pages/contractor-portal/ContractorDashboard"));
const ContractorTasksPage = lazy(() => import("./pages/contractor-portal/ContractorTasksPage"));
const ContractorUpdatesPage = lazy(() => import("./pages/contractor-portal/ContractorUpdatesPage"));

const App = () => {
  return (
    <div className="bg-slate-50 font-sans">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register/citizen" element={<CitizenRegistrationPage />} />
          <Route path="/login/citizen" element={<CitizenLoginPage />} />
          <Route path="/login/contractor" element={<ContractorLoginPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/register/admin" element={<AdminRegistrationPage />} />
          <Route path="/portal/citizen" element={<CitizenPortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="file-complaint" element={<FileComplaintPage />} />
            <Route path="track-complaints" element={<TrackComplaintPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/portal/admin" element={<AdminPortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<ManageComplaintsPage />} />
            <Route path="contractors" element={<ContractorsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
          <Route path="/portal/contractor" element={<ContractorPortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ContractorDashboard />} />
            <Route path="tasks" element={<ContractorTasksPage />} />
            <Route path="updates" element={<ContractorUpdatesPage />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
