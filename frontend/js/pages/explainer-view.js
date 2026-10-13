// Front of the hero card: one trade from photo to sale. Each [data-on] layer shows on the listed steps.
const FRONT_STEPS = [["camera", "Snap"], ["scan-search", "Grade"], ["calculator", "Price"], ["handshake", "Sell"]];

// Step tabs, each with its own progress bar. Shared with the back of the card.
const pills = (steps) => `
  <div class="grid gap-1.5" style="grid-template-columns: repeat(${steps.length}, minmax(0, 1fr))">
    ${steps.map(([icon, label], i) => `
      <button data-step="${i}" class="step-tab">
        <span class="flex items-center gap-1.5">${S.ui.icon(icon)}${label}</span>
        <span class="meter !h-1"><i class="bg-mint"></i></span>
      </button>`).join("")}
  </div>`;

// A detection box the AI draws around one plastic type.
const box = (left, top, width, height, label, delay) => `
  <div data-on="1,2" class="absolute animate-pop rounded-lg border-2 border-white bg-white/10"
    style="left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%; animation-delay: ${delay}ms">
    <span class="chip absolute -top-3 left-2 bg-ink !px-2 !py-0.5 !text-[10px]">${label}</span>
  </div>`;

const bar = (name, percent, color) => `
  <div class="grid grid-cols-[52px_1fr_34px] items-center gap-2 text-xs">
    <span>${name}</span>
    <span class="meter"><i data-width="${percent}%" style="background: ${color}"></i></span>
    <b>${percent}%</b>
  </div>`;

const FRONT = `
  ${pills(FRONT_STEPS)}

  <div class="stage to-sky-50/40">
    <svg viewBox="0 0 320 180" class="absolute inset-0 h-full w-full" aria-hidden="true">
      ${PLASTIC_SHAPES}
      ${piece("bottle", 34, 52, 26, 66, -24, "#38bdf8")}
      ${piece("bottle", 70, 44, 28, 72, 8, "#0ea5e9")}
      ${piece("bottle", 104, 70, 24, 60, 38, "#7dd3fc")}
      ${piece("jug", 150, 58, 58, 64, -6, "#a78bfa")}
      ${piece("bag", 222, 66, 78, 64, 10, "#84cc16")}
    </svg>
    <div data-on="0" class="absolute inset-3 animate-pulse rounded-xl border-2 border-dashed border-mint/70"></div>
    <div data-on="0" class="absolute inset-0 animate-flash bg-white [animation-delay:2.2s]"></div>
    <div data-on="1" class="absolute inset-x-0 h-0.5 animate-scan bg-mint shadow-glow"></div>
    ${box(8, 20, 33, 66, "PET 60%", 500)}
    ${box(45, 26, 22, 48, "HDPE 25%", 1100)}
    ${box(69, 30, 26, 46, "Film 15%", 1700)}
    <div data-on="3" class="absolute inset-0 grid animate-rise place-items-center bg-white/50 backdrop-blur-sm">
      <span class="animate-stamp rounded-xl border-4 border-mint px-5 py-1 text-3xl font-extrabold uppercase
        tracking-widest text-forest [animation-delay:.9s]">Claimed</span>
    </div>
  </div>

  <div class="caption">
    <div data-on="0" class="flex items-center gap-4">
      <span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-mint text-2xl text-white shadow-glow">
        ${S.ui.icon("camera")}
      </span>
      <div>
        <p class="font-semibold">Snap one photo of the batch</p>
        <p class="text-sm muted">Upload on the laptop, or scan a QR code and shoot with any phone.</p>
      </div>
    </div>

    <div data-on="1" class="grid content-center gap-2">
      <p class="flex justify-between text-sm font-semibold">
        AI is grading the mix <span class="text-forest" data-count="91" data-suffix="% sure">0</span>
      </p>
      ${bar("PET", 60, "#38bdf8")}
      ${bar("HDPE", 25, "#a78bfa")}
      ${bar("Film", 15, "#84cc16")}
    </div>

    <div data-on="2" class="grid grid-cols-[auto_1fr] items-center gap-5">
      <div class="frosted px-4 py-3">
        <p class="text-xs muted">Weight</p>
        <p class="text-2xl font-bold tabular-nums" data-type="62 kg"></p>
      </div>
      <div>
        <p class="text-xs muted">Fair price range</p>
        <p class="text-3xl font-extrabold tracking-tight text-gradient">
          ৳<span data-count="2180">0</span> – <span data-count="2420">0</span>
        </p>
        <p class="text-xs muted">share × weight × today's admin rate</p>
      </div>
    </div>

    <div data-on="3" class="frosted flex items-center gap-4 p-4">
      <span class="icon-tile">${S.ui.icon("factory")}</span>
      <div class="min-w-0 flex-1">
        <p class="font-semibold">Polymer Loop Ltd. claimed it</p>
        <p class="text-sm muted">62 kg mixed bottles · fixed price</p>
      </div>
      <p class="text-xl font-bold text-forest">৳2,300</p>
    </div>
  </div>`;
