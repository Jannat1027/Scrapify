// Shared helpers: DOM, formatting, storage, session, language, toasts and page start-up.
const S = (() => {
  const base = document.currentScript.src.replace(/js\/core\.js.*$/, "");
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // localStorage can throw in private windows, so every access is guarded.
  const safely = (action, fallback) => {
    try {
      return action() ?? fallback;
    } catch {
      return fallback;
    }
  };
  const keyOf = (key) => `scrapify.${key}`;
  const store = {
    get: (key, fallback) => safely(() => JSON.parse(localStorage.getItem(keyOf(key))), fallback),
    set: (key, value) => safely(() => localStorage.setItem(keyOf(key), JSON.stringify(value))),
    remove: (key) => safely(() => localStorage.removeItem(keyOf(key))),
  };

  const session = {
    get: () => store.get("session", null),
    set: (user) => store.set("session", user),
    clear: () => store.remove("session"),
  };

  const lang = store.get("lang", "en");
  // English label for "group.name" from labels.js; unknown keys come back unchanged.
  const t = (key) => {
    const [group, name] = key.split(".");
    return S.LABELS?.[group]?.[name] ?? key;
  };

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const taka = (amount) => `৳${Math.round(amount).toLocaleString("en-IN")}`;
  const date = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const daysSince = (iso) => Math.floor((Date.now() - new Date(iso)) / 864e5);
  const param = (name) => new URLSearchParams(location.search).get(name);
  const uid = (prefix) => `${prefix}-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const go = (path) => location.assign(base + path);
  const make = (tag, props) => Object.assign(document.createElement(tag), props);

  function render(el, html) {
    el.innerHTML = html;
    window.lucide?.createIcons();
  }

  const TOAST_HOST = "fixed bottom-5 right-5 z-50 grid gap-2";
  function toast(message, tone = "green") {
    const host = $("#toasts") || document.body.appendChild(make("div", { id: "toasts", className: TOAST_HOST }));
    const el = make("div", { className: "glass flex animate-rise items-center gap-3 px-4 py-3 text-sm" });
    const [icon, color] = tone === "red" ? ["circle-alert", "text-red-500"] : ["circle-check", "text-forest"];
    render(el, `<i data-lucide="${icon}" class="${color}"></i>${esc(message)}`);
    host.append(el);
    setTimeout(() => el.remove(), 3200);
  }

  // Click delegation: a button with data-action="name" and data-id calls handlers[name](id, button).
  function onAction(root, handlers) {
    root.addEventListener("click", (e) => {
      const button = e.target.closest("[data-action]");
      if (button && handlers[button.dataset.action]) handlers[button.dataset.action](button.dataset.id, button);
    });
  }

  // Called by app.js once every script has loaded.
  function start() {
    document.documentElement.lang = lang;
    $$("[data-lang]").forEach((button) => {
      button.textContent = lang === "bn" ? "English" : "বাংলা";
      button.onclick = () => {
        store.set("lang", lang === "bn" ? "en" : "bn");
        location.reload();
      };
    });
    S.motion.watch();
    window.lucide?.createIcons();
  }

  return {
    base, $, $$, store, session, lang, t, esc, taka, date, daysSince,
    param, uid, go, make, render, toast, onAction, start,
  };
})();
