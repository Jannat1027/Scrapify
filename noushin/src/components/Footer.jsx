import { Link } from "react-router-dom";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";
import LanguageButton from "./LanguageButton.jsx";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { to: "/#how", label: "How it works" },
      { to: "/#why", label: "Why Scrapify" },
      { to: "/guide", label: "Plastic guide" },
      { to: "/guide#tips", label: "Photo tips" },
    ],
  },
  {
    title: "Get started",
    links: [
      { to: "/register", label: "Create an account" },
      { to: "/login", label: "Log in" },
      { to: "/#roles", label: "For recyclers" },
      { to: "/guide#contact", label: "Talk to us" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/guide#about", label: "About" },
      { to: "/guide#contact", label: "Contact" },
      { to: "/guide#privacy", label: "Privacy policy" },
      { to: "/guide#terms", label: "Terms of use" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-28 border-t border-white/70 bg-white/45 shadow-glass backdrop-blur-[40px]">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs leading-[1.6] text-sm text-ink/60">Fair, explainable prices for the plastic Bangladesh collects every day.</p>
          <a href="mailto:hello@scrapify.app" className="link mt-5 inline-flex items-center gap-2 text-sm">
            <Icon name="mail" />
            hello@scrapify.app
          </a>
          <div className="inline-flex flex-wrap items-center gap-2 mt-5">
            <LanguageButton />
          </div>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="kicker">{column.title}</p>
            <ul className="mt-4 grid gap-3 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-ink/60 hover:text-forest">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto w-[min(1180px,calc(100%-2rem))] flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-ink/60">
          <p>{`© ${new Date().getFullYear()} Scrapify. Made for scrap shops, NGOs and recyclers in Bangladesh.`}</p>
          <p className="inline-flex flex-wrap items-center gap-2">
            <Icon name="info" />
            AI grades are estimates. Operators confirm every batch before it's listed.
          </p>
        </div>
      </div>
    </footer>
  );
}
