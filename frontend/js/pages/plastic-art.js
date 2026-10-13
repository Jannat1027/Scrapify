// Plastic shapes (bottle, jug, bag) drawn by the hero card. Use them with piece().
const PLASTIC_SHAPES = `
  <defs>
    <symbol id="bottle" viewBox="0 0 24 60">
      <rect x="8.5" width="7" height="6" rx="2" fill="#2c7a57"/>
      <path d="M8 6h8v6c4 3 6 7 6 12v30a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V24c0-5 2-9 6-12z"
        fill="currentColor" fill-opacity=".55" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 30h14M5 36h14" stroke="#fff" stroke-width="2"/>
    </symbol>
    <symbol id="jug" viewBox="0 0 50 56">
      <path d="M14 2h12v8h10c6 0 10 4 10 10v30a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V22c0-6 4-12 10-12z"
        fill="currentColor" fill-opacity=".75"/>
      <path d="M31 18h6v14h-6" stroke="#fff" stroke-width="3" fill="none"/>
    </symbol>
    <symbol id="bag" viewBox="0 0 60 50">
      <path d="M6 14c8-6 14 4 22-2s16-8 26 0l-4 30c-10 6-30 8-42 2z" fill="currentColor" fill-opacity=".5"/>
      <path d="M14 16c4 6 2 14 6 20M34 12c-2 8 4 16 2 26" stroke="#fff" stroke-width="2" fill="none"/>
    </symbol>
  </defs>`;

const piece = (id, x, y, w, h, rotate, color) => `
  <use href="#${id}" x="${x}" y="${y}" width="${w}" height="${h}" style="color: ${color}"
    transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})"/>`;
