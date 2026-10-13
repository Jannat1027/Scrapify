// Operator: every scan at this collection point, with filters and a price-per-kg chart.
const me = S.session.get();
const scans = S.db.where("scans", (scan) => scan.operatorId === me.id);
const filters = S.$("#filters");
const { q: search, type: typeFilter, show: showFilter } = filters.elements;

S.$("#location").textContent = me.location;
typeFilter.insertAdjacentHTML("beforeend", S.options(S.db.all("categories").map((c) => [c.id, c.name])));

const { id, date, type, condition, weight, confidence, estimate } = S.scanColumn;
const COLUMNS = [id, date, type, condition, weight, confidence, estimate];

function matches(scan) {
  const query = search.value.trim().toUpperCase();
  const show = showFilter.value;
  return (!query || scan.id.includes(query))
    && (!typeFilter.value || scan.composition[typeFilter.value])
    && (show !== "low" || scan.confidence < S.LOW_CONFIDENCE)
    && (show !== "corrected" || scan.corrected);
}

const renderTable = () =>
  S.render(S.$("#table"), S.ui.table(COLUMNS, scans.filter(matches), "No scans match these filters."));
filters.addEventListener("input", renderTable);
renderTable();

// Estimated ৳ per kg for each scan, oldest first.
const timeline = [...scans].sort((a, b) => new Date(a.date) - new Date(b.date));
S.lineChart(S.$("#priceChart"),
  timeline.map((scan) => S.date(scan.date).slice(0, -5)),
  timeline.map((scan) => Math.round(S.price(scan).total / scan.weight)),
  { label: "৳ per kg", color: "#3f9e74" });
