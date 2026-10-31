import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollManager from "./components/ScrollManager.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";

import GuidePage from "./pages/public/GuidePage.jsx";
import LandingPage from "./pages/public/LandingPage.jsx";

import AuthPage from "./pages/auth/AuthPage.jsx";

import BrowseListingsPage from "./pages/recycler/BrowseListingsPage.jsx";
import MyClaimsPage from "./pages/recycler/MyClaimsPage.jsx";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Route>

        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route element={<ProtectedRoute role="recycler" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/recycler" element={<BrowseListingsPage />} />
            <Route path="/recycler/claims" element={<MyClaimsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
