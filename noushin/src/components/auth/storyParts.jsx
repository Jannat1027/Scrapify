import logoUrl from "../../assets/logo.svg";

const MOVES = {
  throw: "animate-move-throw",
  fly: "animate-move-fly",
  glide: "animate-move-glide",
  pop: "animate-move-pop",
  fade: "animate-move-fade",
  rise: "animate-move-rise",
  drop: "animate-move-drop",
  grow: "animate-move-grow !origin-left",
  drive: "animate-move-drive",
  draw: "animate-move-draw",
  bob: "animate-move-bob",
  scan: "animate-move-scan",
  sweep: "animate-move-sweep",
  wave: "animate-move-wave",
};

export function Place({ x, y, move = "", dx = 0, dy = 0, delay = 0, children }) {
  const motionStyle = { "--x": `${dx}px`, "--y": `${dy}px`, animationDelay: `${delay}ms` };
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={move ? MOVES[move] : undefined} style={motionStyle}>
        {children}
      </g>
    </g>
  );
}

export function Pill({ x, y, width, text, fill = "#2c7a57", color = "#fff", delay = 0, size = 11 }) {
  return (
    <Place x={x} y={y} move="pop" delay={delay}>
      <rect x={-width / 2} y="-14" width={width} height="28" rx="14" fill={fill} />
      <text y="4" textAnchor="middle" fontSize={size} fontWeight="700" fill={color}>
        {text}
      </text>
    </Place>
  );
}

export function Coin({ x, y, delay }) {
  return (
    <Place x={x} y={y} move="pop" delay={delay}>
      <circle r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e">
        ৳
      </text>
    </Place>
  );
}

export function Phone({ scanning = false }) {
  return (
    <>
      <rect x="-22" y="-38" width="44" height="76" rx="9" fill="#1f2d27" />
      <rect x="-18" y="-32" width="36" height="64" rx="5" fill="#f0fdf4" />
      <image href={logoUrl} x="-11" y="-11" width="22" height="22" />
      {scanning && <rect x="-18" y="-32" width="36" height="2" fill="#3f9e74" className="animate-move-scan" />}
    </>
  );
}

export function SkyGradient({ id, top, bottom }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop stopColor={top} />
      <stop offset="1" stopColor={bottom} />
    </linearGradient>
  );
}

export { logoUrl };
