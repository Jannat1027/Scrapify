import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HOME_PAGE_FOR_ROLE } from "../services/marketplace.js";

// Guards the pages of one role.
//   - nobody logged in          -> go to /login (and come back here after logging in)
//   - logged in as another role -> go to that role's own dashboard
//   - suspended account          -> back to /login
//   - otherwise                  -> show the page (<Outlet /> is where the child route appears)
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.status === "suspended") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) {
    return <Navigate to={HOME_PAGE_FOR_ROLE[user.role]} replace />;
  }
  return <Outlet />;
}
