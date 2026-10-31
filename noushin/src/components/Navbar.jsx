import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HOME_PAGE_FOR_ROLE } from "../services/marketplace.js";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";
import LanguageButton from "./LanguageButton.jsx";

const NAV_LINKS = [
  { to: "/#how", label: "How it works" },
  { to: "/#why", label: "Why Scrapify" },
  { to: "/#roles", label: "Who it's for" },
  { to: "/guide", label: "Plastic guide" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const accountLink = user
    ? { to: HOME_PAGE_FOR_ROLE[user.role], label: "My workspace" }
    : { to: "/login", label: "Log in" };

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="mx-auto w-[min(1180px,calc(100%-2rem))] sticky top-4 z-40 mt-4">
      <nav className="glass flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2">
        <Brand />
        <div className="hidden items-center gap-1 text-[0.875rem] lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-full px-4 py-2 text-ink/60 transition-all duration-150 hover:bg-white/70 hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="inline-flex flex-wrap items-center gap-2">
          <LanguageButton className="max-sm:!hidden" />
          <Link to={accountLink.to} className="btn btn-ghost btn-sm max-sm:!hidden">
            {accountLink.label}
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get started
          </Link>
          <button
            type="button"
            className="btn btn-icon btn-sm w-9 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "x" : "menu"} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass mt-2 grid gap-1 p-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-xl px-4 py-3 font-medium hover:bg-white/70" onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-ink/10 pt-3">
            <Link to={accountLink.to} className="btn flex-1" onClick={closeMenu}>
              {accountLink.label}
            </Link>
            <LanguageButton />
          </div>
        </div>
      )}
    </header>
  );
}
