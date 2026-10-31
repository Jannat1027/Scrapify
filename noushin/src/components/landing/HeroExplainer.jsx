import { useEffect, useRef, useState } from "react";
import ExplainerBack, { BACK_STEPS } from "./ExplainerBack.jsx";
import ExplainerFront, { FRONT_STEPS } from "./ExplainerFront.jsx";

const STEP_MS = 4200;
const FLIP_MS = 900;
const STEP_COUNTS = [FRONT_STEPS.length, BACK_STEPS.length];

export default function HeroExplainer({ replayRequest }) {
  const [side, setSide] = useState(0);
  const [frontStep, setFrontStep] = useState(0);
  const [backStep, setBackStep] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const flipTimer = useRef(null);

  const currentStep = side === 0 ? frontStep : backStep ?? 0;

  function goTo(newSide, newStep) {
    clearTimeout(flipTimer.current);
    const flipping = newSide !== side;
    setSide(newSide);

    function showStep() {
      if (newSide === 0) setFrontStep(newStep);
      else setBackStep(newStep);
      setRunKey((key) => key + 1);
    }

    if (flipping) flipTimer.current = setTimeout(showStep, FLIP_MS * 0.7);
    else showStep();
  }

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      if (currentStep + 1 < STEP_COUNTS[side]) goTo(side, currentStep + 1);
      else goTo(1 - side, 0);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [runKey, paused]);

  useEffect(() => {
    if (replayRequest) goTo(0, replayRequest.step);
  }, [replayRequest]);

  useEffect(() => () => clearTimeout(flipTimer.current), []);

  function handleMouseLeave() {
    setPaused(false);
    setRunKey((key) => key + 1);
  }

  return (
    <div
      className="group/explainer [perspective:1600px]"
      data-paused={paused}
      aria-label="How Scrapify works, animated"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={handleMouseLeave}
    >
      <div
        className={`grid transition-transform ease-[cubic-bezier(.7,0,.3,1)] [transform-style:preserve-3d] ${side === 1 ? "[transform:rotateY(180deg)]" : ""}`}
        style={{ transitionDuration: `${FLIP_MS}ms` }}
      >
        <div className="glass min-w-0 p-5 [backface-visibility:hidden] [grid-area:1/1]">
          <ExplainerFront step={frontStep} runKey={runKey} onPick={(step) => goTo(0, step)} />
        </div>
        <div className="glass min-w-0 p-5 [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)]">
          <ExplainerBack step={backStep} runKey={runKey} onPick={(step) => goTo(1, step)} />
        </div>
      </div>
    </div>
  );
}
