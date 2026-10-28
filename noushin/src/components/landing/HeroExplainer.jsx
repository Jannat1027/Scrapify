// The animated card in the landing page hero.
// The front plays one trade step by step, then the card flips and the back shows what that trade changes.
// Click a tab to jump to a step; hover the card to pause it.
import { useEffect, useRef, useState } from "react";
import ExplainerBack, { BACK_STEPS } from "./ExplainerBack.jsx";
import ExplainerFront, { FRONT_STEPS } from "./ExplainerFront.jsx";

const STEP_MS = 4200;
const FLIP_MS = 900;
const STEP_COUNTS = [FRONT_STEPS.length, BACK_STEPS.length];

// replayRequest: { step } set by the landing page when a "How it works" step is clicked.
export default function HeroExplainer({ replayRequest }) {
  const [side, setSide] = useState(0); // 0 = front, 1 = back
  const [frontStep, setFrontStep] = useState(0);
  const [backStep, setBackStep] = useState(null); // null until the card first flips, so nothing plays unseen
  const [runKey, setRunKey] = useState(0); // goes up every time a step starts
  const [paused, setPaused] = useState(false);
  const flipTimer = useRef(null);

  const currentStep = side === 0 ? frontStep : backStep ?? 0;

  // Shows a step. When the card has to flip first, the new step starts halfway through the flip.
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

  // After STEP_MS, move on: the next step on this side, or flip to the first step of the other side.
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      if (currentStep + 1 < STEP_COUNTS[side]) goTo(side, currentStep + 1);
      else goTo(1 - side, 0);
    }, STEP_MS);
    return () => clearTimeout(timer);
    // Only restart the timer when a step starts or the pause changes.
  }, [runKey, paused]);

  // The landing page asked to replay a step of the front side.
  useEffect(() => {
    if (replayRequest) goTo(0, replayRequest.step);
  }, [replayRequest]);

  // Stop the timer when the page closes.
  useEffect(() => () => clearTimeout(flipTimer.current), []);

  function handleMouseLeave() {
    setPaused(false);
    setRunKey((key) => key + 1); // restart the current step's progress bar
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
