// Motion shared by every page: counters, scroll reveals, the glass spotlight, step bars and SVG moves.
S.motion = (() => {
  // Eases a number up from zero, reading data-count and data-suffix.
  function countUp(el, ms = 1300) {
    let start = null;
    const tick = (now) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / ms);
      const value = Math.round(el.dataset.count * (1 - (1 - progress) ** 3));
      el.textContent = value.toLocaleString("en-IN") + (el.dataset.suffix || "");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Sections marked data-reveal fade up the first time they scroll into view, and their counters start.
  const revealer = new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach(({ target }) => {
        target.classList.add("in");
        // Once it has arrived, drop the reveal styles so hover effects aren't delayed or slowed.
        target.addEventListener("transitionend", () => target.removeAttribute("data-reveal"), { once: true });
        S.$$("[data-count]", target).forEach((el) => countUp(el));
        revealer.unobserve(target);
      });
  }, { threshold: 0.15 });
  const watch = () => S.$$("[data-reveal]").forEach((el) => revealer.observe(el));

  // Soft light that follows the cursor across whichever glass panel it is over.
  let litPanel = null;
  document.addEventListener("pointermove", (e) => {
    const panel = e.target.closest?.(".glass");
    if (litPanel && litPanel !== panel) litPanel.style.removeProperty("--mx");
    litPanel = panel;
    if (!panel) return;
    const box = panel.getBoundingClientRect();
    panel.style.setProperty("--mx", `${e.clientX - box.left}px`);
    panel.style.setProperty("--my", `${e.clientY - box.top}px`);
  });

  // Step progress bars: earlier steps full, the current one fills over `ms` (0 = paused), later ones empty.
  function steps(bars, current, ms) {
    bars.forEach((bar, i) => {
      bar.style.transition = "none";
      bar.style.width = i < current ? "100%" : "0";
    });
    if (!ms) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      Object.assign(bars[current].style, { transition: `width ${ms}ms linear`, width: "100%" });
    }));
  }

  // SVG moves, triggered by data attributes such as data-fly="dx dy delay" or data-pop="delay".
  const EASE = "cubic-bezier(.3,.1,.3,1)";
  const once = (duration, delay = 0, easing = EASE) => ({ duration, delay, easing });
  const loop = (duration, delay = 0) => ({
    duration, delay, iterations: Infinity, direction: "alternate", easing: "ease-in-out",
  });
  const at = (x, y, extra = "") => `translate(${x}px, ${y}px) ${extra}`;
  const still = { transform: "none", opacity: 1 };

  const MOVES = {
    throw: ([x, y, delay]) => [
      [
        still,
        { transform: at(x / 2, Math.min(y, 0) - 60, "rotate(200deg)") },
        { transform: at(x, y, "rotate(450deg)") },
      ],
      once(1100, delay),
    ],
    fly: ([x, y, delay]) => [[still, { transform: at(x, y, "scale(.3)"), opacity: 0 }], once(1000, delay)],
    glide: ([x, y, delay]) => [
      [still, { transform: at(x / 2, y / 2 - 40, "rotate(8deg)") }, { transform: at(x, y, "scale(.6)"), opacity: 0 }],
      once(1500, delay, "ease-in-out"),
    ],
    pop: ([delay]) => [
      [{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1.15)", opacity: 1, offset: 0.7 }, still],
      once(500, delay, "ease-out"),
    ],
    fade: ([delay]) => [[{ opacity: 0 }, { opacity: 1 }], once(700, delay)],
    rise: ([delay]) => [[{ transform: "translateY(24px)", opacity: 0 }, still], once(700, delay)],
    drop: ([delay]) => [[{ transform: "translateY(-50px)", opacity: 0 }, still], once(600, delay, "ease-out")],
    grow: ([delay]) => [[{ transform: "scaleX(0)" }, still], once(500, delay)],
    drive: ([x, y]) => [[{ transform: at(x, y) }, still], once(1300, 0, "cubic-bezier(.2,.7,.2,1)")],
    draw: () => [[{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], once(1800, 0, "ease-in-out")],
    bob: ([delay = 0]) => [[still, { transform: "translateY(-4px)" }], loop(1400, delay)],
    scan: () => [[still, { transform: "translateY(58px)" }], loop(1200)],
    sweep: () => [[{ transform: "translateX(-50px)" }, { transform: "translateX(50px)" }], loop(1300)],
    wave: () => [[still, { transform: "translateX(-40px)" }], loop(2400)],
  };
  const SELECTOR = Object.keys(MOVES).map((name) => `[data-${name}]`).join(",");

  // Plays every move inside root (and on root itself), restarting any that already ran.
  function play(root) {
    [root, ...S.$$(SELECTOR, root)]
      .filter((el) => el.matches(SELECTOR))
      .forEach((el) => {
        const name = Object.keys(MOVES).find((key) => key in el.dataset);
        const [frames, timing] = MOVES[name](el.dataset[name].split(" ").filter(Boolean).map(Number));
        el.style.transformBox = "fill-box";
        el.style.transformOrigin = name === "grow" ? "left center" : "center";
        el.animate(frames, { fill: "both", ...timing });
      });
  }

  return { countUp, watch, steps, play };
})();
