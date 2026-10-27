// Every address (route) in the app and the page it shows.
// Routes inside another <Route element={...}> are drawn inside that element's <Outlet />.
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollManager from "./components/ScrollManager.jsx";
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";

import MyListingsPage from "./pages/operator/MyListingsPage.jsx";
import NewScanPage from "./pages/operator/NewScanPage.jsx";
import OperatorDashboardPage from "./pages/operator/OperatorDashboardPage.jsx";
import ScanHistoryPage from "./pages/operator/ScanHistoryPage.jsx";
import ScanResultPage from "./pages/operator/ScanResultPage.jsx";
import PaymentsPage from "./pages/operator/PaymentsPage.jsx";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* The operator logs in with the backend */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* The five operator pages, inside the sidebar + top bar frame: only for logged-in operators */}
        <Route element={<ProtectedRoute role="operator" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/operator" element={<OperatorDashboardPage />} />
            <Route path="/operator/new-scan" element={<NewScanPage />} />
            <Route path="/operator/scans/:scanId" element={<ScanResultPage />} />
            <Route path="/operator/history" element={<ScanHistoryPage />} />
            <Route path="/operator/listings" element={<MyListingsPage />} />
            <Route path="/operator/payments" element={<PaymentsPage />} />
          </Route>
        </Route>

        {/* Any other address goes to the operator dashboard */}
        <Route path="*" element={<Navigate to="/operator" replace />} />
      </Routes>
    </>
  );
}
