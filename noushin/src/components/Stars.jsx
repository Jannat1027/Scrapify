export default function Stars({ count }) {
  return (
    <span className="tracking-wider" aria-label={`${count} out of 5 stars`}>
      <span className="text-amber-700">{"★".repeat(count)}</span>
      <span className="text-ink/15">{"★".repeat(5 - count)}</span>
    </span>
  );
}
