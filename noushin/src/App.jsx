// Every address (route) in the app and the page it shows.
// Routes inside another <Route element={...}> are drawn inside that element's <Outlet />.
//
// Pages: Shreyasree's landing page and plastic guide, AuthPage, BrowseListingsPage and MyClaimsPage.
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
        {/* Public pages share the navbar and footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Route>

        {/* Login and sign-up are one page, so the picture panel can slide between the two forms */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Recycler pages */}
        <Route element={<ProtectedRoute role="recycler" />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/recycler" element={<BrowseListingsPage />} />
            <Route path="/recycler/claims" element={<MyClaimsPage />} />
          </Route>
        </Route>

        {/* Any other address */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
