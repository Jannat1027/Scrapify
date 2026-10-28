import { Link } from "react-router-dom";
import { ROLE_CARDS } from "../../data/content.js";
import Icon from "../Icon.jsx";
import Reveal from "../Reveal.jsx";

// Each card's soft colour wash, from the tint in data/content.js.
const TINTS = {
  mint: "from-mint/25",
  sky: "from-sky-300/30",
  violet: "from-violet-300/30",
};

// "Who it's for": one card each for operators, recyclers and admins.
export default function RoleCards() {
  return (
    <section id="roles" className="mx-auto w-[min(1180px,calc(100%-2rem))] scroll-mt-28 py-20">
      <Reveal className="mx-auto max-w-2xl text-center [&>h2+p]:mt-4 [&>h2]:mt-3">
        <p className="eyebrow">Who it's for</p>
        <h2 className="text-[1.875rem] font-bold leading-[1.15] tracking-tight sm:text-[3rem]">One marketplace, three sides</h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {ROLE_CARDS.map((role, index) => (
          <Reveal key={role.title} from="flip" delay={index * 180} className={`glass lift flex flex-col bg-gradient-to-br to-white/30 p-7 ${TINTS[role.tint]}`}>
            <span className="icon-tile">
              <Icon name={role.icon} />
            </span>
            <h3 className="mt-5 text-[1.25rem] font-bold">{role.title}</h3>
            <ul className="mt-4 grid flex-1 content-start gap-2.5 text-sm">
              {role.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <Icon name="check" className="mt-0.5 text-forest" />
                  {point}
                </li>
              ))}
            </ul>
            <Link to={role.link} className="btn mt-6 self-start">
              {role.cta} <Icon name="arrow-right" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
