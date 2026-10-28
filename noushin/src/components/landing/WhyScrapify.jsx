import { BEFORE_AND_AFTER, KEY_NUMBERS } from "../../data/content.js";
import CountUp from "../CountUp.jsx";
import Icon from "../Icon.jsx";
import Reveal from "../Reveal.jsx";

// One column of the before/after comparison. isNew = the "With Scrapify" column.
function CompareColumn({ title, icon, items, isNew }) {
  return (
    <Reveal from={isNew ? "right" : "left"} delay={isNew ? 240 : 0} className={`glass p-7 sm:p-8 ${isNew ? "bg-white/50 shadow-glass-ring" : ""}`}>
      <p className={`flex items-center gap-2 text-[0.875rem] font-bold uppercase tracking-widest ${isNew ? "text-forest" : "text-ink/45"}`}>
        <Icon name={icon} />
        {title}
      </p>
      <ul className="mt-6 grid gap-4">
        {items.map((text) => (
          <li key={text} className="flex gap-3 border-b border-ink/10 pb-4 last:border-b-0 last:pb-0">
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${isNew ? "bg-mint text-white" : "bg-ink/10 text-ink/50"}`}
            >
              <Icon name={isNew ? "check" : "x"} size={14} />
            </span>
            <span className={isNew ? "font-medium" : "text-ink/60"}>{text}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

// "Why Scrapify": the old way vs. the Scrapify way, and four key numbers.
export default function WhyScrapify() {
  return (
    <section id="why" className="mx-auto w-[min(1180px,calc(100%-2rem))] scroll-mt-28 py-20">
      <Reveal className="mx-auto max-w-2xl text-center [&>h2+p]:mt-4 [&>h2]:mt-3">
        <p className="eyebrow">Why Scrapify</p>
        <h2 className="text-[1.875rem] font-bold leading-[1.15] tracking-tight sm:text-[3rem]">What changes on day one</h2>
        <p className="text-ink/60">The same pile of plastic, the same shop counter. A very different sale.</p>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        <CompareColumn title="The old way" icon="clock" items={BEFORE_AND_AFTER.map((pair) => pair[0])} isNew={false} />
        <CompareColumn title="With Scrapify" icon="sparkles" items={BEFORE_AND_AFTER.map((pair) => pair[1])} isNew />
      </div>

      <div className="glass mt-5 grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
        {KEY_NUMBERS.map((number, index) => (
          <Reveal key={number.label} from="zoom" delay={index * 120}>
            <p className="text-[2.25rem] font-extrabold tracking-tight text-gradient">
              <CountUp value={number.value} suffix={number.suffix} />
            </p>
            <p className="text-sm text-ink/60">{number.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
