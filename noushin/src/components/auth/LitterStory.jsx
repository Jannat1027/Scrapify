import { Coin, logoUrl, Phone, Pill, Place, SkyGradient } from "./storyParts.jsx";

export const LITTER_STORY = {
  tag: "Why Scrapify exists",
  beats: [
    { title: "Plastic gets dropped anywhere", text: "At home, at work, on the factory floor. Most of it lands wherever is easiest." },
    { title: "It chokes drains and rivers", text: "Streets flood, rivers clog, and only a small share is ever collected." },
    { title: "Scrapify makes collecting worth it", text: "One photo grades the batch, and a verified recycler buys it the same day." },
    { title: "And every kilo pays", text: "The people collecting earn a fair price, and the river stays clean." },
  ],
};

const HANDS = { person: [115, 124], robot: [215, 126] };
const LITTER = [
  ["bottle", "person", 55, 196, "#38bdf8"],
  ["bag", "person", 150, 204, "#84cc16"],
  ["bottle", "person", 255, 236, "#0ea5e9"],
  ["can", "robot", 300, 232, "#f87171"],
  ["bottle", "robot", 345, 198, "#7dd3fc"],
  ["bottle", "robot", 230, 205, "#38bdf8"],
];
const BIN = [352, 146];
const COIN_SPOTS = [[80, 96], [112, 84], [170, 86], [206, 96]];

function LitterShape({ shape, color, className }) {
  return <use href={`#litter-${shape}`} style={{ color }} className={className} />;
}

function Person() {
  return (
    <Place x={95} y={118} move="bob">
      <path d="M-9 52v28M7 52v28" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      <rect x="-14" y="20" width="28" height="38" rx="11" fill="#f59e0b" />
      <path d="M-12 28l-6 22M10 26l10-20" stroke="#f1c19b" strokeWidth="7" strokeLinecap="round" />
      <circle cy="8" r="11" fill="#f1c19b" />
      <path d="M-11 6a11 11 0 0 1 22 0q-5-6-11-3-6-3-11 3z" fill="#3f3f46" />
      <circle cx="-4" cy="9" r="1.4" fill="#1f2d27" />
      <circle cx="4" cy="9" r="1.4" fill="#1f2d27" />
    </Place>
  );
}

function Robot() {
  return (
    <Place x={185} y={112} move="bob" delay={400}>
      <path d="M0 0v-9" stroke="#64748b" strokeWidth="2" />
      <circle cy="-11" r="3.2" fill="#f87171" />
      <rect x="-16" width="32" height="24" rx="7" fill="#cbd5e1" />
      <rect x="-12" y="6" width="24" height="11" rx="5" fill="#1f2d27" />
      <circle cx="-5" cy="11.5" r="2.4" fill="#67e8f9" />
      <circle cx="5" cy="11.5" r="2.4" fill="#67e8f9" />
      <rect x="-18" y="28" width="36" height="36" rx="9" fill="#94a3b8" />
      <rect x="-8" y="36" width="16" height="10" rx="2" fill="#e2e8f0" />
      <path d="M-20 34l-4 22M18 34l12-20" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
      <path d="M-9 64v18M9 64v18" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
    </Place>
  );
}

function ScrapifyBin() {
  return (
    <>
      <path d="M-20-16h40l-5 40h-30z" fill="#3f9e74" />
      <path d="M-24-20h48" stroke="#2c7a57" strokeWidth="4" strokeLinecap="round" />
      <image href={logoUrl} x="-9" y="-6" width="18" height="18" />
    </>
  );
}

function Sprout() {
  return (
    <path
      d="M0 0v-10M0-6c-6-1-8-6-7-9 4 0 7 3 7 9zM0-8c5-2 8-6 7-9-4 0-7 4-7 9z"
      fill="#3f9e74"
      stroke="#2c7a57"
    />
  );
}

export default function LitterStory({ beat }) {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
      <defs>
        <SkyGradient id="litter-sky" top="#e0f2fe" bottom="#f0fdf4" />
        <g id="litter-bottle">
          <rect x="-4" y="-10" width="8" height="19" rx="3" fill="currentColor" fillOpacity=".85" />
          <rect x="-2" y="-13" width="4" height="4" rx="1" fill="#2c7a57" />
        </g>
        <path id="litter-bag" d="M-9-5q4-6 9 0 5-6 9 0l-2 13h-14z" fill="currentColor" fillOpacity=".8" />
        <g id="litter-can">
          <rect x="-4" y="-7" width="8" height="14" rx="2" fill="currentColor" />
        </g>
      </defs>

      <rect width="400" height="260" fill="url(#litter-sky)" />
      <circle cx="330" cy="50" r="22" fill="#fde68a" />
      <path d="M0 196q100-16 200-4t200-6V260H0z" fill="#cfe8d6" />
      <path d="M200 228q50-10 100 2t100-6V260H190z" fill="#9bd3ee" />
      <circle cx="30" cy="170" r="20" fill="#86c99f" />
      <rect x="28" y="180" width="4" height="18" fill="#7c6f5b" />
      <Person />
      <Robot />

      {beat === 0 && (
        <g>
          {LITTER.map(([shape, thrower, x, y, color], index) => {
            const [handX, handY] = HANDS[thrower];
            return (
              <Place key={index} x={handX} y={handY} move="throw" dx={x - handX} dy={y - handY} delay={index * 380}>
                <LitterShape shape={shape} color={color} />
              </Place>
            );
          })}
        </g>
      )}

      {beat === 1 && (
        <g>
          <rect width="400" height="260" fill="#64748b" fillOpacity=".22" className="animate-move-fade" />
          <g className="animate-move-fade" style={{ animationDelay: "200ms" }} fill="#94a3b8" fillOpacity=".6">
            <ellipse cx="90" cy="40" rx="50" ry="16" />
            <ellipse cx="140" cy="30" rx="40" ry="14" />
          </g>
          {LITTER.map(([shape, , x, y, color], index) => (
            <g key={index} transform={`translate(${x} ${y}) rotate(90)`}>
              <LitterShape shape={shape} color={color} className={y > 225 ? "animate-move-bob" : undefined} />
            </g>
          ))}
          <Pill x={300} y={206} width={92} text="River blocked" fill="#ef4444" delay={900} size={10} />
        </g>
      )}

      {beat === 2 && (
        <g>
          <Place x={200} y={66} move="pop">
            <Phone scanning />
          </Place>
          <Place x={BIN[0]} y={BIN[1] + 4} move="pop" delay={200}>
            <ScrapifyBin />
          </Place>
          {LITTER.map(([shape, , x, y, color], index) => (
            <Place key={index} x={x} y={y} move="fly" dx={BIN[0] - x} dy={BIN[1] - y} delay={700 + index * 250}>
              <LitterShape shape={shape} color={color} />
            </Place>
          ))}
        </g>
      )}

      {beat === 3 && (
        <g>
          {COIN_SPOTS.map(([x, y], index) => (
            <Coin key={index} x={x} y={y} delay={index * 200} />
          ))}
          {LITTER.slice(0, 4).map(([, , x, y], index) => (
            <Place key={index} x={x} y={y} move="pop" delay={700 + index * 150}>
              <Sprout />
            </Place>
          ))}
          <Pill x={300} y={64} width={120} text="+৳2,300 for 62 kg" delay={1200} size={12} />
        </g>
      )}
    </svg>
  );
}
