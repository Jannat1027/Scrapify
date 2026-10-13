// Admin: platform-wide numbers, charts, approvals waiting and scans the AI wasn't sure about.
const scans = S.db.all("scans");
const listings = S.db.all("listings");
const pendingUsers = () => S.db.where("users", (user) => user.status === "pending");
const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;
const perKg = (scan) => S.price(scan).total / scan.weight;

const settled = listings.filter((listing) => ["completed", "cancelled"].includes(listing.status));
const completed = listings.filter((listing) => listing.status === "completed");
const completionRate = settled.length ? Math.round((completed.length / settled.length) * 100) : 0;
const totalKg = scans.reduce((total, scan) => total + scan.weight, 0);
const live = listings.filter((listing) => listing.status === "available").length;

S.render(S.$("#stats"), [
  { icon: "scan-line", label: "Total scans", value: scans.length, hint: `${totalKg} kg graded` },
  { icon: "tags", label: "Live listings", value: live, hint: `${listings.length} listed all time` },
  { icon: "trending-up", label: "Listing → completion", value: `${completionRate}%`,
    hint: `${completed.length} of ${settled.length} settled` },
  { icon: "user-check", label: "Awaiting approval", value: pendingUsers().length, hint: "New accounts" },
].map(S.ui.stat).join(""));

// Scans per day over the last two weeks.
const days = [...Array(14)].map((_, i) => new Date(Date.now() - (13 - i) * 864e5).toDateString());
const scansOn = (day) => scans.filter((scan) => new Date(scan.date).toDateString() === day).length;
S.chart(S.$("#volumeChart"), {
  type: "bar",
  data: {
    labels: days.map((day) => day.slice(4, 10)),
    datasets: [{ label: "Scans", data: days.map(scansOn), backgroundColor: "rgba(63,158,116,.55)", borderRadius: 8 }],
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
});

// Kilograms graded per plastic type.
const kgByType = {};
scans.forEach((scan) => Object.entries(scan.composition).forEach(([id, percent]) => {
  kgByType[id] = (kgByType[id] || 0) + (scan.weight * percent) / 100;
}));
const types = Object.keys(kgByType);
S.chart(S.$("#mixChart"), {
  type: "doughnut",
  data: {
    labels: types.map((id) => S.cat(id).name),
    datasets: [{
      data: types.map((id) => Math.round(kgByType[id])),
      backgroundColor: types.map(S.catColor),
      borderWidth: 0,
    }],
  },
  options: { cutout: "68%", plugins: { legend: { position: "bottom" } } },
});

// Average estimated ৳ per kg on each day that had scans.
const perKgByDay = {};
[...scans]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .forEach((scan) => (perKgByDay[S.date(scan.date).slice(0, -5)] ||= []).push(perKg(scan)));
const dailyAverages = Object.values(perKgByDay).map((values) => Math.round(average(values)));
S.lineChart(S.$("#trendChart"), Object.keys(perKgByDay), dailyAverages, { label: "৳ per kg", color: "#38bdf8" });

function renderPending() {
  const row = (user) => `
    <div class="well flex items-center justify-between gap-3 !rounded-2xl">
      <div class="min-w-0">
        <p class="truncate font-semibold">${S.esc(user.org)}</p>
        <p class="truncate text-xs muted">${S.t(`role.${user.role}`)} · ${S.esc(user.location)}</p>
      </div>
      ${S.ui.action("approve", user.id, S.t("act.approve"), "", "btn-primary")}
    </div>`;
  const users = pendingUsers();
  const nobody = S.ui.empty("user-check", "No one is waiting. Nice.");
  S.render(S.$("#pending"), users.length ? users.map(row).join("") : nobody);
}

S.onAction(S.$("#pending"), {
  approve(id) {
    S.db.update("users", id, { status: "approved" });
    S.toast("Account approved. A welcome email is on its way.");
    renderPending();
  },
});
renderPending();

const outcome = (scan) => (scan.corrected
  ? `<span class="badge tone-violet">Operator corrected</span>`
  : `<span class="badge tone-green">Accepted</span>`);

S.render(S.$("#lowScans"), S.ui.table([
  { label: "Scan", cell: (scan) => `<b>${scan.id}</b>` },
  { label: "Operator", cell: (scan) => S.esc(S.user(scan.operatorId).org) },
  { label: "Confidence", cell: (scan) => S.ui.confidence(scan.confidence) },
  { label: "Photo", cell: (scan) => S.esc(scan.quality) },
  { label: "Outcome", cell: outcome },
], scans.filter((scan) => scan.confidence < S.LOW_CONFIDENCE || scan.corrected), "No low-confidence scans."));
