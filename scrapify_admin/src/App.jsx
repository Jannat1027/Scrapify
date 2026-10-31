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
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/rates" element={<PriceRatesPage />} />
            <Route path="/admin/reports" element={<ReportedIssuesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
