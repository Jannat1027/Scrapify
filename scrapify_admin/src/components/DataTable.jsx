import EmptyState from "./EmptyState.jsx";

// A table built from a list of columns and a list of rows.
//   columns: [{ label: "Scan", render: (row) => <b>{row.id}</b> }, ...]
//   rows:    any array of objects with an id
export default function DataTable({ columns, rows, emptyText = "Nothing here yet." }) {
  if (rows.length === 0) return <EmptyState icon="inbox" text={emptyText} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[0.875rem]">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-4 pb-3 pt-0 text-left text-[11px] font-semibold uppercase tracking-wider text-ink/45">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="transition-colors duration-150 hover:bg-white/60">
              {columns.map((column, index) => (
                <td key={index} className="whitespace-nowrap border-t border-ink/10 px-4 py-3.5">{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
