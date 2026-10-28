export default function MeterList({ rows }) {
  return (
    <div className="grid gap-4">
      {rows.map((row, index) => (
        <div key={index}>
          <div className="mb-1.5 flex items-center justify-between text-[0.875rem]">
            <span>{row.label}</span>
            <b>{row.valueText}</b>
          </div>
          <div className="meter h-2">
            <i style={{ width: `${row.percent}%`, background: row.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
