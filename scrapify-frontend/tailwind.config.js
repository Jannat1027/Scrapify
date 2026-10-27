// Tailwind theme for Scrapify: brand colours, fonts, shadows and every animation the app uses.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Hind Siliguri", "system-ui", "sans-serif"],
        bangla: ["Hind Siliguri", "Plus Jakarta Sans", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        canvas: "#f3f7f4",
        ink: "#1f2d27",
        forest: "#2c7a57",
        mint: "#3f9e74",
      },
      // Plain CSS borders default to the text colour; keep that instead of Tailwind's grey.
      borderColor: { DEFAULT: "currentColor" },
      boxShadow: {
        glass: [
          "0 18px 40px -18px rgba(31,45,39,.28)",
          "inset 0 1px 0 rgba(255,255,255,.95)",
          "inset 0 -1px 0 rgba(255,255,255,.35)",
        ].join(", "),
        glow: "0 8px 22px -10px rgba(44,122,87,.55)",
        // The glass shadow plus a green ring, for the highlighted "With Scrapify" column.
        "glass-ring": [
          "0 18px 40px -18px rgba(31,45,39,.28)",
          "inset 0 1px 0 rgba(255,255,255,.95)",
          "inset 0 -1px 0 rgba(255,255,255,.35)",
          "0 0 0 2px rgba(63,158,116,.4)",
        ].join(", "),
      },
      backgroundImage: {
        // Two drifting colour fields behind every page give the frosted panels something to blur.
        "glow-top": [
          "radial-gradient(30rem 30rem at 12% 8%, rgba(95,190,145,.55), transparent 65%)",
          "radial-gradient(26rem 26rem at 92% 22%, rgba(120,185,235,.5), transparent 65%)",
        ].join(", "),
        "glow-bottom": [
          "radial-gradient(30rem 30rem at 70% 95%, rgba(250,205,150,.45), transparent 65%)",
          "radial-gradient(22rem 22rem at 30% 70%, rgba(180,160,235,.32), transparent 65%)",
        ].join(", "),
        // Diagonal sheen plus a spotlight that follows the mouse (--mx/--my come from utils/glassSpotlight.js).
        sheen: [
          "radial-gradient(320px circle at var(--mx, -999px) var(--my, -999px), rgba(255,255,255,.55), transparent 65%)",
          "linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,.12) 45%, rgba(255,255,255,.28))",
        ].join(", "),
      },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(14px)" } },
        drift: { "50%": { transform: "translate3d(4vw, -3vh, 0) scale(1.08)" } },
        pop: { from: { opacity: "0", transform: "scale(.6)" } },
        flash: { "0%, 100%": { opacity: "0" }, "40%": { opacity: ".85" } },
        stamp: { from: { opacity: "0", transform: "scale(2.2) rotate(-18deg)" } },
        "scan-down": { from: { top: "0%" }, to: { top: "100%" } },
        "fill-bar": { from: { width: "0" }, to: { width: "100%" } },

        // SVG motions for the stories and the hero card. --x/--y say how far a piece travels.
        "move-throw": {
          "0%": { transform: "none" },
          "50%": { transform: "translate(calc(var(--x) / 2), calc(min(var(--y), 0px) - 60px)) rotate(200deg)" },
          "100%": { transform: "translate(var(--x), var(--y)) rotate(450deg)" },
        },
        "move-fly": { to: { transform: "translate(var(--x), var(--y)) scale(.3)", opacity: "0" } },
        "move-glide": {
          "50%": { transform: "translate(calc(var(--x) / 2), calc(var(--y) / 2 - 40px)) rotate(8deg)" },
          "100%": { transform: "translate(var(--x), var(--y)) scale(.6)", opacity: "0" },
        },
        "move-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "70%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "none", opacity: "1" },
        },
        "move-fade": { from: { opacity: "0" } },
        "move-rise": { from: { transform: "translateY(24px)", opacity: "0" } },
        "move-drop": { from: { transform: "translateY(-50px)", opacity: "0" } },
        "move-grow": { from: { transform: "scaleX(0)" } },
        "move-drive": { from: { transform: "translate(var(--x), var(--y))" } },
        "move-draw": { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
        "move-bob": { to: { transform: "translateY(-4px)" } },
        "move-scan": { to: { transform: "translateY(58px)" } },
        "move-sweep": { from: { transform: "translateX(-50px)" }, to: { transform: "translateX(50px)" } },
        "move-wave": { to: { transform: "translateX(-40px)" } },
      },
      animation: {
        rise: "rise .5s cubic-bezier(.2,.8,.2,1) both",
        "rise-fast": "rise .3s cubic-bezier(.2,.8,.2,1) both",
        pop: "pop .45s cubic-bezier(.3,1.6,.5,1) both",
        drift: "drift 18s ease-in-out infinite",
        "drift-slow": "drift 22s ease-in-out infinite",
        "drift-back": "drift 26s ease-in-out infinite reverse",
        flash: "flash .6s ease-out 2.2s both",
        stamp: "stamp .5s cubic-bezier(.3,1.5,.5,1) .9s both",
        "scan-down": "scan-down 1.6s cubic-bezier(.45,0,.55,1) infinite alternate",
        "fill-bar": "fill-bar 4.2s linear forwards",
        "fill-bar-story": "fill-bar 4s linear forwards",

        "move-throw": "move-throw 1.1s cubic-bezier(.3,.1,.3,1) both",
        "move-fly": "move-fly 1s cubic-bezier(.3,.1,.3,1) both",
        "move-glide": "move-glide 1.5s ease-in-out both",
        "move-pop": "move-pop .5s ease-out both",
        "move-fade": "move-fade .7s cubic-bezier(.3,.1,.3,1) both",
        "move-rise": "move-rise .7s cubic-bezier(.3,.1,.3,1) both",
        "move-drop": "move-drop .6s ease-out both",
        "move-grow": "move-grow .5s cubic-bezier(.3,.1,.3,1) both",
        "move-drive": "move-drive 1.3s cubic-bezier(.2,.7,.2,1) both",
        "move-draw": "move-draw 1.8s ease-in-out both",
        "move-bob": "move-bob 1.4s ease-in-out infinite alternate both",
        "move-scan": "move-scan 1.2s ease-in-out infinite alternate both",
        "move-sweep": "move-sweep 1.3s ease-in-out infinite alternate both",
        "move-wave": "move-wave 2.4s ease-in-out infinite alternate both",
      },
    },
  },
  plugins: [],
};
