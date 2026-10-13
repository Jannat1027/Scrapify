// Recycler: batches this buyer has claimed, plus where their plastic comes from.
const me = S.session.get();
const myClaims = () => S.db.where("listings", (listing) => listing.recyclerId === me.id);
const withStatus = (status) => myClaims().filter((listing) => listing.status === status);
const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);

const GREEN_FADE = "linear-gradient(90deg, #3f9e74, #a7d7b8)";

// Kilograms bought, grouped by a listing field such as category or location.
function sourcingBars(done, key, nameOf) {
  const totalKg = sum(done, "weight");
  const byKey = {};
  done.forEach((listing) => (byKey[listing[key]] = (byKey[listing[key]] || 0) + listing.weight));
  const rows = Object.entries(byKey)
    .sort((a, b) => b[1] - a[1])
    .map(([value, kg]) => [S.esc(nameOf(value)), `${kg} kg`, (kg / totalKg) * 100, GREEN_FADE]);
  return rows.length ? S.ui.meters(rows) : `<p class="text-sm muted">Complete a claim to see your sourcing mix.</p>`;
}

function renderSummary() {
  const done = withStatus("completed");
  const kg = sum(done, "weight");
  const spent = sum(done, "price");

  S.render(S.$("#stats"), [
    { icon: "package-check", label: "Active claims", value: withStatus("claimed").length, hint: "Waiting for pickup" },
    { icon: "circle-check-big", label: "Completed", value: done.length, hint: "All time" },
    { icon: "weight", label: "Plastic sourced", value: `${kg} kg`, hint: "Completed batches" },
    { icon: "wallet", label: "Spent", value: S.taka(spent),
      hint: kg ? `${S.taka(spent / kg)} per kg on average` : "No purchases yet" },
  ].map(S.ui.stat).join(""));

  S.render(S.$("#byType"), sourcingBars(done, "category", (id) => S.cat(id).name));
  S.render(S.$("#byPlace"), sourcingBars(done, "location", (place) => place));
}

function cardActions({ id, status, rating }) {
  if (status === "claimed") {
    return S.ui.action("complete", id, S.t("act.complete"), "check", "btn-primary")
      + S.ui.action("cancel", id, S.t("act.cancel"), "", "btn-danger")
      + S.ui.action("report", id, "", "flag");
  }
  if (status === "completed" && !rating) return S.ui.action("rate", id, "Rate operator", "star");
  if (!rating) return "";
  return `<p class="text-sm text-amber-700">${"★".repeat(rating)} <span class="muted">your rating</span></p>`;
}

const TABS = { claimed: "Active", completed: S.t("status.completed"), cancelled: S.t("status.cancelled") };
const redraw = S.ui.tabs(
  S.$("#tabs"),
  Object.keys(TABS),
  { label: (status) => TABS[status], count: (status) => withStatus(status).length },
  (status) => {
    const card = (listing) => S.ui.listingCard(listing, cardActions(listing));
    S.render(S.$("#grid"), S.ui.cards(withStatus(status), card, ["package-open", "Nothing in this list."]));
    renderSummary();
  },
);

async function rate(id) {
  const stars = await S.ask({
    title: "How was this operator?",
    text: "Your rating helps other recyclers.",
    options: ["1", "2", "3", "4", "5"],
    confirm: "Submit rating",
  });
  if (stars) S.db.update("listings", id, { rating: Number(stars) });
}

async function complete(id) {
  S.db.update("listings", id, { status: "completed", completedAt: new Date().toISOString() });
  S.toast("Marked as completed.");
  await rate(id);
}

async function cancel(id) {
  const reason = await S.ask({
    title: "Cancel this claim?",
    text: "The operator is notified with your reason.",
    field: "Reason for cancelling",
    confirm: "Cancel claim",
    danger: true,
  });
  if (reason) S.db.update("listings", id, { status: "cancelled", cancelReason: reason });
}

// Every action refreshes the cards and the summary afterwards.
const thenRedraw = (action) => async (id) => {
  await action(id);
  redraw();
};
S.onAction(S.$("#grid"), {
  complete: thenRedraw(complete),
  cancel: thenRedraw(cancel),
  rate: thenRedraw(rate),
  report: (id) => S.reportProblem(id),
});
