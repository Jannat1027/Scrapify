import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ChartCanvas, { LineChart } from "../../components/ChartCanvas.jsx";
import ConfidenceBadge from "../../components/ConfidenceBadge.jsx";
import DataTable from "../../components/DataTable.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import api from "../../services/api.js";
import { categoryColor, describeGrading, findCategory, findUser, ROLE_LABELS } from "../../services/marketplace.js";
import { formatShortDate } from "../../utils/format.js";

// Admin home: platform-wide numbers, charts, approvals waiting and scans the AI wasn't sure about.
export default function AdminDashboardPage() {
  const { data } = useData();
  // The server adds everything up (see GET /api/admin/stats), so the page only shows the numbers.
  const { totals } = data.stats;

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-bold tracking-tight">Platform overview</h1>
        <p className="text-ink/60">Scans, trading activity and anything waiting on you.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="scan-line" label="Total scans" value={totals.scans} hint={`${totals.kgGraded.toLocaleString("en-IN")} kg graded`} />
        <StatCard icon="tags" label="Live listings" value={totals.liveListings} hint={`${totals.listingsAllTime} listed all time`} />
        <StatCard
          icon="trending-up"
          label="Listing → completion"
          value={`${totals.completionRate}%`}
          hint={`${totals.completed} of ${totals.settled} settled`}
        />
        <StatCard icon="user-check" label="Awaiting approval" value={totals.pendingUsers} hint="New accounts" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="panel">
          <h2 className="text-lg font-semibold">Scan volume</h2>
          <p className="text-sm text-ink/60">Scans per day, last 14 days</p>
          <ScanVolumeChart />
        </section>
        <section className="panel">
          <h2 className="text-lg font-semibold">Category mix</h2>
          <p className="text-sm text-ink/60">Share of graded weight</p>
          <CategoryMixChart />
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="panel">
          <h2 className="text-lg font-semibold">Price trend</h2>
          <p className="text-sm text-ink/60">Average estimated ৳ per kg by scan date</p>
          <PriceTrendChart />
        </section>
        <section className="panel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Pending approvals</h2>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">
              All users <Icon name="arrow-right" />
            </Link>
          </div>
          <PendingApprovals />
        </section>
      </div>

      <section className="panel">
        <h2 className="text-lg font-semibold">Low-confidence and corrected scans</h2>
        <p className="text-sm text-ink/60">Patterns here show where the AI needs better prompts or where operators need photo help.</p>
        <div className="mt-5">
          <LowConfidenceTable />
        </div>
      </section>
    </>
  );
}

function ScanVolumeChart() {
  const { data } = useData();
  const days = data.stats.scanVolume; // [{ date: "2026-10-23", count: 3 }, ...] for the last 14 days, oldest first

  const datasets = [{ label: "Scans", data: days.map((day) => day.count), backgroundColor: "rgba(63,158,116,.55)", borderRadius: 8 }];
  const options = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };
  return (
    <ChartCanvas
      type="bar"
      labels={days.map((day) => formatShortDate(day.date))}
      datasets={datasets}
      options={options}
      label="Scans per day"
    />
  );
}

function CategoryMixChart() {
  const { data } = useData();
  const mix = data.stats.categoryMix; // [{ categoryId, kg }]: kilograms graded per plastic type

  const datasets = [
    {
      data: mix.map((row) => row.kg),
      backgroundColor: mix.map((row) => categoryColor(row.categoryId)),
      borderWidth: 0,
    },
  ];
  const options = { cutout: "68%", plugins: { legend: { position: "bottom" } } };
  return (
    <ChartCanvas
      type="doughnut"
      labels={mix.map((row) => findCategory(data, row.categoryId).name)}
      datasets={datasets}
      options={options}
      label="Category mix"
    />
  );
}

function PriceTrendChart() {
  const { data } = useData();
  const trend = data.stats.priceTrend; // [{ date, perKg }]: average estimated ৳ per kg of the scans on each day

  return (
    <LineChart
      labels={trend.map((point) => formatShortDate(point.date))}
      values={trend.map((point) => point.perKg)}
      seriesLabel="৳ per kg"
      color="#38bdf8"
      label="Average price per kg"
    />
  );
}

function PendingApprovals() {
  const { data, send } = useData();
  const showToast = useToast();
  const pendingUsers = data.users.filter((user) => user.status === "pending");

  async function approve(user) {
    if (await send(() => api.patch(`/admin/users/${user.id}/status`, { status: "approved" }))) {
      showToast("Account approved. They can log in now.");
    }
  }

  if (pendingUsers.length === 0) return <EmptyState icon="user-check" text="No one is waiting. Nice." />;
  return (
    <div className="grid gap-4 mt-5">
      {pendingUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.org}</p>
            <p className="truncate text-xs text-ink/60">{`${ROLE_LABELS[user.role]} · ${user.location}`}</p>
          </div>
          <Button size="sm" variant="primary" onClick={() => approve(user)}>
            Approve
          </Button>
        </div>
      ))}
    </div>
  );
}

function LowConfidenceTable() {
  const { data } = useData();
  const flaggedScans = data.stats.lowConfidenceScans; // scans the AI was unsure about, or the operator corrected
  const columns = [
    { label: "Scan", render: (scan) => <b>{scan.id}</b> },
    { label: "Operator", render: (scan) => findUser(data, scan.operatorId).org },
    { label: "Confidence", render: (scan) => <ConfidenceBadge confidence={scan.confidence} /> },
    { label: "Photo", render: (scan) => scan.quality },
    {
      label: "Outcome",
      render: (scan) =>
        scan.corrected ? <span className="badge tone-violet">Operator corrected</span> : <span className="badge tone-green">Accepted</span>,
    },
    // The correction log: what the AI said, and what the operator changed it to.
    {
      label: "AI said → operator chose",
      render: (scan) =>
        scan.aiResult ? (
          <span className="text-sm">
            <span className="text-ink/60">{describeGrading(data, scan.aiResult)}</span> → <b>{describeGrading(data, scan)}</b>
          </span>
        ) : (
          <span className="text-ink/60">-</span>
        ),
    },
  ];
  return <DataTable columns={columns} rows={flaggedScans} emptyText="No low-confidence scans." />;
}
