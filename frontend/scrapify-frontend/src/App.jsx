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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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

        <Route path="*" element={<Navigate to="/operator" replace />} />
      </Routes>
    </>
  );
}
