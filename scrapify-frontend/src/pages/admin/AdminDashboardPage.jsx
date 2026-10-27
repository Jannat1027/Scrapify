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
import { categoryColor, describeGrading, findCategory, findUser, ROLE_LABELS } from "../../services/marketplace.js";
import { calculatePrice, LOW_CONFIDENCE } from "../../services/pricing.js";
import { formatShortDate, ONE_DAY_MS } from "../../utils/format.js";

// Admin home: platform-wide numbers, charts, approvals waiting and scans the AI wasn't sure about.
export default function AdminDashboardPage() {
  const { data } = useData();
  const { scans, listings } = data;

  const settled = listings.filter((listing) => listing.status === "completed" || listing.status === "cancelled");
  const completed = listings.filter((listing) => listing.status === "completed");
  const completionRate = settled.length ? Math.round((completed.length / settled.length) * 100) : 0;
  const totalKg = scans.reduce((sum, scan) => sum + scan.weight, 0);
  const liveCount = listings.filter((listing) => listing.status === "available").length;
  const pendingCount = data.users.filter((user) => user.status === "pending").length;

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-bold tracking-tight">Platform overview</h1>
        <p className="text-ink/60">Scans, trading activity and anything waiting on you.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="scan-line" label="Total scans" value={scans.length} hint={`${totalKg.toLocaleString("en-IN")} kg graded`} />
        <StatCard icon="tags" label="Live listings" value={liveCount} hint={`${listings.length} listed all time`} />
        <StatCard
          icon="trending-up"
          label="Listing → completion"
          value={`${completionRate}%`}
          hint={`${completed.length} of ${settled.length} settled`}
        />
        <StatCard icon="user-check" label="Awaiting approval" value={pendingCount} hint="New accounts" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="panel">
          <h2 className="text-lg font-semibold">Scan volume</h2>
          <p className="text-sm text-ink/60">Scans per day, last 14 days</p>
          <ScanVolumeChart scans={scans} />
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

function ScanVolumeChart({ scans }) {
  // The 14 days up to today, oldest first.
  const days = [];
  for (let daysBack = 13; daysBack >= 0; daysBack -= 1) days.push(new Date(Date.now() - daysBack * ONE_DAY_MS));
  const scansOn = (day) => scans.filter((scan) => new Date(scan.date).toDateString() === day.toDateString()).length;

  const datasets = [{ label: "Scans", data: days.map(scansOn), backgroundColor: "rgba(63,158,116,.55)", borderRadius: 8 }];
  const options = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };
  return (
    <ChartCanvas
      type="bar"
      labels={days.map((day) => formatShortDate(day))}
      datasets={datasets}
      options={options}
      label="Scans per day"
    />
  );
}

function CategoryMixChart() {
  const { data } = useData();
  // Kilograms graded per plastic type, across every scan.
  const kgByType = {};
  data.scans.forEach((scan) => {
    Object.entries(scan.composition).forEach(([categoryId, percent]) => {
      kgByType[categoryId] = (kgByType[categoryId] || 0) + (scan.weight * percent) / 100;
    });
  });
  const typeIds = Object.keys(kgByType);

  const datasets = [
    {
      data: typeIds.map((id) => Math.round(kgByType[id])),
      backgroundColor: typeIds.map(categoryColor),
      borderWidth: 0,
    },
  ];
  const options = { cutout: "68%", plugins: { legend: { position: "bottom" } } };
  return (
    <ChartCanvas
      type="doughnut"
      labels={typeIds.map((id) => findCategory(data, id).name)}
      datasets={datasets}
      options={options}
      label="Category mix"
    />
  );
}

function PriceTrendChart() {
  const { data } = useData();
  // Group the ৳ per kg of each scan by its date, then average each day.
  const valuesByDay = {};
  [...data.scans]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((scan) => {
      const day = formatShortDate(scan.date);
      const perKg = calculatePrice(scan, data.rates).total / scan.weight;
      valuesByDay[day] = [...(valuesByDay[day] || []), perKg];
    });
  const averages = Object.values(valuesByDay).map((values) => Math.round(values.reduce((a, b) => a + b, 0) / values.length));

  return (
    <LineChart
      labels={Object.keys(valuesByDay)}
      values={averages}
      seriesLabel="৳ per kg"
      color="#38bdf8"
      label="Average price per kg"
    />
  );
}

function PendingApprovals() {
  const { data, updateRow } = useData();
  const showToast = useToast();
  const pendingUsers = data.users.filter((user) => user.status === "pending");

  function approve(user) {
    updateRow("users", user.id, { status: "approved" });
    showToast("Account approved. A welcome email is on its way.");
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
  const flaggedScans = data.scans.filter((scan) => scan.confidence < LOW_CONFIDENCE || scan.corrected);
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
