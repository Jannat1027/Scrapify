// Small HTML builders shared across pages. Every value that comes from data goes through S.esc.
const CATEGORY_COLORS = { pet: "#38bdf8", hdpe: "#a78bfa", pp: "#fbbf24", film: "#84cc16", mixed: "#94a3b8" };
S.catColor = (id) => CATEGORY_COLORS[id] || "#94a3b8";

S.ui = {
  icon: (name, className = "") => `<i data-lucide="${name}" class="${className}"></i>`,

  // A small button for S.onAction. style is an extra class such as "btn-primary" or "btn-danger".
  action: (name, id, label, icon = "", style = "") => `
    <button class="btn btn-sm ${style}" data-action="${name}" data-id="${id}">
      ${icon && S.ui.icon(icon)}${label}
    </button>`,

  // A large radio tile, used for picking a role, a plastic type, a condition or a rating.
  choice: (group, value, label, { icon = "", checked = false, hint = "" } = {}) => `
    <label class="choice">
      <input class="sr-only" type="radio" name="${group}" value="${value}" ${checked ? "checked" : ""}>
      <span>
        ${icon && S.ui.icon(icon, "!h-6 !w-6")}${label}
        ${hint && `<small class="font-normal muted">${hint}</small>`}
      </span>
    </label>`,

  langButton: (className = "") => `<button class="btn btn-sm ${className}" data-lang>বাংলা</button>`,

  brand: () => `
    <a href="${S.base}index.html" class="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
      <img src="${S.base}assets/logo.svg" alt="" class="h-9 w-9 drop-shadow-lg">Scrapify
    </a>`,

  badge: (status) => `<span class="badge tone-${S.STATUS_TONE[status] || "blue"}">${S.t(`status.${status}`)}</span>`,

  confidence: (value) => {
    const tone = value >= 0.85 ? "green" : value >= S.LOW_CONFIDENCE ? "amber" : "red";
    return `<span class="badge tone-${tone}">${Math.round(value * 100)}% sure</span>`;
  },

  stat: ({ icon, label, value, hint = "" }) => `
    <div class="glass lift flex items-center gap-4 p-5">
      <span class="icon-tile">${S.ui.icon(icon)}</span>
      <div class="min-w-0">
        <p class="text-sm muted">${label}</p>
        <p class="text-2xl font-bold tracking-tight">${value}</p>
        ${hint && `<p class="text-xs text-ink/45">${hint}</p>`}
      </div>
    </div>`,

  // Amber banner for things that need attention, such as out-of-date rates.
  notice: (title, text) => `
    <div class="notice">
      <span class="icon-tile">${S.ui.icon("triangle-alert")}</span>
      <p><b class="text-amber-800">${title}</b> <span class="muted">${text}</span></p>
    </div>`,

  empty: (icon, text) => `
    <div class="grid place-items-center gap-3 py-14 text-center muted">
      ${S.ui.icon(icon, "!h-10 !w-10 text-ink/30")}
      <p>${text}</p>
    </div>`,

  // columns: [{ label, cell: (row) => html }]
  table: (columns, rows, emptyText = "Nothing here yet.") => {
    if (!rows.length) return S.ui.empty("inbox", emptyText);
    const head = columns.map((column) => `<th>${column.label}</th>`).join("");
    const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${column.cell(row)}</td>`).join("")}</tr>`);
    return `
      <div class="overflow-x-auto">
        <table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body.join("")}</tbody></table>
      </div>`;
  },

  // Labelled bars. rows: [label, value text, percent, colour]; colour can be any CSS background.
  meters: (rows) => rows.map(([label, value, percent, color]) => `
    <div>
      <div class="mb-1.5 flex justify-between text-sm"><span>${label}</span><b>${value}</b></div>
      <div class="meter !h-2"><i style="width: ${percent}%; background: ${color}"></i></div>
    </div>`).join(""),

  // One bar per plastic type in a composition.
  bars: (composition) => S.ui.meters(Object.entries(composition)
    .map(([id, percent]) => [S.esc(S.cat(id).name), `${percent}%`, percent, S.catColor(id)])),

  // Pill tabs. label(value) gives the text and count(value) the small number beside it.
  // Calls onChange with the active value and returns a redraw function to use after data changes.
  tabs(el, values, { label, count }, onChange) {
    let current = values[0];
    el.className = "inline-flex w-fit flex-wrap gap-1 rounded-full border border-ink/10 bg-white/60 p-1";
    const tab = (value) => `
      <button class="tab ${value === current ? "active" : ""}" data-value="${value}">
        ${label(value)} <span class="ml-1 text-xs opacity-60">${count(value)}</span>
      </button>`;
    const draw = () => {
      S.render(el, values.map(tab).join(""));
      onChange(current);
    };
    el.onclick = (e) => {
      const value = e.target.closest("[data-value]")?.dataset.value;
      if (!value) return;
      current = value;
      draw();
    };
    draw();
    return draw;
  },
};
