// Landing page copy. landing.js turns these lists into sections.
const STEPS = [
  ["camera", "0:00", "Snap the pile", "Shoot from above on the shop laptop, or scan a QR code and use any phone."],
  ["scan-search", "0:08", "AI reads the mix",
    "Plastic types, contamination and photo quality, with an honest confidence score."],
  ["calculator", "0:20", "Weigh and price", "Type the weight on a big keypad and see the price range, line by line."],
  ["handshake", "0:45", "A recycler claims it",
    "One tap lists the batch. The first verified buyer locks it at the fixed price."],
];

const BEFORE_AFTER = [
  ["The price is a guess made by eye at the counter.", "The price comes from the photo, the weight and today's rate."],
  ["Middlemen set the rate and keep the difference.", "Verified recyclers buy direct, at a price both sides can see."],
  ["Mixed piles sell at the lowest grade.", "The mix is measured, so clean PET earns PET rates."],
  ["Sales live in a notebook, if anywhere.", "Every batch is logged with its photo and price history."],
  ["Disputes come down to who argues hardest.", "Each listing links to its scan, so the record settles it."],
];

const NUMBERS = [
  ["60", " sec", "from photo to a price range"],
  ["5", "", "plastic types graded from one photo"],
  ["14", " days", "before a stale rate triggers a warning"],
  ["1", "", "buyer per batch, guaranteed by an atomic claim"],
];

const FEATURES = [
  ["receipt-text", "Prices that show their working",
    "Every estimate lists the mix, the weight and the rate behind each taka."],
  ["gauge", "Honest when it isn't sure", "Low confidence never slips through. Confirm it, retake it or pick by hand."],
  ["shield-check", "Only verified traders", "An admin checks every shop and recycler before their first sale."],
  ["lock", "One batch, one buyer", "Claims lock instantly, so two recyclers can never buy the same pile."],
  ["monitor-smartphone", "One device per shop",
    "Made for a shared laptop or phone at the counter. Pickers need nothing."],
  ["languages", "Speaks your language",
    "Switch between বাংলা and English in one tap, with big buttons throughout."],
];

const ROLES = [
  {
    icon: "store", title: "Scrap shops & NGO points", tint: "from-mint/25",
    href: "register.html", cta: "Register your shop",
    points: ["Grade a batch from one photo", "Know the price before you sell", "Track every listing and payout"],
  },
  {
    icon: "factory", title: "Recyclers & bulk buyers", tint: "from-sky-300/30",
    href: "register.html", cta: "Start sourcing",
    points: [
      "Browse graded, photographed batches", "Claim at a fixed price, no haggling", "See sourcing by type and area",
    ],
  },
  {
    icon: "shield-check", title: "Platform admins", tint: "from-violet-300/30",
    href: "info.html#about", cta: "How we verify",
    points: ["Approve every account", "Keep rates fresh and sourced", "Settle disputes with evidence"],
  },
];

const TRUST = [
  ["badge-check", "Verified buyers only"],
  ["timer", "Photo to price in a minute"],
  ["languages", "বাংলা & English"],
];
