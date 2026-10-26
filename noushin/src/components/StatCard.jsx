import Icon from "./Icon.jsx";

// One number on a dashboard, e.g. "Scans: 5 · All time".
export default function StatCard({ icon, label, value, hint }) {
  return (
    <div className="glass lift flex items-center gap-4 p-5">
      <span className="icon-tile">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-ink/60 text-sm">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {hint && <p className="text-ink/45 text-xs">{hint}</p>}
      </div>
    </div>
  );
}
