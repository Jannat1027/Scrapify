import { HOW_IT_WORKS_STEPS } from "../../data/content.js";
import Icon from "../Icon.jsx";
import Reveal from "../Reveal.jsx";

// "How it works": four steps on a timeline. Clicking a step replays it in the hero card.
export default function HowItWorks({ onReplayStep }) {
  return (
    <section id="how" className="mx-auto w-[min(1180px,calc(100%-2rem))] scroll-mt-28 py-20">
      <Reveal className="mx-auto max-w-2xl text-center [&>h2+p]:mt-4 [&>h2]:mt-3">
        <p className="eyebrow">How it works</p>
        <h2 className="text-[1.875rem] font-bold leading-[1.15] tracking-tight sm:text-[3rem]">From the scale to a buyer in under a minute</h2>
        <p className="text-ink/60">No forms to fill and no app to install. The operator takes a photo, and Scrapify handles the rest.</p>
      </Reveal>

      <div className="relative mt-16">
        <Reveal from="line" className="absolute inset-x-[12.5%] top-8 hidden h-0.5 rounded-full bg-ink/10 lg:block [&.in>i]:w-full">
          <i className="block h-full w-0 rounded-full bg-gradient-to-r from-mint via-sky-400 to-violet-400 transition-[width] duration-[1800ms] ease-out" />
        </Reveal>
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              from="zoom"
              delay={index * 220}
              className="group cursor-pointer text-center"
              title="Replay this step in the demo"
              onClick={() => onReplayStep(index)}
            >
              <span className="glass relative mx-auto grid h-16 w-16 place-items-center rounded-2xl text-[1.5rem] text-forest transition-transform duration-150 group-hover:-translate-y-1 group-hover:rotate-3">
                <Icon name={step.icon} />
                <span className="chip bg-ink absolute -right-2 -top-2 px-2 py-0.5 text-[10px]">{step.time}</span>
              </span>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-ink/60 mx-auto mt-2 max-w-64 leading-[1.6]">{step.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-forest opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <Icon name="play" />
                See it in the demo
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
