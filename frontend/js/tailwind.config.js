// Tailwind theme and base styles. Component classes come from tailwind.components.js.
const FONTS = [
  "https://fonts.googleapis.com/css2?display=swap",
  "family=Plus+Jakarta+Sans:wght@400;500;600;700;800",
  "family=Hind+Siliguri:wght@400;500;600;700",
].join("&");
document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: FONTS }));

const fixedGlow = (animation, background) => ({ inset: "-10%", animation, background: background.join(", ") });

const BASE = {
  body: apply("min-h-screen overflow-x-clip bg-canvas font-sans text-[15px] text-ink antialiased"),
  "html[lang=bn] body": { fontFamily: "Hind Siliguri, Plus Jakarta Sans, sans-serif" },

  // Two drifting colour fields behind every page give the frosted panels something to blur.
  "body::before, body::after": {
    content: '""',
    position: "fixed",
    zIndex: "-1",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  "body::before": fixedGlow("drift 22s ease-in-out infinite", [
    "radial-gradient(30rem 30rem at 12% 8%, rgba(95,190,145,.55), transparent 65%)",
    "radial-gradient(26rem 26rem at 92% 22%, rgba(120,185,235,.5), transparent 65%)",
  ]),
  "body::after": fixedGlow("drift 26s ease-in-out infinite reverse", [
    "radial-gradient(30rem 30rem at 70% 95%, rgba(250,205,150,.45), transparent 65%)",
    "radial-gradient(22rem 22rem at 30% 70%, rgba(180,160,235,.32), transparent 65%)",
  ]),

  // Scroll entrances. data-reveal="left|right|zoom|flip|scatter" picks where an element comes in from;
  // --d staggers it, and scatter reads its starting offset from --x, --y and --r.
  "[data-reveal]": {
    opacity: "0",
    transform: "var(--from, translateY(32px))",
    transition: "opacity .8s ease, transform 1s cubic-bezier(.2,.8,.2,1)",
    transitionDelay: "var(--d, 0ms)",
  },
  '[data-reveal="left"]': { "--from": "translateX(-90px) rotate(-2deg)" },
  '[data-reveal="right"]': { "--from": "translateX(90px) rotate(2deg)" },
  '[data-reveal="zoom"]': { "--from": "scale(.8)" },
  '[data-reveal="flip"]': { "--from": "perspective(900px) rotateX(40deg) translateY(40px)", transformOrigin: "bottom" },
  '[data-reveal="scatter"]': { "--from": "translate(var(--x), var(--y)) rotate(var(--r)) scale(.85)" },
  "[data-reveal].in": { opacity: "1", transform: "none" },
  "@media (prefers-reduced-motion: reduce)": {
    "*, *::before, *::after": { animation: "none !important", transition: "none !important" },
    "[data-reveal]": { opacity: "1", transform: "none" },
  },

  ".grid": { gridTemplateColumns: "minmax(0, 1fr)" },
  "[hidden]": { display: "none !important" },
  "svg.lucide": apply("h-[1.15em] w-[1.15em] shrink-0"),
  "::selection": apply("bg-mint/30"),
  ":focus": { outline: "none" },
  ":focus-visible": { outline: "2px solid #3f9e74", outlineOffset: "2px" },
};

tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Hind Siliguri", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "#f3f7f4",
        ink: "#1f2d27",
        forest: "#2c7a57",
        mint: "#3f9e74",
        lime: "#a7d7b8",
      },
      boxShadow: {
        glass: [
          "0 18px 40px -18px rgba(31,45,39,.28)",
          "inset 0 1px 0 rgba(255,255,255,.95)",
          "inset 0 -1px 0 rgba(255,255,255,.35)",
        ].join(", "),
        glow: "0 8px 22px -10px rgba(44,122,87,.55)",
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(14px)" } },
        drift: { "50%": { transform: "translate3d(4vw, -3vh, 0) scale(1.08)" } },
        scan: { from: { top: "0%" }, to: { top: "100%" } },
        pop: { from: { opacity: 0, transform: "scale(.6)" } },
        flash: { "0%, 100%": { opacity: 0 }, "40%": { opacity: 0.85 } },
        stamp: { from: { opacity: 0, transform: "scale(2.2) rotate(-18deg)" } },
      },
      animation: {
        rise: "rise .5s cubic-bezier(.2,.8,.2,1) both",
        drift: "drift 18s ease-in-out infinite",
        scan: "scan 1.6s cubic-bezier(.45,0,.55,1) infinite alternate",
        pop: "pop .45s cubic-bezier(.3,1.6,.5,1) both",
        flash: "flash .6s ease-out both",
        stamp: "stamp .5s cubic-bezier(.3,1.5,.5,1) both",
      },
    },
  },
  plugins: [
    ({ addBase, addComponents }) => {
      addBase(BASE);
      addComponents(TW_COMPONENTS);
    },
  ],
};
