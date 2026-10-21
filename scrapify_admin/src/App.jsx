// Routes for the admin branch: login/register and the four admin pages.
// Pages that belong to other team members are not in this branch yet. When the branches are merged,
// keep every <Route> from all of them in this file.
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollManager from "./components/ScrollManager.jsx";
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";

import NotFoundPage from "./pages/public/NotFoundPage.jsx";

import AuthPage from "./pages/auth/AuthPage.jsx";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import ManageUsersPage from "./pages/admin/ManageUsersPage.jsx";
import PriceRatesPage from "./pages/admin/PriceRatesPage.jsx";
import ReportedIssuesPage from "./pages/admin/ReportedIssuesPage.jsx";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* The landing page is not in this branch, so the front door is the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login and sign-up are one page, so the picture panel can slide between the two forms */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Admin pages */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/rates" element={<PriceRatesPage />} />
            <Route path="/admin/reports" element={<ReportedIssuesPage />} />
          </Route>
        </Route>

        {/* Any other address */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
