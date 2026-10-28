import Icon from "./Icon.jsx";

// A big tappable radio button, used for picking a role, a plastic type, a condition or a rating.
export default function ChoiceTile({ name, value, checked, onChange, label, icon = "", hint = "" }) {
  return (
    <label className="block">
      <input className="peer sr-only" type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="flex h-full cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-ink/10 bg-white/60 px-2 py-4 text-center text-[0.875rem] transition-all duration-150 hover:border-ink/20 peer-checked:border-mint peer-checked:bg-mint/10 peer-checked:text-forest peer-focus-visible:shadow-[0_0_0_2px_#3f9e74]">
        {icon && <Icon name={icon} size={24} />}
        <b>{label}</b>
        {hint && <small className="font-normal text-ink/60 [font-size:smaller]">{hint}</small>}
      </span>
    </label>
  );
}
