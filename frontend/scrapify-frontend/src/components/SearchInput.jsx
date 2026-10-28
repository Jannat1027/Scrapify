import Icon from "./Icon.jsx";

export default function SearchInput({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/60" />
      <input
        type="search"
        className="input pl-11"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
