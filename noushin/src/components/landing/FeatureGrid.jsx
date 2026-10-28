import { FEATURES } from "../../data/content.js";
import Icon from "../Icon.jsx";
import Reveal from "../Reveal.jsx";

// Where each feature card starts (x px, y px, tilt degrees) before it flies into the grid.
const SCATTER_START = [
  [-260, -140, -14],
  [0, -220, 9],
  [260, -140, 13],
  [-280, 160, 11],
  [0, 240, -9],
  [280, 160, -13],
];

export default function FeatureGrid() {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-2rem))] py-10">
      <Reveal className="mx-auto max-w-2xl text-center [&>h2+p]:mt-4 [&>h2]:mt-3">
        <p className="eyebrow">Built for the counter</p>
        <h2 className="text-[1.875rem] font-bold leading-[1.15] tracking-tight sm:text-[3rem]">Small details that protect every trade</h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const [x, y, tilt] = SCATTER_START[index % SCATTER_START.length];
          return (
            <Reveal
              key={feature.title}
              from="scatter"
              delay={index * 90}
              style={{ "--x": `${x}px`, "--y": `${y}px`, "--r": `${tilt}deg` }}
              className="glass lift group h-full p-6"
            >
              <span className="icon-tile transition-transform duration-150 group-hover:-rotate-6 group-hover:scale-110">
                <Icon name={feature.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-ink/60">{feature.text}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
