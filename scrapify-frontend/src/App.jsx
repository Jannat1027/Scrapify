// Every address (route) in the app and the page it shows.
// Routes inside another <Route element={...}> are drawn inside that element's <Outlet />.
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollManager from "./components/ScrollManager.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";

import GuidePage from "./pages/public/GuidePage.jsx";
import LandingPage from "./pages/public/LandingPage.jsx";
import NotFoundPage from "./pages/public/NotFoundPage.jsx";

import AuthPage from "./pages/auth/AuthPage.jsx";

import MyListingsPage from "./pages/operator/MyListingsPage.jsx";
import NewScanPage from "./pages/operator/NewScanPage.jsx";
import OperatorDashboardPage from "./pages/operator/OperatorDashboardPage.jsx";
import ScanHistoryPage from "./pages/operator/ScanHistoryPage.jsx";
import ScanResultPage from "./pages/operator/ScanResultPage.jsx";

import BrowseListingsPage from "./pages/recycler/BrowseListingsPage.jsx";
import MyClaimsPage from "./pages/recycler/MyClaimsPage.jsx";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import ManageUsersPage from "./pages/admin/ManageUsersPage.jsx";
import PriceRatesPage from "./pages/admin/PriceRatesPage.jsx";
import ReportedIssuesPage from "./pages/admin/ReportedIssuesPage.jsx";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* Public pages share the navbar and footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Route>

        {/* Login and sign-up are one page, so the picture panel can slide between the two forms */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Operator pages: only for logged-in operators */}
        <Route element={<ProtectedRoute role="operator" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/operator" element={<OperatorDashboardPage />} />
            <Route path="/operator/new-scan" element={<NewScanPage />} />
            <Route path="/operator/scans/:scanId" element={<ScanResultPage />} />
            <Route path="/operator/history" element={<ScanHistoryPage />} />
            <Route path="/operator/listings" element={<MyListingsPage />} />
          </Route>
        </Route>

        {/* Recycler pages */}
        <Route element={<ProtectedRoute role="recycler" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/recycler" element={<BrowseListingsPage />} />
            <Route path="/recycler/claims" element={<MyClaimsPage />} />
          </Route>
        </Route>

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
