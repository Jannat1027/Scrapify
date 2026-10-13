// Operator: today's overview for one collection point.
const me = S.session.get();
const scans = S.db.where("scans", (scan) => scan.operatorId === me.id);
const listings = S.db.where("listings", (listing) => listing.operatorId === me.id);
const countOf = (status) => listings.filter((listing) => listing.status === status).length;

const hour = new Date().getHours();
const partOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
S.$("#greeting").textContent = `Good ${partOfDay}, ${me.name.split(" ")[0]}`;
S.$("#orgName").textContent = me.org;

const stale = S.staleRates().map((rate) => S.esc(S.cat(rate.id).name));
if (stale.length) {
  S.render(S.$("#staleNotice"), S.ui.notice("Some prices may be out of date.",
    `${stale.join(", ")} rates haven't been updated in over ${S.STALE_DAYS} days.`));
}

const kg = scans.reduce((total, scan) => total + scan.weight, 0);
const earned = listings.filter((listing) => listing.status === "completed").reduce((total, l) => total + l.price, 0);

S.render(S.$("#stats"), [
  { icon: "scan-line", label: "Scans", value: scans.length, hint: "All time" },
  { icon: "weight", label: "Plastic graded", value: `${kg} kg`, hint: "Across all scans" },
  { icon: "tags", label: "On the market", value: countOf("available") + countOf("claimed"),
    hint: `${countOf("claimed")} claimed` },
  { icon: "wallet", label: "Earned", value: S.taka(earned), hint: "Completed sales" },
].map(S.ui.stat).join(""));

const { id, type, weight, confidence, estimate } = S.scanColumn;
S.render(S.$("#recentScans"), S.ui.table([id, type, weight, confidence, estimate], scans.slice(0, 5),
  "No scans yet. Start with a photo of your first batch."));

const STATUS_COLORS = { available: "#3f9e74", claimed: "#38bdf8", completed: "#a78bfa", cancelled: "#f87171" };
S.render(S.$("#statusBreakdown"), S.ui.meters(Object.entries(STATUS_COLORS).map(([status, color]) => {
  const share = listings.length ? (countOf(status) / listings.length) * 100 : 0;
  return [S.ui.badge(status), countOf(status), share, color];
})));
