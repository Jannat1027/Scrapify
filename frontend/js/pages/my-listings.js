// Operator: every batch this shop has listed, filtered by status.
const me = S.session.get();
const STATUSES = ["all", "available", "claimed", "completed", "cancelled"];
const myListings = () => S.db.where("listings", (listing) => listing.operatorId === me.id);
const withStatus = (status) => myListings().filter((listing) => status === "all" || listing.status === status);

const stars = (count) => `
  <span class="text-amber-700">${"★".repeat(count)}</span><span class="text-ink/15">${"★".repeat(5 - count)}</span>`;

// The line under each card, saying what happened to the batch.
function note(listing) {
  const buyer = listing.recyclerId && S.esc(S.user(listing.recyclerId).org);
  if (listing.status === "claimed") return `Claimed by <b>${buyer}</b> · waiting for pickup`;
  if (listing.status === "completed") {
    return listing.rating ? `Rated ${stars(listing.rating)} by ${buyer}` : `Completed with ${buyer}`;
  }
  if (listing.status === "cancelled") return `Reason: ${S.esc(listing.cancelReason || "not given")}`;
  return "";
}

function cardFooter(listing) {
  const text = note(listing);
  const button = listing.status === "available"
    ? S.ui.action("cancel", listing.id, S.t("act.cancel"), "x", "btn-danger")
    : S.ui.action("report", listing.id, S.t("act.report"), "flag");
  return `${text && `<p class="w-full text-xs muted">${text}</p>`}${button}`;
}

const redraw = S.ui.tabs(
  S.$("#tabs"),
  STATUSES,
  { label: (status) => S.t(`status.${status}`), count: (status) => withStatus(status).length },
  (status) => {
    const cards = S.ui.cards(withStatus(status), (listing) => S.ui.listingCard(listing, cardFooter(listing)),
      ["tags", "No listings here yet."]);
    S.render(S.$("#grid"), cards);
  },
);

S.onAction(S.$("#grid"), {
  report: (id) => S.reportProblem(id),
  async cancel(id) {
    const reason = await S.ask({
      title: "Cancel this listing?",
      text: "Recyclers will no longer see it.",
      field: "Why are you cancelling?",
      confirm: "Cancel listing",
      danger: true,
    });
    if (!reason) return;
    S.db.update("listings", id, { status: "cancelled", cancelReason: reason });
    S.toast("Listing cancelled.");
    redraw();
  },
});

if (S.param("created")) S.toast("Batch listed. Verified recyclers can see it now.");
