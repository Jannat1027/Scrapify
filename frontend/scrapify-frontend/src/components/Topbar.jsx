import { useAuth } from "../context/AuthContext.jsx";
import { initialsOf } from "../utils/format.js";
import Icon from "./Icon.jsx";
import LanguageButton from "./LanguageButton.jsx";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <header className="glass flex items-center justify-between gap-3 px-4 py-3">
      <div className="inline-flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-icon lg:hidden" aria-label="Open menu" onClick={onMenuClick}>
          <Icon name="menu" />
        </button>
        <p className="text-sm text-ink/60 max-sm:!hidden">{today}</p>
      </div>
      <div className="inline-flex flex-wrap items-center gap-2">
        <LanguageButton />
        <span className="grid h-10 w-10 place-items-center rounded-full bg-mint/15 text-[0.875rem] font-bold text-forest" title={user.name}>
          {initialsOf(user.name)}
        </span>
      </div>
    </header>
  );
}
