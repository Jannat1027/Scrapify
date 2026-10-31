import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon.jsx";
import Reveal from "../../components/Reveal.jsx";
import FeatureGrid from "../../components/landing/FeatureGrid.jsx";
import HeroExplainer from "../../components/landing/HeroExplainer.jsx";
import HowItWorks from "../../components/landing/HowItWorks.jsx";
import RoleCards from "../../components/landing/RoleCards.jsx";
import WhyScrapify from "../../components/landing/WhyScrapify.jsx";
import { TRUST_POINTS } from "../../data/content.js";

export default function LandingPage() {
  const [replayRequest, setReplayRequest] = useState(null);
  const heroCardRef = useRef(null);

  function replayStep(step) {
    setReplayRequest({ step });
    heroCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <section className="mx-auto w-[min(1180px,calc(100%-2rem))] grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div className="animate-rise">
          <span className="badge tone-green">For scrap shops, NGO collection points and recyclers</span>
          <h1 className="mt-6 text-[3rem] font-extrabold leading-[1.02] tracking-tighter sm:text-[3.75rem] lg:text-[4.6rem] [&_span]:block">
            <span>Every kilo of plastic,</span> <span className="text-gradient">priced fairly.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.125rem] leading-relaxed text-ink/60">
            Take one photo. Scrapify reads the mix, prices it against today's rates and puts it in front of verified recyclers.
            No guessing, no haggling.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-9">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start selling smarter <Icon name="arrow-right" />
            </Link>
            <a href="#how" className="btn btn-lg">
              <Icon name="play" /> Watch how it works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink/60">
            {TRUST_POINTS.map((point) => (
              <span key={point.text} className="inline-flex flex-wrap items-center gap-2">
                <Icon name={point.icon} className="text-forest" />
                {point.text}
              </span>
            ))}
          </div>
        </div>

        <div className="relative animate-rise" ref={heroCardRef}>
          <div className="absolute z-[-1] animate-drift rounded-full -left-10 top-6 h-56 w-56 bg-mint/60 blur-[40px]" />
          <div className="absolute z-[-1] animate-drift rounded-full -right-8 bottom-0 h-64 w-64 bg-sky-300/60 blur-[40px] [animation-delay:-9s]" />
          <div className="absolute z-[-1] animate-drift rounded-full bottom-24 left-[33%] h-40 w-40 bg-amber-200/70 blur-[40px] [animation-delay:-4s]" />
          <HeroExplainer replayRequest={replayRequest} />
        </div>
      </section>

      <HowItWorks onReplayStep={replayStep} />
      <WhyScrapify />
      <FeatureGrid />
      <RoleCards />

      <Reveal from="zoom" className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <div className="glass relative overflow-hidden px-6 py-16 text-center sm:py-20">
          <div className="absolute z-[-1] animate-drift rounded-full -top-32 left-[calc(50%-18rem)] h-72 w-[36rem] bg-mint/40 blur-[64px]" />
          <h2 className="mx-auto max-w-2xl text-[1.875rem] font-bold leading-[1.15] tracking-tight sm:text-[3rem]">
            Your next batch could be <span className="text-gradient">sold before lunch.</span>
          </h2>
          <p className="text-ink/60 mx-auto mb-8 mt-4 max-w-lg">Register your shop or recycling business. We verify it within a day, and you're ready to trade.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create a free account
            </Link>
            <Link to="/guide" className="btn btn-lg">
              Read the plastic guide
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
