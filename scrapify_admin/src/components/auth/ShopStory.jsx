import { Coin, Phone, Pill, Place, SkyGradient } from "./storyParts.jsx";

export const SHOP_STORY = {
  tag: "What happens after you sign up",
  beats: [
    { title: "Put your shop on the map", text: "Six details and a minute of your time. No paperwork, no app to install." },
    { title: "A real person checks it", text: "Our team confirms every shop and recycler, usually within a day." },
    { title: "The approval lands in your inbox", text: "One email, one link, and your workspace is ready." },
    { title: "Buyers come to you", text: "Verified recyclers see your graded batches and collect at a fixed price." },
  ],
};

const FORM_LINES = [
  [-26, 60],
  [-8, 74],
  [10, 48],
];
const TRUCK_COINS = [[92, 104], [124, 92], [156, 102]];

function Shop() {
  return (
    <>
      <rect x="-62" y="-72" width="124" height="72" rx="4" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="-14" y="-40" width="28" height="40" rx="3" fill="#94a3b8" />
      <rect x="-50" y="-44" width="26" height="20" rx="3" fill="#bae6fd" />
      <rect x="24" y="-44" width="26" height="20" rx="3" fill="#bae6fd" />
    </>
  );
}

function Awning() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <path key={index} d={`M${-66 + index * 22} 0h22l-4 16h-14z`} fill={index % 2 ? "#a7d7b8" : "#3f9e74"} />
      ))}
      <rect x="-68" y="-4" width="136" height="6" rx="3" fill="#2c7a57" />
    </>
  );
}

function SignUpCard() {
  return (
    <>
      <rect x="-56" y="-46" width="112" height="92" rx="12" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
      {FORM_LINES.map(([y, width], index) => (
        <g key={y}>
          <rect x="-42" y={y} width="84" height="10" rx="5" fill="#e2e8f0" />
          <rect x="-42" y={y} width={width} height="10" rx="5" fill="#a7d7b8" className="animate-move-grow !origin-left" style={{ animationDelay: `${700 + index * 450}ms` }} />
        </g>
      ))}
      <rect x="-42" y="28" width="84" height="12" rx="6" fill="#3f9e74" className="animate-move-fade" style={{ animationDelay: "2100ms" }} />
    </>
  );
}

function Shield() {
  return (
    <>
      <path d="M0-26l22 8v14c0 16-10 26-22 30-12-4-22-14-22-30v-14z" fill="#3f9e74" />
      <path d="M-9 0l6 6 12-13" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Magnifier() {
  return (
    <>
      <circle r="16" fill="#fff" fillOpacity=".35" stroke="#1f2d27" strokeWidth="4" />
      <path d="M11 11l14 14" stroke="#1f2d27" strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function PaperPlane() {
  return (
    <>
      <path d="M0 0l30 10-30 10 6-10z" fill="#38bdf8" />
      <path d="M6 10h24" stroke="#0369a1" strokeWidth="1.5" />
    </>
  );
}

function Bale({ x, y, color }) {
  return <rect x={x} y={y} width="22" height="16" rx="3" fill={color} stroke="#fff" strokeWidth="1.5" />;
}

function Truck() {
  return (
    <>
      <rect y="-30" width="34" height="30" rx="6" fill="#38bdf8" />
      <rect x="5" y="-25" width="18" height="12" rx="2" fill="#e0f2fe" />
      <rect x="34" y="-36" width="70" height="36" rx="4" fill="#64748b" />
      <Bale x={40} y={-52} color="#7dd3fc" />
      <Bale x={64} y={-52} color="#a78bfa" />
      <Bale x={52} y={-66} color="#84cc16" />
      <circle cx="18" cy="2" r="8" fill="#1f2d27" />
      <circle cx="84" cy="2" r="8" fill="#1f2d27" />
    </>
  );
}

export default function ShopStory({ beat }) {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
      <defs>
        <SkyGradient id="shop-sky" top="#fef3c7" bottom="#f0fdf4" />
      </defs>
      <rect width="400" height="260" fill="url(#shop-sky)" />
      <circle cx="60" cy="52" r="20" fill="#fde68a" />
      <path d="M0 200h400v60H0z" fill="#cfe8d6" />
      <path d="M0 214h400v24H0z" fill="#d6dde3" />
      <path d="M0 226h400" stroke="#fff" strokeWidth="2" strokeDasharray="14 12" />

      <g transform="translate(130 200)">
        <g className="animate-move-rise">
          <Shop />
        </g>
        <Place x={0} y={-72} move="drop" delay={500}>
          <Awning />
        </Place>
        <Pill x={0} y={-90} width={92} text="GREEN BIN" fill="#1f2d27" delay={900} size={10} />
      </g>

      {beat === 0 && (
        <Place x={300} y={120} move="pop" delay={300}>
          <SignUpCard />
        </Place>
      )}

      {beat === 1 && (
        <g>
          <Place x={130} y={92} move="pop" delay={200}>
            <Shield />
          </Place>
          <Place x={130} y={160} move="sweep">
            <Magnifier />
          </Place>
          <Pill x={300} y={90} width={112} text="Verified by Scrapify" fill="#fff" color="#2c7a57" delay={900} />
        </g>
      )}

      {beat === 2 && (
        <g>
          <Place x={310} y={150} move="pop">
            <Phone />
          </Place>
          <Place x={30} y={50} move="glide" dx={270} dy={88} delay={300}>
            <PaperPlane />
          </Place>
          <Pill x={310} y={96} width={116} text="Account approved ✓" delay={1500} />
        </g>
      )}

      {beat === 3 && (
        <g>
          <Place x={280} y={188} move="drive" dx={200} dy={0}>
            <Truck />
          </Place>
          {TRUCK_COINS.map(([x, y], index) => (
            <Coin key={index} x={x} y={y} delay={1300 + index * 150} />
          ))}
          <Pill x={130} y={70} width={128} text="First sale · +৳8,650" delay={1800} />
        </g>
      )}
    </svg>
  );
}
