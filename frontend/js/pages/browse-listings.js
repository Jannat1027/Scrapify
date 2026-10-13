// Recycler: every available batch, with filters, a detail view and a fixed-price claim.
const me = S.session.get();
const filters = S.$("#filters");
const field = filters.elements;

const pairs = (table) => S.db.all(table).map((item) => [item.id, item.name]);
field.type.insertAdjacentHTML("beforeend", S.options(pairs("categories")));
field.condition.insertAdjacentHTML("beforeend", S.options(pairs("conditions")));
field.place.insertAdjacentHTML("beforeend", S.options(S.db.all("locations")));

// Average star rating the operator has received, or "New" if nobody has rated them yet.
function operatorRating(operatorId) {
  const rated = S.db.where("listings", (listing) => listing.operatorId === operatorId && listing.rating);
  if (!rated.length) return "New";
  return (rated.reduce((total, listing) => total + listing.rating, 0) / rated.length).toFixed(1);
}

function matches(listing) {
  const query = field.q.value.trim().toLowerCase();
  return listing.status === "available"
    && (!query || `${listing.id} ${listing.location}`.toLowerCase().includes(query))
    && (!field.type.value || listing.category === field.type.value)
    && (!field.condition.value || listing.condition === field.condition.value)
    && (!field.place.value || listing.location === field.place.value)
    && listing.weight >= (Number(field.minKg.value) || 0);
}

function render() {
  const listings = S.db.where("listings", matches);
  const buttons = (id) => S.ui.action("view", id, "Details", "eye", "flex-1")
    + S.ui.action("claim", id, S.t("act.claim"), "hand-coins", "btn-primary flex-1");
  S.$("#resultCount").textContent = `${listings.length} available`;
  S.render(S.$("#grid"), S.ui.cards(listings, (listing) => S.ui.listingCard(listing, buttons(listing.id)),
    ["search-x", "No batches match these filters right now."]));
}

async function claim(id) {
  const listing = S.db.find("listings", id);
  const confirmed = await S.ask({
    title: "Claim this batch?",
    text: `${listing.weight} kg for ${S.taka(listing.price)}. The operator is notified straight away.`,
    confirm: "Claim batch",
  });
  if (!confirmed) return;
  try {
    S.claim(id, me.id);
    S.toast("Batch claimed. You'll find it under My claims.");
  } catch (error) {
    S.toast(error.message, "red");
  }
  render();
}

// Full details of one batch. Its confirm button goes straight to claiming.
async function showDetail(id) {
  const listing = S.db.find("listings", id);
  const scan = S.db.find("scans", listing.scanId);
  const perKg = S.taka(listing.price / listing.weight);
  const composition = scan && `
    <h3 class="mt-2 font-semibold">AI composition ${S.ui.confidence(scan.confidence)}</h3>
    <div class="grid gap-3">${S.ui.bars(scan.composition)}</div>`;

  const wantsIt = await S.dialog(`
    <div class="grid gap-6 sm:grid-cols-2" data-wide>
      ${S.ui.thumb(listing.category, "h-full min-h-48")}
      <div>
        <p class="text-xs muted">${listing.id} · ${S.date(listing.created)}</p>
        <h2 class="text-2xl font-bold">${S.esc(S.cat(listing.category).name)}</h2>
        <p class="mt-1 text-3xl font-extrabold text-gradient">${S.taka(listing.price)}</p>
        <p class="text-sm muted">${listing.weight} kg · ${S.cond(listing.condition)} · ${perKg}/kg</p>
        <div class="well mt-4 text-sm">
          <p class="font-semibold">${S.esc(S.user(listing.operatorId).org)}</p>
          <p class="muted">${S.esc(listing.location)} · ★ ${operatorRating(listing.operatorId)}</p>
        </div>
      </div>
    </div>
    ${composition || ""}
    ${S.ui.dialogButtons(S.t("act.claim"))}`);
  if (wantsIt) claim(id);
}

filters.addEventListener("input", render);
S.onAction(S.$("#grid"), { view: showDetail, claim });
render();
