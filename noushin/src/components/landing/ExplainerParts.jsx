// Small building blocks used by both sides of the animated hero card.
import { useEffect, useState } from "react";
import Icon from "../Icon.jsx";

// The step tabs at the top of a card side, each with a progress bar.
// Earlier steps are full, the current one fills over STEP_MS, later ones are empty.
// runKey changes every time a step (re)starts, which restarts the fill animation.
// Hovering the hero card (data-paused on group/explainer) pauses the filling bar.
export function StepTabs({ steps, activeStep, runKey, onPick }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        let barClass = "";
        if (index < activeStep) barClass = "!w-full";
        if (index === activeStep) barClass = "animate-fill-bar group-data-[paused=true]/explainer:[animation-play-state:paused]";
        return (
          <button
            key={step.label}
            type="button"
            className={`grid gap-2 rounded-xl p-2 text-left text-[0.75rem] font-semibold hover:bg-white/50 ${
              index === activeStep ? "text-ink" : "text-ink/50"
            }`}
            onClick={() => onPick(index)}
          >
            <span className="inline-flex flex-wrap items-center gap-2">
              <Icon name={step.icon} />
              {step.label}
            </span>
            <span className="meter h-1">
              <i key={index === activeStep ? runKey : "idle"} className={`bg-mint !transition-none ${barClass}`} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// A bar that grows from 0 to `size` (a CSS length such as "60%") shortly after it appears.
//   direction: "width" (horizontal) or "height" (vertical column)
export function GrowBar({ size, direction = "width", className = "", style = {} }) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 350);
    return () => clearTimeout(timer);
  }, []);

  return <i className={className} style={{ ...style, [direction]: grown ? size : 0 }} />;
}

// Types `text` one letter at a time, like someone entering it on a keypad.
export function TypeOut({ text }) {
  const [letterCount, setLetterCount] = useState(0);

  useEffect(() => {
    if (letterCount >= text.length) return;
    const delay = letterCount === 0 ? 250 : 180;
    const timer = setTimeout(() => setLetterCount(letterCount + 1), delay);
    return () => clearTimeout(timer);
  }, [letterCount, text]);

  return <>{text.slice(0, letterCount)}</>;
}

// SVG shapes for a bottle, a jug and a bag. Defined once, reused with <use href="#bottle" />.
export function PlasticShapeDefs() {
  return (
    <defs>
      <symbol id="bottle" viewBox="0 0 24 60">
        <rect x="8.5" width="7" height="6" rx="2" fill="#2c7a57" />
        <path
          d="M8 6h8v6c4 3 6 7 6 12v30a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V24c0-5 2-9 6-12z"
          fill="currentColor"
          fillOpacity=".55"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M5 30h14M5 36h14" stroke="#fff" strokeWidth="2" />
      </symbol>
      <symbol id="jug" viewBox="0 0 50 56">
        <path
          d="M14 2h12v8h10c6 0 10 4 10 10v30a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V22c0-6 4-12 10-12z"
          fill="currentColor"
          fillOpacity=".75"
        />
        <path d="M31 18h6v14h-6" stroke="#fff" strokeWidth="3" fill="none" />
      </symbol>
      <symbol id="bag" viewBox="0 0 60 50">
        <path d="M6 14c8-6 14 4 22-2s16-8 26 0l-4 30c-10 6-30 8-42 2z" fill="currentColor" fillOpacity=".5" />
        <path d="M14 16c4 6 2 14 6 20M34 12c-2 8 4 16 2 26" stroke="#fff" strokeWidth="2" fill="none" />
      </symbol>
    </defs>
  );
}

// One plastic piece placed in the SVG at x, y, with a size, a tilt and a colour.
export function PlasticPiece({ shape, x, y, width, height, rotate, color }) {
  return (
    <use
      href={`#${shape}`}
      x={x}
      y={y}
      width={width}
      height={height}
      style={{ color }}
      transform={`rotate(${rotate} ${x + width / 2} ${y + height / 2})`}
    />
  );
}
