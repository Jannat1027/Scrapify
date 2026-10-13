// Card builders for listings and categories, added to S.ui.
Object.assign(S.ui, {
  // A grid of cards, or a glass empty state spanning the whole grid when there is nothing to show.
  cards: (items, card, [icon, emptyText]) =>
    items.length
      ? items.map(card).join("")
      : `<div class="glass sm:col-span-2 xl:col-span-3">${S.ui.empty(icon, emptyText)}</div>`,

  // A soft coloured tile with the category icon, standing in for a batch photo.
  thumb: (category, size = "h-36") => `
    <div class="${size} grid place-items-center rounded-2xl border border-ink/10"
      style="background: radial-gradient(circle at 30% 20%, ${S.catColor(category)}55, transparent 70%)">
      ${S.ui.icon(S.cat(category).icon, "!h-10 !w-10 opacity-80")}
    </div>`,

  listingCard: (listing, actions = "") => {
    const fact = (label, value) => `
      <div><dt class="text-xs muted">${label}</dt><dd class="font-semibold">${value}</dd></div>`;
    return `
      <article class="glass lift flex flex-col gap-4 p-4">
        ${S.ui.thumb(listing.category)}
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold">${S.esc(S.cat(listing.category).name)}</h3>
            <p class="text-xs muted">${listing.id} · ${S.cond(listing.condition)}</p>
          </div>
          ${S.ui.badge(listing.status)}
        </div>
        <dl class="grid grid-cols-3 gap-2 text-sm">
          ${fact("Weight", `${listing.weight} kg`)}
          ${fact("Price", S.taka(listing.price))}
          ${fact("Per kg", S.taka(listing.price / listing.weight))}
        </dl>
        <p class="flex items-center gap-1.5 text-xs muted">
          ${S.ui.icon("map-pin")}${S.esc(listing.location)} · ${S.date(listing.created)}
        </p>
        ${actions && `<div class="mt-auto flex flex-wrap gap-2">${actions}</div>`}
      </article>`;
  },
});

// Table columns for a list of scans, shared by the operator dashboard and scan history.
S.scanColumn = {
  id: { label: "Scan", cell: (scan) => `<a class="link" href="scan-result.html?id=${scan.id}">${scan.id}</a>` },
  date: { label: "Date", cell: (scan) => S.date(scan.date) },
  type: { label: "Main type", cell: (scan) => S.esc(S.cat(S.mainCategory(scan.composition)).name) },
  condition: { label: "Condition", cell: (scan) => S.cond(scan.condition) },
  weight: { label: "Weight", cell: (scan) => `${scan.weight} kg` },
  confidence: {
    label: "Confidence",
    cell: (scan) => {
      const corrected = scan.corrected ? ` <span class="badge tone-violet">Corrected</span>` : "";
      return S.ui.confidence(scan.confidence) + corrected;
    },
  },
  estimate: {
    label: "Estimate",
    cell: (scan) => {
      const { low, high } = S.price(scan);
      return `<b>${S.taka(low)} – ${S.taka(high)}</b>`;
    },
  },
};
