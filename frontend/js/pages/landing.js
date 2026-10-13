// Landing page sections below the hero, built from the lists in landing-content.js.
// Cards fade in one after another as they scroll into view.
const reveal = (i, kind = "", step = 120) => `data-reveal="${kind}" style="--d: ${i * step}ms"`;

// Feature cards start scattered and tilted around the section, then fly together into the grid.
const SCATTER = [[-260, -140, -14], [0, -220, 9], [260, -140, 13], [-280, 160, 11], [0, 240, -9], [280, 160, -13]];
const scatter = (i) => {
  const [x, y, r] = SCATTER[i % SCATTER.length];
  return `data-reveal="scatter" style="--d: ${i * 90}ms; --x: ${x}px; --y: ${y}px; --r: ${r}deg"`;
};
const fill = (selector, items, card) => S.render(S.$(selector), items.map(card).join(""));

fill("#steps", STEPS, ([icon, time, title, text], i) => `
  <li ${reveal(i, "zoom", 220)} class="group cursor-pointer text-center" data-replay="${i}"
    title="Replay this step in the demo">
    <span class="glass relative mx-auto grid h-16 w-16 place-items-center !rounded-2xl text-2xl text-forest
      transition group-hover:-translate-y-1 group-hover:rotate-3">
      ${S.ui.icon(icon)}
      <span class="chip absolute -right-2 -top-2 bg-ink !px-2 !py-0.5 !text-[10px]">${time}</span>
    </span>
    <h3 class="mt-6 text-lg font-semibold">${title}</h3>
    <p class="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed muted">${text}</p>
    <span class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest
      opacity-0 group-hover:opacity-100">
      ${S.ui.icon("play")}See it in the demo
    </span>
  </li>`);

// One column of the before/after comparison.
const compareColumn = (title, icon, items, isNew) => `
  <div ${reveal(isNew ? 2 : 0, isNew ? "right" : "left")}
    class="glass p-7 sm:p-8 ${isNew ? "bg-white/50 ring-2 ring-mint/40" : ""}">
    <p class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest
      ${isNew ? "text-forest" : "text-ink/45"}">
      ${S.ui.icon(icon)}${title}
    </p>
    <ul class="mt-6 grid gap-4">
      ${items.map((text) => `
        <li class="flex gap-3 border-b border-ink/10 pb-4 last:border-0 last:pb-0">
          <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full
            ${isNew ? "bg-mint text-white" : "bg-ink/10 text-ink/50"}">
            ${S.ui.icon(isNew ? "check" : "x", "!h-3.5 !w-3.5")}
          </span>
          <span class="${isNew ? "font-medium" : "muted"}">${text}</span>
        </li>`).join("")}
    </ul>
  </div>`;

S.render(S.$("#compare"),
  compareColumn("The old way", "clock", BEFORE_AFTER.map(([before]) => before), false) +
  compareColumn("With Scrapify", "sparkles", BEFORE_AFTER.map(([, after]) => after), true));

fill("#numbers", NUMBERS, ([value, suffix, label], i) => `
  <div ${reveal(i, "zoom")}>
    <p class="text-4xl font-extrabold tracking-tight text-gradient" data-count="${value}" data-suffix="${suffix}">0</p>
    <p class="mt-1 text-sm muted">${label}</p>
  </div>`);

fill("#features", FEATURES, ([icon, title, text], i) => `
  <div ${scatter(i)} class="glass lift group h-full p-6">
    <span class="icon-tile transition group-hover:-rotate-6 group-hover:scale-110">${S.ui.icon(icon)}</span>
    <h3 class="mt-5 text-lg font-semibold">${title}</h3>
    <p class="mt-2 text-sm leading-relaxed muted">${text}</p>
  </div>`);

fill("#roleCards", ROLES, ({ icon, title, tint, href, cta, points }, i) => `
  <div ${reveal(i, "flip", 180)} class="glass lift flex flex-col bg-gradient-to-br ${tint} to-white/30 p-7">
    <span class="icon-tile">${S.ui.icon(icon)}</span>
    <h3 class="mt-5 text-xl font-bold">${title}</h3>
    <ul class="mt-4 grid flex-1 gap-2.5 text-sm">
      ${points.map((point) => `
        <li class="flex gap-2">${S.ui.icon("check", "mt-0.5 text-forest")}${point}</li>`).join("")}
    </ul>
    <a href="${href}" class="btn mt-6 self-start">${cta} ${S.ui.icon("arrow-right")}</a>
  </div>`);

fill("#trust", TRUST, ([icon, text]) => `
  <span class="flex items-center gap-2">${S.ui.icon(icon, "text-forest")}${text}</span>`);

// The timeline draws itself once it is on screen, and each step replays its moment in the hero demo.
new IntersectionObserver(([entry], observer) => {
  if (!entry.isIntersecting) return;
  S.$("#howLine").style.width = "100%";
  observer.disconnect();
}, { threshold: 0.4 }).observe(S.$("#steps"));

S.$("#steps").addEventListener("click", (e) => {
  const step = e.target.closest("[data-replay]")?.dataset.replay;
  if (step === undefined) return;
  S.explain(Number(step));
  S.$("#explainer").scrollIntoView({ behavior: "smooth", block: "center" });
});
