// Back of the hero card: what one trade changes for the shop, the recycler and the river.
const BACK_STEPS = [["store", "Shop"], ["factory", "Recycler"], ["waves", "River"]];

const BACK_CAPTIONS = [
  ["The shop earns what the batch is worth",
    "Same 62 kg, priced from the real mix instead of a guess. The shop keeps ৳600 more on one batch."],
  ["The recycler buys without the trip",
    "Photos, grades and a fixed price arrive on screen, so buyers stop losing hours checking piles in person."],
  ["Less plastic ends up in the river",
    "When collecting pays fairly, more people collect. Every graded batch goes back into new products."],
];

// One price column that grows from zero when its scene starts.
const column = (label, amount, height, color, delay) => `
  <div class="flex h-full flex-col items-center justify-end gap-2">
    <b class="text-lg tabular-nums">৳<span data-count="${amount}">0</span></b>
    <span class="block w-16 rounded-t-xl transition-[height] duration-1000 ease-out" data-height="${height}%"
      style="height: 0; background: ${color}; transition-delay: ${delay}ms"></span>
    <span class="text-[11px] font-semibold muted">${label}</span>
  </div>`;

const GLYPHS = {
  shop: "M-7 -1h14v8h-14z M-8 -1l2-6h12l2 6 M-2 7v-4h4v4",
  plant: "M-8 7v-8l5 3v-3l5 3v-3l4 2v-6h2v12z",
};

// A map pin with a small glyph and a label underneath.
const pin = (x, y, glyph, label) => `
  <circle cx="${x}" cy="${y}" r="16" fill="#fff" stroke="#3f9e74" stroke-width="2"/>
  <path transform="translate(${x} ${y})" d="${GLYPHS[glyph]}"
    fill="none" stroke="#2c7a57" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="${x}" y="${y + 32}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2d27">${label}</text>`;

// A bottle floating on the river that later flies into the bin.
const floater = ([x, y, rotate, color, dx, dy, delay]) => `
  <g data-fly="${dx} ${dy} ${delay + 600}">
    <use href="#bottle" x="${x}" y="${y}" width="18" height="44" style="color: ${color}"
      transform="rotate(${rotate} ${x + 9} ${y + 22})"/>
  </g>`;

const FLOATERS = [
  [60, 112, -30, "#38bdf8", 195, -82, 200],
  [120, 118, 25, "#0ea5e9", 140, -88, 600],
  [180, 110, -10, "#7dd3fc", 80, -80, 1000],
];

const ROUTE = "M58 118 C120 150 170 20 262 58";
const WAVE = "M-40 140 q20 -10 40 0" + " t40 0".repeat(9) + " V180 H-40z";

const BACK = `
  ${pills(BACK_STEPS)}

  <div class="stage to-emerald-50/50">
    <div data-on="0" class="absolute inset-0 grid grid-cols-2 px-10 pb-3 pt-12">
      ${column("Guessed at the counter", 1700, 62, "rgba(31,45,39,.18)", 0)}
      ${column("Priced by Scrapify", 2300, 86, "linear-gradient(#5bbd8f, #2c7a57)", 250)}
      <div class="absolute inset-x-0 top-3 flex justify-center">
        <span class="chip animate-pop bg-mint shadow-glow [animation-delay:1.3s]">+৳600 on one batch</span>
      </div>
    </div>

    <svg data-on="1" viewBox="0 0 320 180" class="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d="${ROUTE}" fill="none" stroke="rgba(31,45,39,.12)" stroke-width="6" stroke-linecap="round"/>
      <path id="route" data-draw d="${ROUTE}" fill="none" stroke="#3f9e74" stroke-width="3"
        stroke-dasharray="1" pathLength="1" stroke-linecap="round"/>
      ${pin(58, 118, "shop", "Green Bin, Mirpur")}
      ${pin(262, 58, "plant", "Polymer Loop")}
      <g visibility="hidden">
        <rect x="-17" y="-12" width="34" height="24" rx="5" fill="#fff" stroke="#38bdf8" stroke-width="2"/>
        <circle r="5" fill="#38bdf8" fill-opacity=".5"/>
        <set attributeName="visibility" to="visible" begin="move.begin" fill="freeze"/>
        <animateMotion id="move" data-motion begin="indefinite" dur="1.8s" fill="freeze"
          calcMode="spline" keySplines=".5 0 .3 1" keyTimes="0;1">
          <mpath href="#route"/>
        </animateMotion>
      </g>
    </svg>
    <span data-on="1" class="chip absolute bottom-4 right-4 animate-pop bg-ink [animation-delay:1.9s]">
      No inspection trip
    </span>

    <svg data-on="2" viewBox="0 0 320 180" class="absolute inset-0 h-full w-full" aria-hidden="true">
      <path data-wave d="${WAVE}" fill="#7dd3fc" fill-opacity=".55"/>
      <path d="M252 30h44l-5 44h-34z" fill="#3f9e74"/>
      <path d="M264 38l2 28M274 38v28M284 38l-2 28" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M248 26h52M266 26v-5h16v5" stroke="#2c7a57" stroke-width="3" stroke-linecap="round" fill="none"/>
      ${FLOATERS.map(floater).join("")}
    </svg>
    <p data-on="2" class="absolute left-5 top-4 text-sm font-semibold">
      <span class="text-3xl font-extrabold text-forest" data-count="62" data-suffix=" kg">0</span><br>
      out of the river, into new products
    </p>
  </div>

  <div class="caption">
    ${BACK_CAPTIONS.map(([title, text], step) => `
      <div data-on="${step}" class="grid content-center gap-1">
        <p class="font-semibold">${title}</p>
        <p class="text-sm leading-relaxed muted">${text}</p>
      </div>`).join("")}
  </div>`;
