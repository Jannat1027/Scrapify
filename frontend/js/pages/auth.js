// Login and sign-up share one page. The story panel slides over whichever form isn't in use
// and plays a different illustrated story for each (story-litter.js and story-shop.js).
const auth = S.$("#auth");
const art = S.$("#art");
const BEAT_MS = 4000;
let beatTimer = null;

S.$$("[data-topbar]").forEach((bar) => {
  S.render(bar, `
    <a href="index.html" class="btn btn-ghost btn-sm -ml-3">${S.ui.icon("arrow-left")}${S.t("auth.home")}</a>
    ${S.ui.langButton("lg:hidden")}`);
});

S.render(art, `
  <div class="glass relative flex h-full flex-col overflow-hidden p-8">
    <div class="blob -right-24 -top-24 h-96 w-96 bg-mint/40 blur-3xl"></div>
    <div class="blob -bottom-24 -left-16 h-80 w-80 bg-sky-300/40 blur-3xl"></div>
    <div class="flex items-center justify-between">${S.ui.brand()}${S.ui.langButton()}</div>
    <div class="my-auto pt-6">
      <p id="storyTag" class="eyebrow"></p>
      <div id="scene" class="mt-3 aspect-[400/260] overflow-hidden rounded-3xl shadow-glass"></div>
      <div id="caption" class="mt-6 min-h-[4.5rem]"></div>
      <div id="beats" class="mt-5 flex gap-2"></div>
    </div>
  </div>`);

// Shows one beat of the story: its layers play, the caption changes and the progress bars advance.
function beat(story, index) {
  const { beats } = S.STORIES[story];
  S.$$("[data-beat]", art).forEach((layer) => {
    const show = layer.dataset.beat.split(",").includes(String(index));
    if (show && layer.hasAttribute("hidden")) {
      layer.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      layer.removeAttribute("hidden");
      S.motion.play(layer);
    }
    if (!show) layer.setAttribute("hidden", "");
  });

  const [title, text] = beats[index];
  S.render(S.$("#caption"), `
    <p class="animate-rise text-xl font-bold tracking-tight">${title}</p>
    <p class="mt-1 animate-rise muted">${text}</p>`);
  S.motion.steps(S.$$("#beats i", art), index, BEAT_MS);

  clearTimeout(beatTimer);
  beatTimer = setTimeout(() => beat(story, (index + 1) % beats.length), BEAT_MS);
}

function tell(story) {
  const { svg, tag, beats } = S.STORIES[story];
  S.render(S.$("#scene"), svg);
  S.$("#storyTag").textContent = tag;
  S.$$("[data-beat]", art).forEach((layer) => layer.setAttribute("hidden", ""));
  S.motion.play(S.$("#scene svg"));

  const bar = `<span class="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
    <i class="block h-full w-0 rounded-full bg-mint"></i></span>`;
  S.render(S.$("#beats"), beats.map(() => bar).join(""));
  beat(story, 0);
}

// Swaps forms: the panel slides across, and the story changes while it is moving.
function switchTo(mode, instant = false) {
  const register = mode === "register";
  auth.dataset.mode = mode;
  art.style.transform = register ? "translateX(calc(-100% - 1rem))" : "";
  S.$$("[data-form]").forEach((section) => {
    const active = section.dataset.form === mode;
    section.inert = !active;
    section.classList.toggle("lg:opacity-0", !active);
  });
  document.title = register ? "Create account · Scrapify" : "Log in · Scrapify";
  history.replaceState(null, "", register ? "?mode=register" : location.pathname);
  setTimeout(() => tell(mode), instant ? 0 : 450);
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-switch]");
  if (!link) return;
  e.preventDefault();
  switchTo(link.dataset.switch);
});

art.style.transition = "none";
switchTo(S.param("mode") === "register" ? "register" : "login", true);
requestAnimationFrame(() => requestAnimationFrame(() => (art.style.transition = "")));
