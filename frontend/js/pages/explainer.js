// Hero card behaviour. The front plays a trade, then the card flips and the back shows what that trade changes.
// The card never moves while a side is playing. Click a tab to jump, hover to pause.
const STEP_MS = 4200;
const FLIP_MS = 900;

const hero = S.$("#explainer");
const face = (html, isBack) => `
  <div class="glass p-5 [backface-visibility:hidden] [grid-area:1/1] ${isBack ? "[transform:rotateY(180deg)]" : ""}">
    ${html}
  </div>`;

S.render(hero, `
  <div class="grid transition-transform ease-[cubic-bezier(.7,0,.3,1)] [transform-style:preserve-3d]"
    style="transition-duration: ${FLIP_MS}ms">
    ${face(FRONT)}${face(BACK, true)}
  </div>`);

const card = hero.firstElementChild;
const faces = [...card.children];
const SIDES = [FRONT_STEPS.length, BACK_STEPS.length];
const at = { side: 0, step: 0 };
let timer = null;
let paused = false;

// Grows a bar from zero to the size in its data attribute.
const growTo = (property) => (el) => {
  el.style[property] = "0";
  setTimeout(() => (el.style[property] = el.dataset[property]), 350);
};

// Types text one letter at a time.
const typeOut = (el) => {
  const text = el.dataset.type;
  [...text].forEach((_, i) => setTimeout(() => (el.textContent = text.slice(0, i + 1)), 250 + i * 180));
};

// Effects that restart every time their layer appears. SVG moves come from S.motion.play.
const EFFECTS = {
  "[data-count]": (el) => S.motion.countUp(el),
  "[data-type]": typeOut,
  "[data-width]": growTo("width"),
  "[data-height]": growTo("height"),
  "[data-motion]": (el) => el.beginElement(),
};

function startLayer(layer) {
  layer.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
  Object.entries(EFFECTS).forEach(([selector, run]) => S.$$(selector, layer).forEach(run));
  S.motion.play(layer);
}

// Shows one step of one side: its layers start, the tabs highlight and the progress bar runs.
function show(side, step) {
  const root = faces[side];
  S.$$("[data-on]", root).forEach((layer) => {
    const visible = layer.dataset.on.split(",").includes(String(step));
    if (visible && layer.hasAttribute("hidden")) startLayer(layer);
    layer.toggleAttribute("hidden", !visible);
  });

  S.$$("[data-step]", root).forEach((tab, i) => {
    tab.classList.toggle("text-ink", i === step);
    tab.classList.toggle("text-ink/50", i !== step);
  });
  S.motion.steps(S.$$("[data-step] i", root), step, paused ? 0 : STEP_MS);

  if (!paused) timer = setTimeout(next, STEP_MS);
}

function go(side, step) {
  clearTimeout(timer);
  const flipping = side !== at.side;
  Object.assign(at, { side, step });
  card.style.transform = side ? "rotateY(180deg)" : "";
  timer = setTimeout(() => show(side, step), flipping ? FLIP_MS * 0.7 : 0);
}

const next = () => (at.step + 1 < SIDES[at.side] ? go(at.side, at.step + 1) : go(1 - at.side, 0));

hero.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-step]");
  if (tab) go(faces.indexOf(tab.closest(".glass")), Number(tab.dataset.step));
});

hero.addEventListener("pointerenter", () => {
  paused = true;
  clearTimeout(timer);
  const bar = S.$$("[data-step] i", faces[at.side])[at.step];
  bar.style.width = getComputedStyle(bar).width;
  bar.style.transition = "none";
});

hero.addEventListener("pointerleave", () => {
  paused = false;
  go(at.side, at.step);
});

S.$$("[data-on]", hero).forEach((layer) => layer.setAttribute("hidden", ""));
S.explain = (step, side = 0) => go(side, step);
go(0, 0);
