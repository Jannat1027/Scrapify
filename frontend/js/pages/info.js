// Plastic guide: the five categories with today's clean rate, photo tips, and the company pages.
const TIPS = [
  ["layers", "One layer, from above", "Spread the batch flat so every piece is visible to the camera."],
  ["sun", "Use good light", "Daylight or a bright bulb. Dark photos lower confidence."],
  ["droplets", "Drain and shake", "Empty liquids first. Wet plastic is graded as soiled."],
  ["split", "One batch per photo", "Keep different piles apart so the mix is measured correctly."],
];

const COMPANY_PAGES = [
  ["about", "info", "About",
    "Scrapify helps scrap shops, NGO collection points and recyclers in Bangladesh " +
    "trade plastic at transparent prices. " +
    "One shared device per collection point is enough."],
  ["contact", "mail", "Contact",
    "Email support@scrapify.app or call +880 1700-000000, Sunday to Thursday, 9am to 6pm. " +
    "For account approvals, include your shop name and location."],
  ["privacy", "lock", "Privacy policy",
    "We store account details, scan photos and transaction records to run the marketplace. " +
    "Photos are only shown to verified recyclers. We never sell personal data."],
  ["terms", "scale", "Terms and conditions",
    "AI grades are estimates. Operators confirm every result before listing. " +
    "Claims are fixed-price and binding once accepted, and disputes go through the report system."],
];

S.render(S.$("#categories"), S.db.all("categories").map((category) => `
  <article class="glass lift overflow-hidden p-3">
    ${S.ui.thumb(category.id, "h-28")}
    <div class="p-3">
      <h3 class="font-semibold">${S.esc(category.name)}</h3>
      <p class="mt-1 text-sm muted">${S.esc(category.note)}</p>
      <p class="mt-4 text-xs muted">Clean rate</p>
      <p class="text-lg font-bold text-gradient">${S.taka(S.db.find("rates", category.id).clean)}/kg</p>
    </div>
  </article>`).join(""));

S.render(S.$("#tips"), TIPS.map(([icon, title, text]) => `
  <li class="glass flex gap-4 p-5">
    <span class="icon-tile">${S.ui.icon(icon)}</span>
    <div>
      <h3 class="font-semibold">${title}</h3>
      <p class="mt-1 text-sm muted">${text}</p>
    </div>
  </li>`).join(""));

S.render(S.$("#pages"), COMPANY_PAGES.map(([id, icon, title, text]) => `
  <article id="${id}" class="glass scroll-mt-28 p-8">
    <div class="flex items-center gap-3">
      <span class="icon-tile">${S.ui.icon(icon)}</span>
      <h2 class="text-xl font-bold">${title}</h2>
    </div>
    <p class="mt-4 leading-relaxed muted">${text}</p>
  </article>`).join(""));

if (location.hash) S.$(location.hash)?.scrollIntoView();
