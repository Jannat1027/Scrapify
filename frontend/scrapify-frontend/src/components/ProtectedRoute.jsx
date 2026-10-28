import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { HOME_PAGE_FOR_ROLE } from "../services/marketplace.js";
import Button from "./Button.jsx";
import Icon from "./Icon.jsx";

export default function ProtectedRoute({ role }) {
  const { user, checking, sessionError, restoreSession } = useAuth();
  const { loading, error, refresh } = useData();
  const location = useLocation();

  if (checking) return <FullPageMessage icon="timer" text="Checking your session…" />;
  if (!user && sessionError) {
    return (
      <FullPageMessage icon="circle-alert" text={sessionError}>
        <Button icon="rotate-ccw" onClick={restoreSession}>
          Try again
        </Button>
      </FullPageMessage>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) {
    return <Navigate to={HOME_PAGE_FOR_ROLE[user.role] || "/login"} replace />;
  }
  if (error) {
    return (
      <FullPageMessage icon="circle-alert" text={error}>
        <Button icon="rotate-ccw" onClick={refresh}>
          Try again
        </Button>
      </FullPageMessage>
    );
  }
  if (loading) return <FullPageMessage icon="timer" text="Loading your workspace…" />;
  return <Outlet />;
}

function FullPageMessage({ icon, text, children }) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="glass grid w-[min(420px,100%)] place-items-center gap-3 px-6 py-12 text-center text-ink/60">
        <Icon name={icon} size={40} className="text-ink/30" />
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
}
