import { useEffect, useRef } from "react";
import CountUp from "../CountUp.jsx";
import { GrowBar, StepTabs } from "./ExplainerParts.jsx";

export const BACK_STEPS = [
  { icon: "store", label: "Shop" },
  { icon: "factory", label: "Recycler" },
  { icon: "waves", label: "River" },
];

const CAPTIONS = [
  {
    title: "The shop earns what the batch is worth",
    text: "Same 62 kg, priced from the real mix instead of a guess. The shop keeps ৳600 more on one batch.",
  },
  {
    title: "The recycler buys without the trip",
    text: "Photos, grades and a fixed price arrive on screen, so buyers stop losing hours checking piles in person.",
  },
  {
    title: "Less plastic ends up in the river",
    text: "When collecting pays fairly, more people collect. Every graded batch goes back into new products.",
  },
];

const ROUTE = "M58 118 C120 150 170 20 262 58";
const WAVE = "M-40 140 q20 -10 40 0" + " t40 0".repeat(9) + " V180 H-40z";
const GLYPHS = {
  shop: "M-7 -1h14v8h-14z M-8 -1l2-6h12l2 6 M-2 7v-4h4v4",
  plant: "M-8 7v-8l5 3v-3l5 3v-3l4 2v-6h2v12z",
};
const FLOATERS = [
  [60, 112, -30, "#38bdf8", 195, -82, 800],
  [120, 118, 25, "#0ea5e9", 140, -88, 1200],
  [180, 110, -10, "#7dd3fc", 80, -80, 1600],
];

function PriceColumn({ label, amount, height, color, delay }) {
  return (
    <div className="flex h-full flex-col items-center justify-end gap-2 text-center">
      <b className="text-[1.125rem] tabular-nums">
        ৳<CountUp value={amount} />
      </b>
      <GrowBar className="block w-16 rounded-t-xl transition-[height] duration-1000 ease-out" direction="height" size={`${height}%`} style={{ background: color, transitionDelay: `${delay}ms` }} />
      <span className="text-xs text-ink/60 font-semibold">{label}</span>
    </div>
  );
}

function MapPin({ x, y, glyph, label }) {
  return (
    <>
      <circle cx={x} cy={y} r="16" fill="#fff" stroke="#3f9e74" strokeWidth="2" />
      <path transform={`translate(${x} ${y})`} d={GLYPHS[glyph]} fill="none" stroke="#2c7a57" strokeWidth="1.6" strokeLinejoin="round" />
      <text x={x} y={y + 32} textAnchor="middle" fontSize="10" fontWeight="600" fill="#1f2d27">
        {label}
      </text>
    </>
  );
}

function RouteScene() {
  const motionRef = useRef(null);
  useEffect(() => {
    motionRef.current?.beginElement?.();
  }, []);

  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d={ROUTE} fill="none" stroke="rgba(31,45,39,.12)" strokeWidth="6" strokeLinecap="round" />
      <path id="route" className="animate-move-draw" d={ROUTE} fill="none" stroke="#3f9e74" strokeWidth="3" strokeDasharray="1" pathLength="1" strokeLinecap="round" />
      <MapPin x={58} y={118} glyph="shop" label="Green Bin, Mirpur" />
      <MapPin x={262} y={58} glyph="plant" label="Polymer Loop" />
      <g visibility="hidden">
        <rect x="-17" y="-12" width="34" height="24" rx="5" fill="#fff" stroke="#38bdf8" strokeWidth="2" />
        <circle r="5" fill="#38bdf8" fillOpacity=".5" />
        <set attributeName="visibility" to="visible" begin="truckMove.begin" fill="freeze" />
        <animateMotion
          id="truckMove"
          ref={motionRef}
          begin="indefinite"
          dur="1.8s"
          fill="freeze"
          calcMode="spline"
          keySplines=".5 0 .3 1"
          keyTimes="0;1"
        >
          <mpath href="#route" />
        </animateMotion>
      </g>
    </svg>
  );
}

function RiverScene() {
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path className="animate-move-wave" d={WAVE} fill="#7dd3fc" fillOpacity=".55" />
      <path d="M252 30h44l-5 44h-34z" fill="#3f9e74" />
      <path d="M264 38l2 28M274 38v28M284 38l-2 28" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M248 26h52M266 26v-5h16v5" stroke="#2c7a57" strokeWidth="3" strokeLinecap="round" fill="none" />
      {FLOATERS.map(([x, y, tilt, color, toX, toY, delay]) => (
        <g key={x} className="animate-move-fly" style={{ "--x": `${toX}px`, "--y": `${toY}px`, animationDelay: `${delay}ms` }}>
          <use href="#bottle" x={x} y={y} width="18" height="44" style={{ color }} transform={`rotate(${tilt} ${x + 9} ${y + 22})`} />
        </g>
      ))}
    </svg>
  );
}

export default function ExplainerBack({ step, runKey, onPick }) {
  const caption = CAPTIONS[step];

  return (
    <>
      <StepTabs steps={BACK_STEPS} activeStep={step} runKey={runKey} onPick={onPick} />

      <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white/70 to-emerald-50/50">
        {step === 0 && (
          <div className="absolute inset-0 grid grid-cols-2 px-10 pb-3 pt-12">
            <PriceColumn label="Guessed at the counter" amount={1700} height={62} color="rgba(31,45,39,.18)" delay={0} />
            <PriceColumn label="Priced by Scrapify" amount={2300} height={86} color="linear-gradient(#5bbd8f, #2c7a57)" delay={250} />
            <div className="absolute inset-x-0 top-3 flex justify-center">
              <span className="chip bg-mint shadow-glow animate-pop" style={{ animationDelay: "1.3s" }}>
                +৳600 on one batch
              </span>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <RouteScene />
            <span className="chip bg-ink absolute bottom-4 right-4 animate-pop" style={{ animationDelay: "1.9s" }}>
              No inspection trip
            </span>
          </>
        )}

        {step === 2 && (
          <>
            <RiverScene />
            <p className="absolute left-5 top-4 text-sm font-semibold">
              <CountUp value={62} suffix=" kg" className="text-[1.875rem] font-extrabold text-forest" />
              <br />
              out of the river, into new products
            </p>
          </>
        )}
      </div>

      <div className="relative mt-4 h-[118px] [&>*]:absolute [&>*]:inset-0">
        {caption && (
          <div key={step} className="grid content-center gap-2 animate-rise">
            <p className="font-semibold">{caption.title}</p>
            <p className="text-sm text-ink/60">{caption.text}</p>
          </div>
        )}
      </div>
    </>
  );
}
