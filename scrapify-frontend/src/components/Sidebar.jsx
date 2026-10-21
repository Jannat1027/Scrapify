import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_LABELS } from "../services/marketplace.js";
import Brand from "./Brand.jsx";
import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import ResetDemoButton from "./ResetDemoButton.jsx";

// The menu for each role. This is what makes the workspace look different for operator, recycler and admin.
const MENUS = {
  operator: [
    { to: "/operator", label: "Dashboard", icon: "layout-dashboard" },
    { to: "/operator/new-scan", label: "New scan", icon: "scan-line" },
    { to: "/operator/history", label: "Scan history", icon: "history" },
    { to: "/operator/listings", label: "My listings", icon: "tags" },
  ],
};

// isOpen only matters on phones, where the sidebar slides in from the left.
export default function Sidebar({ isOpen, onNavigate }) {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  function handleLogOut() {
    logOut();
    navigate("/operator");
  }

  // NavLink tells us whether a link points at the page we are on, so it can be highlighted.
  // "end" means /operator is only active on exactly /operator, not on /operator/history.
  function linkClass({ isActive }) {
    const look = isActive
      ? "bg-white font-semibold text-forest shadow-[inset_3px_0_0_#3f9e74]"
      : "font-medium text-ink/60 hover:bg-white/70 hover:text-ink";
    return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] transition-all duration-150 ${look}`;
  }

  return (
    <aside
      className={`glass fixed bottom-4 left-4 top-4 z-50 flex w-[250px] flex-col gap-1 overflow-y-auto bg-white/95 p-4 transition-transform duration-300
        lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0 lg:bg-white/35 ${isOpen ? "translate-x-0" : "-translate-x-[120%]"}`}
    >
      <div className="px-2 pb-6">
        <Brand />
      </div>
      <p className="px-3 pb-2 text-[11px] uppercase tracking-widest text-ink/45">Workspace</p>
      {MENUS[user.role].map((item) => (
        <NavLink key={item.to} to={item.to} end className={linkClass} onClick={onNavigate}>
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}

      <div className="rounded-xl border border-ink/10 bg-white/60 p-3 mt-auto grid gap-2">
        <p className="truncate font-semibold text-sm">{user.org}</p>
        <p className="truncate text-xs text-ink/60">{`${ROLE_LABELS[user.role]} · ${user.location}`}</p>
        <Button size="sm" icon="log-out" className="w-full" onClick={handleLogOut}>
          Log out
        </Button>
        <ResetDemoButton className="w-full btn-ghost" />
      </div>
    </aside>
  );
}
