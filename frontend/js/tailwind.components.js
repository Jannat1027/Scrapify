// Shared component classes, written with Tailwind's @apply. tailwind.config.js registers them.
const apply = (classes) => ({ [`@apply ${classes}`]: {} });

const TW_COMPONENTS = {
  // Frosted panel with a diagonal sheen and a spotlight that follows the cursor (--mx/--my come from motion.js).
  ".glass": {
    ...apply("rounded-3xl border border-white/70 bg-white/35 shadow-glass backdrop-blur-2xl backdrop-saturate-[1.8]"),
    backgroundImage: [
      "radial-gradient(320px circle at var(--mx, -999px) var(--my, -999px), rgba(255,255,255,.55), transparent 65%)",
      "linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,.12) 45%, rgba(255,255,255,.28))",
    ].join(", "),
  },
  ".panel": apply("glass p-6 max-sm:p-5"),
  ".well": apply("rounded-xl border border-ink/10 bg-white/60 p-3"),
  ".notice": apply("glass flex items-center gap-4 border-amber-400/30 bg-amber-400/5 p-4 text-sm"),
  ".dropzone": apply(`grid min-h-[340px] cursor-pointer place-items-center rounded-3xl border-2 border-dashed
    border-ink/15 p-6 text-center transition hover:border-mint hover:bg-mint/5`),
  ".dropzone.over": apply("border-mint bg-mint/5"),
  ".big-choice": apply("btn btn-lg !h-20 flex-col gap-1 !rounded-2xl"),
  ".notice .icon-tile": apply("border-amber-400/30 bg-amber-400/10 text-amber-700"),
  ".lift": apply("transition duration-300 hover:-translate-y-1 hover:border-ink/20"),
  ".eyebrow": apply("inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-forest"),
  ".text-gradient": apply("bg-gradient-to-r from-forest to-mint bg-clip-text text-transparent"),
  ".muted": apply("text-ink/60"),
  ".kicker": apply("text-xs font-semibold uppercase tracking-widest text-ink/45"),
  ".link": apply("font-semibold text-forest hover:underline"),

  // Page layout
  ".wrap": apply("mx-auto w-[min(1180px,calc(100%-2rem))]"),
  ".page-head": apply("flex flex-wrap items-end justify-between gap-3 px-1"),
  ".page-title": apply("text-3xl font-bold tracking-tight"),
  ".section-head": apply("mx-auto max-w-2xl text-center"),
  ".headline": apply("text-3xl font-bold tracking-tight sm:text-5xl"),
  ".card-title": apply("text-lg font-semibold"),
  ".cards": apply("grid gap-5 sm:grid-cols-2 xl:grid-cols-3"),
  ".stats": apply("grid gap-4 sm:grid-cols-2 xl:grid-cols-4"),
  ".blob": apply("absolute -z-10 animate-drift rounded-full blur-2xl"),
  ".search": apply("relative"),

  // Hero animation pieces
  ".stage": apply(`relative mt-4 aspect-video overflow-hidden rounded-2xl border border-white/70
    bg-gradient-to-br from-white/70`),
  ".step-tab": apply("grid gap-2 rounded-xl p-2 text-left text-xs font-semibold text-ink/50 hover:bg-white/50"),
  ".caption": apply("relative mt-4 h-[118px]"),
  ".caption > *": apply("absolute inset-0 animate-rise"),
  ".chip": apply("whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-white"),
  ".frosted": apply("rounded-2xl border border-white/70 bg-white/60"),
  ".meter": apply("h-1.5 overflow-hidden rounded-full bg-ink/10"),
  ".meter > i": apply("block h-full w-0 rounded-full transition-[width] duration-1000"),
  ".auth-side": apply("grid place-items-center py-6 transition-opacity duration-500"),
  ".auth-card": apply("glass w-full max-w-md p-7 sm:p-10"),
  ".auth-title": apply("text-3xl font-bold tracking-tight sm:text-4xl"),
  ".auth-art": apply(`fixed bottom-4 right-4 top-4 z-20 hidden w-[calc(50%-1.5rem)] lg:block
    transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.3,1)]`),
  ".search > svg": apply("absolute left-4 top-1/2 -translate-y-1/2 text-ink/60"),
  ".search > .input": apply("pl-11"),

  ".btn": apply(`inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full
    border border-ink/10 bg-white/70 px-5 text-sm font-semibold shadow-sm transition
    hover:border-ink/20 hover:bg-white active:scale-[.97] disabled:pointer-events-none disabled:opacity-40`),
  ".btn-primary": apply("border-0 bg-mint text-white shadow-glow hover:bg-forest"),
  ".btn-danger": apply("border-red-400/30 bg-red-400/10 text-red-600 hover:bg-red-400/20"),
  ".btn-ghost": apply("border-transparent bg-transparent"),
  ".btn-lg": apply("h-14 px-7 text-base"),
  ".btn-sm": apply("h-9 px-3.5 text-xs"),
  ".btn-icon": apply("w-11 px-0"),

  ".label": apply("mb-1.5 block text-sm font-semibold text-ink/60"),
  ".input": apply(`h-12 w-full rounded-xl border border-ink/10 bg-white/80 px-4 outline-none transition
    placeholder:text-ink/40 focus:border-mint focus:bg-white focus:ring-4 focus:ring-mint/15`),
  "textarea.input": apply("h-auto min-h-24 py-3"),

  ".icon-tile": apply(`grid h-12 w-12 shrink-0 place-items-center rounded-2xl
    border border-mint/25 bg-mint/10 text-xl text-forest`),
  ".badge": apply(`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5
    text-xs font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current`),
  ".tone-green": apply("border-mint/30 bg-mint/10 text-forest"),
  ".tone-amber": apply("border-amber-400/30 bg-amber-400/10 text-amber-700"),
  ".tone-red": apply("border-red-400/30 bg-red-400/10 text-red-600"),
  ".tone-blue": apply("border-sky-400/30 bg-sky-400/10 text-sky-700"),
  ".tone-violet": apply("border-violet-400/30 bg-violet-400/10 text-violet-700"),

  ".tbl": apply("w-full text-sm"),
  ".tbl th": apply("px-4 pb-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink/45"),
  ".tbl td": apply("whitespace-nowrap border-t border-ink/10 px-4 py-3.5"),
  ".tbl tbody tr": apply("transition hover:bg-white/60"),

  ".sidebar": apply(`glass fixed inset-y-4 left-4 z-40 flex w-[250px] -translate-x-[120%] flex-col gap-1 p-4
    transition duration-300 max-lg:bg-white/95 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0`),
  ".sidebar.open": apply("translate-x-0"),
  ".side-link": apply(`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60
    transition hover:bg-white/70 hover:text-ink`),
  ".side-link.active": apply("bg-white font-semibold text-forest shadow-[inset_3px_0_0_#3f9e74]"),
  ".tab": apply("h-9 rounded-full px-4 text-sm font-semibold text-ink/60 transition"),
  ".tab.active": apply("bg-white text-ink shadow-sm"),

  ".choice span": apply(`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-ink/10
    bg-white/60 px-2 py-4 text-sm font-semibold transition hover:border-ink/20`),
  ".choice input:checked + span": apply("border-mint bg-mint/10 text-forest"),
  ".choice input:focus-visible + span": apply("ring-2 ring-mint"),

  "dialog.modal": apply(`w-[min(480px,calc(100%-2rem))] rounded-3xl border border-ink/15 bg-white/90 p-7
    text-ink shadow-glass backdrop-blur-xl`),
  "dialog.modal:has([data-wide])": apply("w-[min(640px,calc(100%-2rem))]"),
  "dialog.modal::backdrop": apply("bg-ink/25 backdrop-blur-sm"),
};
