// A small label above a value, e.g. "Weight" / "62 kg". Use inside a <dl>.
//   boxed: put it in a light rounded box (used on the scan result page)
export default function Fact({ label, value, boxed = false }) {
  return (
    <div className={boxed ? "rounded-xl border border-ink/10 bg-white/60 p-3" : undefined}>
      <dt className="text-xs text-ink/60">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
