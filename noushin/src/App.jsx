// Every address (route) in the app and the page it shows.
// Routes inside another <Route element={...}> are drawn inside that element's <Outlet />.
//
// This branch only contains: AuthPage, BrowseListingsPage and MyClaimsPage.
// Pages that belong to teammates (public, operator, admin) are added back when branches are merged.
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollManager from "./components/ScrollManager.jsx";
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";

import AuthPage from "./pages/auth/AuthPage.jsx";

import BrowseListingsPage from "./pages/recycler/BrowseListingsPage.jsx";
import MyClaimsPage from "./pages/recycler/MyClaimsPage.jsx";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* Landing page is not part of this branch, so the home address opens the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

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
