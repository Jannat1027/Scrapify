// Public pages: fills <header data-nav> with the navbar and <footer data-footer> with the footer.
(() => {
  const { ui, t, base } = S;
  const link = (href, label, className = "") => `<a href="${base}${href}" class="${className}">${label}</a>`;
  const links = (items, className) => items.map(([href, label]) => link(href, label, className)).join("");

  const NAV = [
    ["index.html#how", t("nav.how")],
    ["index.html#why", "Why Scrapify"],
    ["index.html#roles", t("nav.roles")],
    ["info.html", t("nav.info")],
  ];

  const FOOTER_COLUMNS = {
    Product: [["index.html#how", "How it works"], ["index.html#why", "Why Scrapify"],
      ["info.html", "Plastic guide"], ["info.html#tips", "Photo tips"]],
    "Get started": [["register.html", "Create an account"], ["login.html", "Log in"],
      ["index.html#roles", "For recyclers"], ["info.html#contact", "Talk to us"]],
    Company: [["info.html#about", "About"], ["info.html#contact", "Contact"],
      ["info.html#privacy", "Privacy policy"], ["info.html#terms", "Terms of use"]],
  };

  S.$("[data-nav]")?.insertAdjacentHTML("afterbegin", `
    <div class="wrap sticky top-4 z-40 mt-4">
      <nav class="glass flex items-center justify-between gap-3 !rounded-full py-2 pl-5 pr-2">
        ${ui.brand()}
        <div class="hidden items-center gap-1 text-sm lg:flex">
          ${links(NAV, "rounded-full px-4 py-2 muted hover:bg-white/70 hover:text-ink")}
        </div>
        <div class="flex items-center gap-2">
          ${ui.langButton("max-sm:hidden")}
          ${link("login.html", t("nav.login"), "btn btn-ghost btn-sm max-sm:hidden")}
          ${link("register.html", t("nav.join"), "btn btn-primary btn-sm")}
          <button id="navToggle" class="btn btn-icon btn-sm !w-9 lg:hidden"
            aria-label="Open menu" aria-expanded="false">
            ${ui.icon("menu")}
          </button>
        </div>
      </nav>
      <div id="navMenu" class="glass mt-2 hidden gap-1 p-3 lg:!hidden">
        ${links(NAV, "rounded-xl px-4 py-3 font-medium hover:bg-white/70")}
        <div class="mt-2 flex gap-2 border-t border-ink/10 pt-3">
          ${link("login.html", t("nav.login"), "btn flex-1")}${ui.langButton()}
        </div>
      </div>
    </div>`);

  // Phone menu: the toggle opens and closes it, and following a link closes it.
  const toggle = S.$("#navToggle");
  toggle?.addEventListener("click", () => {
    const open = S.$("#navMenu").classList.toggle("hidden") === false;
    S.$("#navMenu").classList.toggle("grid", open);
    toggle.setAttribute("aria-expanded", open);
  });
  S.$$("#navMenu a").forEach((a) => a.addEventListener("click", () => toggle.click()));

  S.$("[data-footer]")?.insertAdjacentHTML("afterbegin", `
    <div class="mt-28 border-t border-white/70 bg-white/45 shadow-glass backdrop-blur-2xl">
      <div class="wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          ${ui.brand()}
          <p class="mt-4 max-w-xs text-sm leading-relaxed muted">
            Fair, explainable prices for the plastic Bangladesh collects every day.
          </p>
          <a href="mailto:hello@scrapify.app" class="link mt-5 inline-flex items-center gap-2 text-sm">
            ${ui.icon("mail")}hello@scrapify.app
          </a>
          <div class="mt-5">${ui.langButton()}</div>
        </div>
        ${Object.entries(FOOTER_COLUMNS).map(([title, items]) => `
          <div>
            <p class="kicker">${title}</p>
            <ul class="mt-4 grid gap-3 text-sm">
              ${items.map(([href, label]) => `<li>${link(href, label, "muted hover:text-forest")}</li>`).join("")}
            </ul>
          </div>`).join("")}
      </div>
      <div class="border-t border-ink/10">
        <div class="wrap flex flex-wrap items-center justify-between gap-3 py-5 text-xs muted">
          <p>© ${new Date().getFullYear()} Scrapify. Made for scrap shops, NGOs and recyclers in Bangladesh.</p>
          <p class="flex items-center gap-1.5">
            ${ui.icon("info")}AI grades are estimates. Operators confirm every batch before it's listed.
          </p>
        </div>
      </div>
    </div>`);
})();
