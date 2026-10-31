import { Link } from "react-router-dom";
import Icon from "../../components/Icon.jsx";
import MeterList from "../../components/MeterList.jsx";
import Notice from "../../components/Notice.jsx";
import ScanTable from "../../components/ScanTable.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { findCategory } from "../../services/marketplace.js";
import { findStaleRates, STALE_RATE_DAYS } from "../../services/pricing.js";
import { formatTaka } from "../../utils/format.js";

const STATUS_COLORS = { available: "#3f9e74", claimed: "#38bdf8", completed: "#a78bfa", cancelled: "#f87171" };

function greetingFor(name) {
  const hour = new Date().getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${partOfDay}, ${name.split(" ")[0]}`;
}

export default function OperatorDashboardPage() {
  const { user } = useAuth();
  const { data } = useData();

  const myScans = data.scans.filter((scan) => scan.operatorId === user.id);
  const myListings = data.listings.filter((listing) => listing.operatorId === user.id);
  const countWithStatus = (status) => myListings.filter((listing) => listing.status === status).length;

  const totalKg = myScans.reduce((sum, scan) => sum + scan.weight, 0);
  const earned = myListings
    .filter((listing) => listing.status === "completed")
    .reduce((sum, listing) => sum + listing.price, 0);

  const statusRows = Object.entries(STATUS_COLORS).map(([status, color]) => ({
    label: <StatusBadge status={status} />,
    valueText: countWithStatus(status),
    percent: myListings.length ? (countWithStatus(status) / myListings.length) * 100 : 0,
    color,
  }));

  const staleNames = findStaleRates(data.rates).map((rate) => findCategory(data, rate.id).name);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-sm text-ink/60">{greetingFor(user.name)}</p>
          <h1 className="text-3xl font-bold tracking-tight">{user.org}</h1>
        </div>
        <Link to="/operator/new-scan" className="btn btn-primary btn-lg">
          <Icon name="scan-line" />
          New scan
        </Link>
      </div>

      {staleNames.length > 0 && (
        <Notice
          title="Some prices may be out of date."
          text={`${staleNames.join(", ")} rates haven't been updated in over ${STALE_RATE_DAYS} days.`}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="scan-line" label="Scans" value={myScans.length} hint="All time" />
        <StatCard icon="weight" label="Plastic graded" value={`${totalKg} kg`} hint="Across all scans" />
        <StatCard
          icon="tags"
          label="On the market"
          value={countWithStatus("available") + countWithStatus("claimed")}
          hint={`${countWithStatus("claimed")} claimed`}
        />
        <StatCard icon="wallet" label="Earned" value={formatTaka(earned)} hint="Completed sales" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="panel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent scans</h2>
            <Link to="/operator/history" className="btn btn-ghost btn-sm">
              View all <Icon name="arrow-right" />
            </Link>
          </div>
          <ScanTable scans={myScans.slice(0, 5)} emptyText="No scans yet. Start with a photo of your first batch." />
        </section>

        <section className="panel">
          <h2 className="text-lg font-semibold">Listing status</h2>
          <p className="text-sm text-ink/60">Every batch you've put on the market</p>
          <div className="mt-5">
            <MeterList rows={statusRows} />
          </div>
          <Link to="/operator/listings" className="btn w-full mt-8">
            Manage listings
          </Link>
        </section>
      </div>
    </>
  );
}
