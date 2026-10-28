export default function PillTabs({ tabs, current, onChange, label = "Filter" }) {
  return (
    <nav className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-ink/10 bg-white/60 p-1" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`inline-flex h-9 items-center gap-1 rounded-full px-4 text-[0.875rem] font-semibold transition-all duration-150 ${
            tab.value === current ? "bg-white text-ink shadow-sm" : "text-ink/60"
          }`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label} <span className="ml-1 text-[0.75rem] opacity-60">{tab.count}</span>
        </button>
      ))}
    </nav>
  );
}
