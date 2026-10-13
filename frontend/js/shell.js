// Workspace pages: <body data-role="operator"> plus a <main>, which gets wrapped with the sidebar and top bar.
(() => {
  const { ui, t, esc, base } = S;

  const MENU = {
    operator: [
      ["side.dashboard", "layout-dashboard", "operator/dashboard.html"],
      ["side.newScan", "scan-line", "operator/new-scan.html"],
      ["side.history", "history", "operator/scan-history.html"],
      ["side.listings", "tags", "operator/my-listings.html"],
    ],
    recycler: [
      ["side.browse", "store", "recycler/browse-listings.html"],
      ["side.claims", "package-check", "recycler/my-claims.html"],
    ],
    admin: [
      ["side.dashboard", "chart-pie", "admin/dashboard.html"],
      ["side.users", "users", "admin/manage-users.html"],
      ["side.rates", "badge-dollar-sign", "admin/price-rates.html"],
      ["side.reports", "flag", "admin/reported-issues.html"],
    ],
  };

  const role = document.body.dataset.role;
  const user = S.session.get();

  // Signed-out visitors go to login; signed-in users on another role's page go to their own home.
  if (!user) return S.go(`login.html?next=${encodeURIComponent(location.href)}`);
  if (user.role !== role) return S.go(S.HOME[user.role]);

  const sideLink = ([key, icon, path]) => {
    const active = location.pathname.endsWith(path) ? "active" : "";
    return `<a href="${base}${path}" class="side-link ${active}">${ui.icon(icon)}${t(key)}</a>`;
  };
  const initials = user.name.split(" ").map((word) => word[0]).join("").slice(0, 2);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const main = S.$("main");
  main.className = "grid min-w-0 content-start gap-5";

  const layout = S.make("div", { className: "grid min-h-screen gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)]" });
  layout.innerHTML = `
    <aside id="sidebar" class="sidebar">
      <div class="px-2 pb-6">${ui.brand()}</div>
      <p class="px-3 pb-2 text-[11px] uppercase tracking-widest text-ink/45">${t("side.workspace")}</p>
      ${MENU[role].map(sideLink).join("")}
      ${sideLink(["side.help", "book-open", "info.html"])}
      <div class="well mt-auto">
        <p class="truncate text-sm font-semibold">${esc(user.org)}</p>
        <p class="truncate text-xs muted">${t(`role.${role}`)} · ${esc(user.location)}</p>
        <button data-logout class="btn btn-sm mt-3 w-full">${ui.icon("log-out")}${t("nav.logout")}</button>
      </div>
    </aside>

    <div class="grid min-w-0 content-start gap-5">
      <header class="glass flex items-center justify-between gap-3 px-4 py-3">
        <div class="flex items-center gap-3">
          <button data-menu class="btn btn-icon lg:hidden" aria-label="Open menu">${ui.icon("menu")}</button>
          <p class="text-sm muted max-sm:hidden">${today}</p>
        </div>
        <div class="flex items-center gap-3">
          ${ui.langButton()}
          <span class="grid h-10 w-10 place-items-center rounded-full bg-mint/15 text-sm font-bold text-forest"
            title="${esc(user.name)}">${esc(initials)}</span>
        </div>
      </header>
    </div>`;

  main.replaceWith(layout);
  layout.lastElementChild.append(main);

  S.$("[data-menu]").onclick = () => S.$("#sidebar").classList.toggle("open");
  S.$("[data-logout]").onclick = () => {
    S.session.clear();
    S.go("login.html");
  };
})();
