import { useEffect, useState } from "react";
import Brand from "../Brand.jsx";
import LanguageButton from "../LanguageButton.jsx";
import LitterStory, { LITTER_STORY } from "./LitterStory.jsx";
import ShopStory, { SHOP_STORY } from "./ShopStory.jsx";

const BEAT_MS = 4000;
const STORY_SWAP_DELAY_MS = 450;

export default function AuthStoryPanel({ mode }) {
  const [storyName, setStoryName] = useState(mode);
  const [beat, setBeat] = useState(0);
  const story = storyName === "register" ? SHOP_STORY : LITTER_STORY;

  useEffect(() => {
    if (mode === storyName) return;
    const timer = setTimeout(() => {
      setStoryName(mode);
      setBeat(0);
    }, STORY_SWAP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mode, storyName]);

  useEffect(() => {
    const timer = setTimeout(() => setBeat((beat + 1) % story.beats.length), BEAT_MS);
    return () => clearTimeout(timer);
  }, [beat, story]);

  const currentBeat = story.beats[beat];

  return (
    <aside
      className={`fixed bottom-4 right-4 top-4 z-20 hidden w-[calc(50%-1.5rem)] transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.3,1)] lg:block ${
        mode === "register" ? "-translate-x-[calc(100%+1rem)]" : ""
      }`}
    >
      <div className="glass relative flex h-full flex-col overflow-hidden p-8">
        <div className="absolute z-[-1] animate-drift rounded-full -right-24 -top-24 h-96 w-96 bg-mint/40 blur-[64px]" />
        <div className="absolute z-[-1] animate-drift rounded-full -bottom-24 -left-16 h-80 w-80 bg-sky-300/40 blur-[64px] [animation-delay:-8s]" />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Brand />
          <LanguageButton />
        </div>

        <div className="my-auto pt-6">
          <p className="eyebrow">{story.tag}</p>
          <div className="mt-3 aspect-[400/260] overflow-hidden rounded-3xl border border-white/80 shadow-glass">
            {storyName === "register" ? <ShopStory beat={beat} /> : <LitterStory beat={beat} />}
          </div>
          <div className="mt-6 min-h-[4.5rem]" key={`${storyName}-${beat}`}>
            <p className="text-[1.25rem] font-bold tracking-tight animate-rise">{currentBeat.title}</p>
            <p className="text-ink/60 animate-rise">{currentBeat.text}</p>
          </div>
          <div className="mt-5 flex gap-2">
            {story.beats.map((item, index) => {
              let barClass = "";
              if (index < beat) barClass = "!w-full";
              if (index === beat) barClass = "animate-fill-bar-story";
              return (
                <span key={item.title} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <i key={index === beat ? `${storyName}-${beat}` : "idle"} className={`block h-full w-0 rounded-full bg-mint ${barClass}`} />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
