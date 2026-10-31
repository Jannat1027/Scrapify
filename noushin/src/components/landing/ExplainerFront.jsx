import CountUp from "../CountUp.jsx";
import Icon from "../Icon.jsx";
import { GrowBar, PlasticPiece, PlasticShapeDefs, StepTabs, TypeOut } from "./ExplainerParts.jsx";

export const FRONT_STEPS = [
  { icon: "camera", label: "Snap" },
  { icon: "scan-search", label: "Grade" },
  { icon: "calculator", label: "Price" },
  { icon: "handshake", label: "Sell" },
];

function DetectionBox({ left, top, width, height, label, delay }) {
  return (
    <div className="absolute rounded-lg border-2 border-white bg-white/10 animate-pop" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, animationDelay: `${delay}ms` }}>
      <span className="chip bg-ink absolute -top-3 left-2 px-2 py-0.5 text-[10px]">{label}</span>
    </div>
  );
}

function MixBar({ name, percent, color }) {
  return (
    <div className="grid grid-cols-[52px_1fr_34px] items-center gap-2 text-[0.75rem]">
      <span>{name}</span>
      <span className="meter">
        <GrowBar size={`${percent}%`} style={{ background: color }} />
      </span>
      <b>{`${percent}%`}</b>
    </div>
  );
}

export default function ExplainerFront({ step, runKey, onPick }) {
  const showBoxes = step === 1 || step === 2;

  return (
    <>
      <StepTabs steps={FRONT_STEPS} activeStep={step} runKey={runKey} onPick={onPick} />

      <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white/70 to-sky-50/40">
        <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <PlasticShapeDefs />
          <PlasticPiece shape="bottle" x={34} y={52} width={26} height={66} rotate={-24} color="#38bdf8" />
          <PlasticPiece shape="bottle" x={70} y={44} width={28} height={72} rotate={8} color="#0ea5e9" />
          <PlasticPiece shape="bottle" x={104} y={70} width={24} height={60} rotate={38} color="#7dd3fc" />
          <PlasticPiece shape="jug" x={150} y={58} width={58} height={64} rotate={-6} color="#a78bfa" />
          <PlasticPiece shape="bag" x={222} y={66} width={78} height={64} rotate={10} color="#84cc16" />
        </svg>

        {step === 0 && (
          <>
            <div className="absolute inset-3 animate-pulse rounded-xl border-2 border-dashed border-mint/70" />
            <div className="absolute inset-0 animate-flash bg-white" />
          </>
        )}
        {step === 1 && <div className="absolute inset-x-0 h-0.5 animate-scan-down bg-mint shadow-glow" />}
        {showBoxes && (
          <>
            <DetectionBox left={8} top={20} width={33} height={66} label="PET 60%" delay={500} />
            <DetectionBox left={45} top={26} width={22} height={48} label="HDPE 25%" delay={1100} />
            <DetectionBox left={69} top={30} width={26} height={46} label="Film 15%" delay={1700} />
          </>
        )}
        {step === 3 && (
          <div className="absolute inset-0 grid place-items-center bg-white/50 backdrop-blur-[4px] animate-rise">
            <span className="animate-stamp rounded-xl border-4 border-mint px-5 py-1 text-[1.875rem] font-extrabold uppercase tracking-widest text-forest">Claimed</span>
          </div>
        )}
      </div>

      <div className="relative mt-4 h-[118px] [&>*]:absolute [&>*]:inset-0">
        {step === 0 && (
          <div className="flex items-center gap-4 animate-rise">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-mint text-[1.5rem] text-white shadow-glow">
              <Icon name="camera" />
            </span>
            <div>
              <p className="font-semibold">Snap one photo of the batch</p>
              <p className="text-sm text-ink/60">Upload on the laptop, or scan a QR code and shoot with any phone.</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid content-center gap-2 animate-rise">
            <p className="flex justify-between text-sm font-semibold">
              AI is grading the mix <CountUp value={91} suffix="% sure" className="text-forest" />
            </p>
            <MixBar name="PET" percent={60} color="#38bdf8" />
            <MixBar name="HDPE" percent={25} color="#a78bfa" />
            <MixBar name="Film" percent={15} color="#84cc16" />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-[auto_1fr] items-center gap-5 animate-rise">
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3">
              <p className="text-xs text-ink/60">Weight</p>
              <p className="min-h-8 min-w-[4.5rem] text-[1.5rem] font-bold tabular-nums">
                <TypeOut text="62 kg" />
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/60">Fair price range</p>
              <p className="text-[1.875rem] font-extrabold tracking-tight text-gradient">
                ৳<CountUp value={2180} /> – <CountUp value={2420} />
              </p>
              <p className="text-xs text-ink/60">share × weight × today's admin rate</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-white/70 bg-white/60 flex items-center gap-4 !bottom-auto !top-1/2 -translate-y-1/2 p-4 animate-rise">
            <span className="icon-tile">
              <Icon name="factory" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Polymer Loop Ltd. claimed it</p>
              <p className="text-sm text-ink/60">62 kg mixed bottles · fixed price</p>
            </div>
            <p className="text-[1.25rem] font-bold text-forest">৳2,300</p>
          </div>
        )}
      </div>
    </>
  );
}
