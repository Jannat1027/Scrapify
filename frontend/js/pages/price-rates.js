// Admin: the ৳/kg rate table, new categories and collection locations.
const CONDITIONS = ["clean", "light", "heavy"];
const now = () => new Date().toISOString();

const rateInput = (rate, condition) => `
  <input class="input !h-10 w-24 text-right tabular-nums" type="number" min="0" value="${rate[condition]}"
    data-id="${rate.id}" data-condition="${condition}" aria-label="${condition} rate">`;

const categoryName = (rate) => `
  <div class="flex items-center gap-3">
    <span class="h-3 w-3 rounded-full" style="background: ${S.catColor(rate.id)}"></span>
    <b>${S.esc(S.cat(rate.id).name)}</b>
  </div>`;

const lastUpdated = (rate) => {
  const age = S.daysSince(rate.updated);
  return age > S.STALE_DAYS ? `<span class="badge tone-amber">${age} days ago</span>` : S.date(rate.updated);
};

const COLUMNS = [
  { label: "Category", cell: categoryName },
  ...CONDITIONS.map((condition) => ({ label: `${S.cond(condition)} ৳`, cell: (rate) => rateInput(rate, condition) })),
  { label: "Source", cell: (rate) => `<span class="text-sm muted">${S.esc(rate.source)}</span>` },
  { label: "Last updated", cell: lastUpdated },
  { label: "", cell: (rate) => S.ui.action("save", rate.id, S.t("act.save"), "save") },
];

function renderRates() {
  const stale = S.staleRates().length;
  S.render(S.$("#staleNotice"), stale
    ? S.ui.notice(`${stale} rate${stale > 1 ? "s are" : " is"} out of date.`,
      "Operators see a warning on these until you update them.")
    : "");
  S.render(S.$("#rates"), S.ui.table(COLUMNS, S.db.all("rates")));
}

S.onAction(S.$("#rates"), {
  save(id) {
    const valueOf = (condition) => Number(S.$(`[data-id="${id}"][data-condition="${condition}"]`).value);
    const rates = Object.fromEntries(CONDITIONS.map((condition) => [condition, valueOf(condition)]));
    if (Object.values(rates).some((value) => !(value >= 0))) return S.toast("Rates must be zero or more.", "red");
    S.db.update("rates", id, { ...rates, updated: now() });
    S.toast(`${S.cat(id).name} rates saved.`);
    renderRates();
  },
});

const isRate = [[(v) => v !== "" && Number(v) >= 0, "Enter a rate of 0 or more."]];

S.$("#addCategory").addEventListener("click", async () => {
  const values = await S.dialog(`
    ${S.dialogTitle("New plastic category")}
    ${S.field({ id: "name", label: "Name" })}
    ${S.field({ id: "note", label: "Examples", hint: "What goes in this category" })}
    <div class="grid grid-cols-3 gap-3">
      ${CONDITIONS.map((condition) => S.field({ id: condition, label: S.cond(condition), type: "number" })).join("")}
    </div>
    ${S.field({ id: "source", label: "Rate source", hint: "Where these numbers come from" })}
    ${S.ui.dialogButtons("Add category")}`, {
    name: [[(v) => v.length >= 2, "Give the category a name."]],
    clean: isRate,
    light: isRate,
    heavy: isRate,
    source: [[(v) => v, "Say where these rates come from."]],
  });
  if (!values) return;

  const id = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (S.db.find("categories", id)) return S.toast("That category already exists.", "red");
  S.db.insert("categories", { id, name: values.name, note: values.note, icon: "recycle" });
  S.db.insert("rates", {
    id, clean: +values.clean, light: +values.light, heavy: +values.heavy, source: values.source, updated: now(),
  });
  S.toast(`${values.name} added.`);
  renderRates();
});

function renderLocations() {
  S.render(S.$("#locations"), S.db.all("locations").map((place) => `
    <li class="badge tone-blue !py-1.5 !text-sm before:hidden">${S.ui.icon("map-pin")}${S.esc(place)}</li>`).join(""));
}

S.$("#locationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const place = e.target.place.value.trim();
  if (S.db.all("locations").includes(place)) return S.toast("That location is already listed.", "red");
  S.db.insert("locations", place);
  e.target.reset();
  renderLocations();
});

renderRates();
renderLocations();
