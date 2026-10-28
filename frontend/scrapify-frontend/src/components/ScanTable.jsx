import { Link } from "react-router-dom";
import { useData } from "../context/DataContext.jsx";
import { conditionName, findCategory } from "../services/marketplace.js";
import { calculatePrice, mainCategoryOf } from "../services/pricing.js";
import { formatDate, formatPriceRange } from "../utils/format.js";
import ConfidenceBadge from "./ConfidenceBadge.jsx";
import DataTable from "./DataTable.jsx";

export default function ScanTable({ scans, showDetails = false, emptyText }) {
  const { data } = useData();

  const columns = [
    { label: "Scan", render: (scan) => <Link className="link" to={`/operator/scans/${scan.id}`}>{scan.id}</Link> },
    showDetails && { label: "Date", render: (scan) => formatDate(scan.date) },
    { label: "Main type", render: (scan) => findCategory(data, mainCategoryOf(scan.composition)).name },
    showDetails && { label: "Condition", render: (scan) => conditionName(data, scan.condition) },
    { label: "Weight", render: (scan) => `${scan.weight} kg` },
    {
      label: "Confidence",
      render: (scan) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <ConfidenceBadge confidence={scan.confidence} />
          {scan.corrected && <span className="badge tone-violet">Corrected</span>}
        </span>
      ),
    },
    {
      label: "Estimate",
      render: (scan) => <b>{formatPriceRange(calculatePrice(scan, data.rates))}</b>,
    },
  ].filter(Boolean);

  return <DataTable columns={columns} rows={scans} emptyText={emptyText} />;
}
