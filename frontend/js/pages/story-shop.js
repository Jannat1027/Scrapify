// Sign-up story: your shop goes up, gets verified, the approval email lands, and the first buyer arrives.
(() => {
  const { place, pill, coin, sky, phone } = S.art;

  const SHOP = `
    <rect x="-62" y="-72" width="124" height="72" rx="4" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="-14" y="-40" width="28" height="40" rx="3" fill="#94a3b8"/>
    <rect x="-50" y="-44" width="26" height="20" rx="3" fill="#bae6fd"/>
    <rect x="24" y="-44" width="26" height="20" rx="3" fill="#bae6fd"/>`;

  const AWNING = [0, 1, 2, 3, 4, 5]
    .map((i) => `<path d="M${-66 + i * 22} 0h22l-4 16h-14z" fill="${i % 2 ? "#a7d7b8" : "#3f9e74"}"/>`)
    .join("") + `<rect x="-68" y="-4" width="136" height="6" rx="3" fill="#2c7a57"/>`;

  // A sign-up form whose three fields fill in one after another, then the button appears.
  const FORM = `
    <rect x="-56" y="-46" width="112" height="92" rx="12" fill="#fff" stroke="#e2e8f0" stroke-width="2"/>
    ${[[-26, 60], [-8, 74], [10, 48]].map(([y, width], i) => `
      <rect x="-42" y="${y}" width="84" height="10" rx="5" fill="#e2e8f0"/>
      <rect x="-42" y="${y}" width="${width}" height="10" rx="5" fill="#a7d7b8"
        data-grow="${700 + i * 450}"/>`).join("")}
    <rect x="-42" y="28" width="84" height="12" rx="6" fill="#3f9e74" data-fade="2100"/>`;

  const SHIELD = `
    <path d="M0-26l22 8v14c0 16-10 26-22 30-12-4-22-14-22-30v-14z" fill="#3f9e74"/>
    <path d="M-9 0l6 6 12-13" stroke="#fff" stroke-width="4" fill="none"
      stroke-linecap="round" stroke-linejoin="round"/>`;

  const MAGNIFIER = `
    <circle r="16" fill="#fff" fill-opacity=".35" stroke="#1f2d27" stroke-width="4"/>
    <path d="M11 11l14 14" stroke="#1f2d27" stroke-width="6" stroke-linecap="round"/>`;

  const PAPER_PLANE = `
    <path d="M0 0l30 10-30 10 6-10z" fill="#38bdf8"/>
    <path d="M6 10h24" stroke="#0369a1" stroke-width="1.5"/>`;

  const bale = (x, y, color) => `
    <rect x="${x}" y="${y}" width="22" height="16" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;

  const TRUCK = `
    <rect y="-30" width="34" height="30" rx="6" fill="#38bdf8"/>
    <rect x="5" y="-25" width="18" height="12" rx="2" fill="#e0f2fe"/>
    <rect x="34" y="-36" width="70" height="36" rx="4" fill="#64748b"/>
    ${bale(40, -52, "#7dd3fc")}${bale(64, -52, "#a78bfa")}${bale(52, -66, "#84cc16")}
    <circle cx="18" cy="2" r="8" fill="#1f2d27"/>
    <circle cx="84" cy="2" r="8" fill="#1f2d27"/>`;

  S.STORIES.register = {
    tag: "What happens after you sign up",
    beats: [
      ["Put your shop on the map", "Six details and a minute of your time. No paperwork, no app to install."],
      ["A real person checks it", "Our team confirms every shop and recycler, usually within a day."],
      ["The approval lands in your inbox", "One email, one link, and your workspace is ready."],
      ["Buyers come to you", "Verified recyclers see your graded batches and collect at a fixed price."],
    ],
    svg: `
      <svg viewBox="0 0 400 260" class="h-full w-full" aria-hidden="true">
        <defs>${sky("shop-sky", "#fef3c7", "#f0fdf4")}</defs>
        <rect width="400" height="260" fill="url(#shop-sky)"/>
        <circle cx="60" cy="52" r="20" fill="#fde68a"/>
        <path d="M0 200h400v60H0z" fill="#cfe8d6"/>
        <path d="M0 214h400v24H0z" fill="#d6dde3"/>
        <path d="M0 226h400" stroke="#fff" stroke-width="2" stroke-dasharray="14 12"/>

        <g data-beat="0,1,2,3" transform="translate(130 200)">
          <g data-rise="0">${SHOP}</g>
          ${place(0, -72, 'data-drop="500"', AWNING)}
          ${pill(0, -90, 92, "GREEN BIN", { fill: "#1f2d27", delay: 900, size: 10 })}
        </g>

        <g data-beat="0">${place(300, 120, 'data-pop="300"', FORM)}</g>

        <g data-beat="1">
          ${place(130, 92, 'data-pop="200"', SHIELD)}
          ${place(130, 160, "data-sweep", MAGNIFIER)}
          ${pill(300, 90, 112, "Verified by Scrapify", { fill: "#fff", color: "#2c7a57", delay: 900 })}
        </g>

        <g data-beat="2">
          ${place(310, 150, 'data-pop="0"', phone())}
          ${place(30, 50, 'data-glide="270 88 300"', PAPER_PLANE)}
          ${pill(310, 96, 116, "Account approved ✓", { delay: 1500 })}
        </g>

        <g data-beat="3">
          ${place(280, 188, 'data-drive="200 0"', TRUCK)}
          ${[[92, 104], [124, 92], [156, 102]].map(([x, y], i) => coin(x, y, 1300 + i * 150)).join("")}
          ${pill(130, 70, 128, "First sale · +৳8,650", { delay: 1800 })}
        </g>
      </svg>`,
  };
})();
