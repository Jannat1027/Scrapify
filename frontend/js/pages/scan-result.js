// Operator: the AI result for one batch, a weight keypad, the price breakdown and listing for sale.
// Shows either a fresh draft from New scan (?draft=1) or a saved scan (?id=SC-1042).
const draft = S.param("draft") ? S.store.get("draftScan", null) : null;
const saved = S.db.find("scans", S.param("id"));
if (!draft && !saved) location.replace("new-scan.html");

const isDraft = Boolean(draft);
const scan = isDraft ? { ...draft, corrected: false } : { ...saved };
const savedListing = saved && S.db.where("listings", (listing) => listing.scanId === saved.id)[0];
let weightText = isDraft ? "" : String(scan.weight);
const weight = () => parseFloat(weightText) || 0;
const mainType = () => S.cat(S.mainCategory(scan.composition)).name;

const QUALITY = { good: "Clear photo", dark: "Too dark", blurry: "Blurry" };
const fact = ([label, value]) => `
  <div class="well"><dt class="text-xs muted">${label}</dt><dd class="font-semibold">${S.esc(value)}</dd></div>`;

function renderResult() {
  S.$("#title").textContent = isDraft ? "New scan" : scan.id;
  const corrected = scan.corrected ? `<span class="badge tone-violet">Corrected by you</span>` : "";
  S.render(S.$("#headBadges"), S.ui.confidence(scan.confidence) + corrected);

  S.render(S.$("#photo"), scan.image
    ? `<img src="${scan.image}" alt="Photo of the batch" class="max-h-80 w-full rounded-2xl object-cover">`
    : S.ui.thumb(S.mainCategory(scan.composition), "h-56"));
  S.render(S.$("#bars"), S.ui.bars(scan.composition));
  S.render(S.$("#facts"), [
    ["Condition", S.cond(scan.condition)],
    ["Photo", QUALITY[scan.quality]],
    ["Scanned", S.date(scan.date)],
    ["Main type", mainType()],
  ].map(fact).join(""));

  // A fresh draft that the AI isn't sure about asks the operator to check it first.
  const unsure = scan.confidence < S.LOW_CONFIDENCE || scan.quality !== "good";
  S.$("#lowConfidence").hidden = !(isDraft && unsure && !scan.corrected && !scan.reviewed);
  S.$("#lowReason").textContent = scan.quality !== "good"
    ? `The photo looks ${scan.quality}. A retake usually fixes this.`
    : `Confidence is only ${Math.round(scan.confidence * 100)}%. Confirm or pick the plastic yourself.`;
}

function renderPrice() {
  const price = S.price({ ...scan, weight: weight() });
  S.$("#weightDisplay").textContent = weightText || "0";
  S.$("#range").textContent = weight() ? `${S.taka(price.low)} – ${S.taka(price.high)}` : "Enter weight";
  S.render(S.$("#breakdown"), S.ui.table([
    { label: "Type", cell: (line) => S.esc(S.cat(line.id).name) },
    { label: "Kg", cell: (line) => line.kg.toFixed(1) },
    { label: "Rate", cell: (line) => S.taka(line.rate) },
    { label: "Amount", cell: (line) => `<b>${S.taka(line.amount)}</b>` },
  ], weight() ? price.lines : [], "Enter the weight to see the breakdown."));
  S.$("#listButton").disabled = !isDraft || weight() <= 0;
}

S.numpad(S.$("#numpad"), (text) => {
  weightText = text;
  renderPrice();
});

const options = (table, group) =>
  S.db.all(table).map((item) => S.ui.choice(group, item.id, S.esc(item.name), { icon: item.icon })).join("");
S.render(S.$("#manualTypes"), options("categories", "type"));
S.render(S.$("#manualConditions"), options("conditions", "condition"));

async function listForSale() {
  const price = S.price({ ...scan, weight: weight() });
  const values = await S.dialog(`
    ${S.dialogTitle("List this batch",
      `${weight()} kg of ${mainType()}. Suggested range ${S.taka(price.low)} – ${S.taka(price.high)}.`)}
    ${S.field({ id: "price", label: "Fixed price (৳)", type: "number" })}
    <p class="text-xs muted">Recyclers claim at this exact price. You can cancel while it's still available.</p>
    ${S.ui.dialogButtons("Publish listing")}`, {
    price: [[(v) => Number(v) > 0, "Enter a price above zero."]],
  });
  if (!values) return;
  S.listBatch(scan, weight(), Number(values.price));
  S.store.remove("draftScan");
  location.assign("my-listings.html?created=1");
}

S.onAction(S.$("main"), {
  confirm() {
    scan.reviewed = true;
    S.$("#lowConfidence").hidden = true;
  },
  manual: () => (S.$("#manual").hidden = false),
  apply() {
    const type = S.$("[name=type]:checked")?.value;
    const condition = S.$("[name=condition]:checked")?.value;
    if (!type || !condition) return S.toast("Pick a plastic type and a condition.", "red");
    Object.assign(scan, { composition: { [type]: 100 }, condition, corrected: true });
    S.$("#manual").hidden = true;
    renderResult();
    renderPrice();
  },
  list: listForSale,
});

// A saved scan is read-only: no keypad, and a note about its listing instead of the list button.
if (!isDraft) {
  S.$("#weightCard").hidden = true;
  S.$("#listButton").hidden = true;
  S.$("#listedNote").hidden = false;
  S.render(S.$("#listedNote"), savedListing
    ? `Listed as <a class="link" href="my-listings.html">${savedListing.id}</a> · ${S.ui.badge(savedListing.status)}`
    : "This scan was not listed.");
}

renderResult();
renderPrice();
