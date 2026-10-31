import Icon from "../../components/Icon.jsx";
import PlasticThumb from "../../components/PlasticThumb.jsx";
import { useData } from "../../context/DataContext.jsx";
import { COMPANY_PAGES, SORTING_TIPS } from "../../data/content.js";
import { formatTaka } from "../../utils/format.js";

export default function GuidePage() {
  const { data } = useData();

  return (
    <div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
      <section className="mx-auto max-w-2xl pb-16 pt-20 text-center animate-rise">
        <p className="eyebrow">Plastic guide</p>
        <h1 className="mt-4 text-[3rem] font-extrabold leading-[1.1] tracking-tighter">
          Know what you're <span className="text-gradient">selling.</span>
        </h1>
        <p className="mt-5 text-[1.125rem] text-ink/60">
          The five categories Scrapify grades, and how to sort a batch so the AI and the buyer both see it clearly.
        </p>
      </section>

      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-2xl font-bold">
          Plastic categories
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {data.categories.map((category) => {
            const rate = data.rates.find((item) => item.id === category.id);
            return (
              <article key={category.id} className="glass lift overflow-hidden p-3">
                <PlasticThumb categoryId={category.id} height={112} />
                <div className="p-3">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">{category.note}</p>
                  <p className="text-xs text-ink/60 mt-5">Clean rate</p>
                  <p className="text-[1.125rem] font-bold text-gradient">{rate ? `${formatTaka(rate.clean)}/kg` : "-"}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="tips" className="mt-20 grid scroll-mt-28 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="glass p-8">
          <p className="eyebrow">Better photos, better prices</p>
          <h2 className="mt-3 text-2xl font-bold">Sorting and photo tips</h2>
          <p className="mt-3 text-ink/60">Clean, sorted batches get higher rates and higher AI confidence. A few habits make a big difference.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {SORTING_TIPS.map((tip) => (
            <li key={tip.title} className="glass flex gap-4 p-5">
              <span className="icon-tile">
                <Icon name={tip.icon} />
              </span>
              <div>
                <h3 className="font-semibold">{tip.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{tip.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 grid gap-5 sm:grid-cols-2">
        {COMPANY_PAGES.map((page) => (
          <article key={page.id} id={page.id} className="glass scroll-mt-28 p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="icon-tile">
                <Icon name={page.icon} />
              </span>
              <h2 className="text-[1.25rem] font-semibold">{page.title}</h2>
            </div>
            <p className="text-ink/60 mt-4 leading-[1.6]">{page.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
