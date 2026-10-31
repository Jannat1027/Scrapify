import { useState } from "react";
import { Link } from "react-router-dom";
import { LineChart } from "../../components/ChartCanvas.jsx";
import Icon from "../../components/Icon.jsx";
import ScanTable from "../../components/ScanTable.jsx";
import SearchInput from "../../components/SearchInput.jsx";
import SelectFilter from "../../components/SelectFilter.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { calculatePrice, LOW_CONFIDENCE } from "../../services/pricing.js";
import { formatShortDate } from "../../utils/format.js";

const CONFIDENCE_FILTERS = [
  { id: "low", name: "Low confidence" },
  { id: "corrected", name: "Corrected by me" },
];

export default function ScanHistoryPage() {
  const { user } = useAuth();
  const { data } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilter, setShowFilter] = useState("");

  const myScans = data.scans.filter((scan) => scan.operatorId === user.id);

  function matchesFilters(scan) {
    const query = search.trim().toUpperCase();
    if (query && !scan.id.includes(query)) return false;
    if (typeFilter && !scan.composition[typeFilter]) return false;
    if (showFilter === "low" && scan.confidence >= LOW_CONFIDENCE) return false;
    if (showFilter === "corrected" && !scan.corrected) return false;
    return true;
  }

  const oldestFirst = [...myScans].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartLabels = oldestFirst.map((scan) => formatShortDate(scan.date));
  const chartValues = oldestFirst.map((scan) => Math.round(calculatePrice(scan, data.rates).total / scan.weight));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scan history</h1>
          <p className="text-ink/60">Every batch graded at your collection point.</p>
        </div>
        <Link to="/operator/new-scan" className="btn btn-primary">
          <Icon name="plus" />
          New scan
        </Link>
      </div>

      <section className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Price history</h2>
            <p className="text-sm text-ink/60">{`Estimated value per kg at ${user.location}`}</p>
          </div>
          <span className="badge tone-blue">Mid-point of each estimate</span>
        </div>
        <LineChart labels={chartLabels} values={chartValues} seriesLabel="৳ per kg" color="#3f9e74" label="Price per kg over time" />
      </section>

      <section className="panel">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_200px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by scan ID" />
          <SelectFilter
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            allLabel="All plastic types"
            options={data.categories}
          />
          <SelectFilter
            value={showFilter}
            onChange={(event) => setShowFilter(event.target.value)}
            allLabel="Any confidence"
            options={CONFIDENCE_FILTERS}
          />
        </div>
        <div className="mt-5">
          <ScanTable scans={myScans.filter(matchesFilters)} showDetails emptyText="No scans match these filters." />
        </div>
      </section>
    </>
  );
}
