// Drawing helpers shared by the login and sign-up stories (story-litter.js, story-shop.js).
S.STORIES = {};

S.art = {
  // Places a shape at x, y and attaches a motion from S.motion, e.g. place(10, 20, 'data-pop="300"', shape).
  place: (x, y, motion, shape) => `<g transform="translate(${x} ${y})"><g ${motion}>${shape}</g></g>`,

  // A rounded label centred on x, y that pops in after `delay` ms.
  pill: (x, y, width, text, { fill = "#2c7a57", color = "#fff", delay = 0, size = 11 } = {}) =>
    S.art.place(x, y, `data-pop="${delay}"`, `
      <rect x="${-width / 2}" y="-14" width="${width}" height="28" rx="14" fill="${fill}"/>
      <text y="4" text-anchor="middle" font-size="${size}" font-weight="700" fill="${color}">${text}</text>`),

  // A gold taka coin that pops in after `delay` ms.
  coin: (x, y, delay) =>
    S.art.place(x, y, `data-pop="${delay}"`, `
      <circle r="9" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
      <text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#92400e">৳</text>`),

  // A phone showing the Scrapify logo, optionally with a scan line sweeping over the screen.
  phone: (scanning = false) => `
    <rect x="-22" y="-38" width="44" height="76" rx="9" fill="#1f2d27"/>
    <rect x="-18" y="-32" width="36" height="64" rx="5" fill="#f0fdf4"/>
    <image href="assets/logo.svg" x="-11" y="-11" width="22" height="22"/>
    ${scanning ? `<rect x="-18" y="-32" width="36" height="2" fill="#3f9e74" data-scan/>` : ""}`,

  // A sky gradient from `top` to `bottom`, used as a story's backdrop.
  sky: (id, top, bottom) => `
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/>
    </linearGradient>`,
};
