// Loads everything a page needs, in order, then starts the app.
// Usage: <script src="js/app.js" data-page="landing" data-libs="chart"></script>
(() => {
  const tag = document.currentScript;
  const root = tag.src.replace(/js\/app\.js.*$/, "");
  const list = (value) => (value || "").split(" ").filter(Boolean);

  const LIBS = {
    icons: "https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js",
    chart: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js",
    qr: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  };
  const SHARED = ["core", "labels", "motion", "data", "db", "domain", "ui", "cards", "forms", "dialogs"];
  const CATALOGS = ["rules", "common", "home", "site", "auth", "operator", "market", "admin"];
  const BANGLA = [...CATALOGS.map((name) => `lang/bn-${name}`), "translate"];

  const libs = list(tag.dataset.libs);
  const chrome = document.body.dataset.role ? "shell" : "site";
  const charts = libs.includes("chart") ? ["charts"] : [];
  const pages = list(tag.dataset.page).map((name) => `pages/${name}`);
  const bangla = localStorage.getItem("scrapify.lang") === '"bn"' ? BANGLA : [];

  const files = [
    ...["icons", ...libs].map((name) => LIBS[name]),
    ...[...SHARED, ...charts, chrome, ...pages, ...bangla].map((name) => `${root}js/${name}.js`),
  ];

  // async = false keeps execution in list order while the files download in parallel.
  const load = (src) =>
    new Promise((done) => {
      const script = Object.assign(document.createElement("script"), { src, async: false });
      script.onload = script.onerror = done;
      document.body.append(script);
    });

  if (bangla.length) document.documentElement.style.opacity = "0";
  Promise.all(files.map(load)).then(() => S.start());
})();
