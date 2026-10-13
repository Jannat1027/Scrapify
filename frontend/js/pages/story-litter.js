// Login story: a person and a robot litter, the river suffers, Scrapify collects it, and everyone gets paid.
// Each <g data-beat> shows on the listed beats; the data-* motions inside are played by S.motion.
(() => {
  const { place, pill, coin, sky, phone } = S.art;

  const HANDS = { person: [115, 124], robot: [215, 126] };
  const LITTER = [ // [shape, thrown by, lands at x, y, colour]
    ["bottle", "person", 55, 196, "#38bdf8"],
    ["bag", "person", 150, 204, "#84cc16"],
    ["bottle", "person", 255, 236, "#0ea5e9"],
    ["can", "robot", 300, 232, "#f87171"],
    ["bottle", "robot", 345, 198, "#7dd3fc"],
    ["bottle", "robot", 230, 205, "#38bdf8"],
  ];
  const BIN = [352, 146];
  const shape = (id, color, extra = "") => `<use href="#litter-${id}" style="color: ${color}" ${extra}/>`;

  const PERSON = place(95, 118, "data-bob", `
    <path d="M-9 52v28M7 52v28" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
    <rect x="-14" y="20" width="28" height="38" rx="11" fill="#f59e0b"/>
    <path d="M-12 28l-6 22M10 26l10-20" stroke="#f1c19b" stroke-width="7" stroke-linecap="round"/>
    <circle cy="8" r="11" fill="#f1c19b"/>
    <path d="M-11 6a11 11 0 0 1 22 0q-5-6-11-3-6-3-11 3z" fill="#3f3f46"/>
    <circle cx="-4" cy="9" r="1.4" fill="#1f2d27"/>
    <circle cx="4" cy="9" r="1.4" fill="#1f2d27"/>`);

  const ROBOT = place(185, 112, 'data-bob="400"', `
    <path d="M0 0v-9" stroke="#64748b" stroke-width="2"/>
    <circle cy="-11" r="3.2" fill="#f87171"/>
    <rect x="-16" width="32" height="24" rx="7" fill="#cbd5e1"/>
    <rect x="-12" y="6" width="24" height="11" rx="5" fill="#1f2d27"/>
    <circle cx="-5" cy="11.5" r="2.4" fill="#67e8f9"/>
    <circle cx="5" cy="11.5" r="2.4" fill="#67e8f9"/>
    <rect x="-18" y="28" width="36" height="36" rx="9" fill="#94a3b8"/>
    <rect x="-8" y="36" width="16" height="10" rx="2" fill="#e2e8f0"/>
    <path d="M-20 34l-4 22M18 34l12-20" stroke="#64748b" stroke-width="7" stroke-linecap="round"/>
    <path d="M-9 64v18M9 64v18" stroke="#64748b" stroke-width="9" stroke-linecap="round"/>`);

  const SCRAPIFY_BIN = `
    <path d="M-20-16h40l-5 40h-30z" fill="#3f9e74"/>
    <path d="M-24-20h48" stroke="#2c7a57" stroke-width="4" stroke-linecap="round"/>
    <image href="assets/logo.svg" x="-9" y="-6" width="18" height="18"/>`;

  const SPROUT = `<path d="M0 0v-10M0-6c-6-1-8-6-7-9 4 0 7 3 7 9zM0-8c5-2 8-6 7-9-4 0-7 4-7 9z"
    fill="#3f9e74" stroke="#2c7a57"/>`;

  // Beat 0: each piece flies from a hand to where it lands. Beat 2: it flies from there into the bin.
  const thrown = LITTER.map(([id, by, x, y, color], i) => {
    const [handX, handY] = HANDS[by];
    return place(handX, handY, `data-throw="${x - handX} ${y - handY} ${i * 380}"`, shape(id, color));
  });
  const lying = LITTER.map(([id, , x, y, color]) =>
    `<g transform="translate(${x} ${y}) rotate(90)">${shape(id, color, y > 225 ? "data-bob" : "")}</g>`);
  const collected = LITTER.map(([id, , x, y, color], i) =>
    place(x, y, `data-fly="${BIN[0] - x} ${BIN[1] - y} ${700 + i * 250}"`, shape(id, color)));

  S.STORIES.login = {
    tag: "Why Scrapify exists",
    beats: [
      ["Plastic gets dropped anywhere",
        "At home, at work, on the factory floor. Most of it lands wherever is easiest."],
      ["It chokes drains and rivers", "Streets flood, rivers clog, and only a small share is ever collected."],
      ["Scrapify makes collecting worth it",
        "One photo grades the batch, and a verified recycler buys it the same day."],
      ["And every kilo pays", "The people collecting earn a fair price, and the river stays clean."],
    ],
    svg: `
      <svg viewBox="0 0 400 260" class="h-full w-full" aria-hidden="true">
        <defs>
          ${sky("litter-sky", "#e0f2fe", "#f0fdf4")}
          <g id="litter-bottle">
            <rect x="-4" y="-10" width="8" height="19" rx="3" fill="currentColor" fill-opacity=".85"/>
            <rect x="-2" y="-13" width="4" height="4" rx="1" fill="#2c7a57"/>
          </g>
          <path id="litter-bag" d="M-9-5q4-6 9 0 5-6 9 0l-2 13h-14z" fill="currentColor" fill-opacity=".8"/>
          <g id="litter-can"><rect x="-4" y="-7" width="8" height="14" rx="2" fill="currentColor"/></g>
        </defs>
        <rect width="400" height="260" fill="url(#litter-sky)"/>
        <circle cx="330" cy="50" r="22" fill="#fde68a"/>
        <path d="M0 196q100-16 200-4t200-6V260H0z" fill="#cfe8d6"/>
        <path d="M200 228q50-10 100 2t100-6V260H190z" fill="#9bd3ee"/>
        <circle cx="30" cy="170" r="20" fill="#86c99f"/>
        <rect x="28" y="180" width="4" height="18" fill="#7c6f5b"/>
        ${PERSON}${ROBOT}

        <g data-beat="0">${thrown.join("")}</g>

        <g data-beat="1">
          <rect width="400" height="260" fill="#64748b" fill-opacity=".22" data-fade="0"/>
          <g data-fade="200" fill="#94a3b8" fill-opacity=".6">
            <ellipse cx="90" cy="40" rx="50" ry="16"/><ellipse cx="140" cy="30" rx="40" ry="14"/>
          </g>
          ${lying.join("")}
          ${pill(300, 206, 92, "River blocked", { fill: "#ef4444", delay: 900, size: 10 })}
        </g>

        <g data-beat="2">
          ${place(200, 66, 'data-pop="0"', phone(true))}
          ${place(BIN[0], BIN[1] + 4, 'data-pop="200"', SCRAPIFY_BIN)}
          ${collected.join("")}
        </g>

        <g data-beat="3">
          ${[[80, 96], [112, 84], [170, 86], [206, 96]].map(([x, y], i) => coin(x, y, i * 200)).join("")}
          ${LITTER.slice(0, 4).map(([, , x, y], i) => place(x, y, `data-pop="${700 + i * 150}"`, SPROUT)).join("")}
          ${pill(300, 64, 120, "+৳2,300 for 62 kg", { delay: 1200, size: 12 })}
        </g>
      </svg>`,
  };
})();
