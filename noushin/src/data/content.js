// Text shown on the public pages (landing page and plastic guide) and the operator pages.
// Pages turn these lists into cards with .map(), so changing copy never means touching JSX.

// ---------- Landing page ----------

export const TRUST_POINTS = [
  { icon: "badge-check", text: "Verified buyers only" },
  { icon: "timer", text: "Photo to price in a minute" },
  { icon: "languages", text: "বাংলা & English" },
];

export const HOW_IT_WORKS_STEPS = [
  {
    icon: "camera", time: "0:00", title: "Snap the pile",
    text: "Shoot from above on the shop laptop, or scan a QR code and use any phone.",
  },
  {
    icon: "scan-search", time: "0:08", title: "AI reads the mix",
    text: "Plastic types, contamination and photo quality, with an honest confidence score.",
  },
  {
    icon: "calculator", time: "0:20", title: "Weigh and price",
    text: "Type the weight on a big keypad and see the price range, line by line.",
  },
  {
    icon: "handshake", time: "0:45", title: "A recycler claims it",
    text: "One tap lists the batch. The first verified buyer locks it at the fixed price.",
  },
];

// Each pair is [the old way, with Scrapify].
export const BEFORE_AND_AFTER = [
  ["The price is a guess made by eye at the counter.", "The price comes from the photo, the weight and today's rate."],
  ["Middlemen set the rate and keep the difference.", "Verified recyclers buy direct, at a price both sides can see."],
  ["Mixed piles sell at the lowest grade.", "The mix is measured, so clean PET earns PET rates."],
  ["Sales live in a notebook, if anywhere.", "Every batch is logged with its photo and price history."],
  ["Disputes come down to who argues hardest.", "Each listing links to its scan, so the record settles it."],
];

export const KEY_NUMBERS = [
  { value: 60, suffix: " sec", label: "from photo to a price range" },
  { value: 5, suffix: "", label: "plastic types graded from one photo" },
  { value: 14, suffix: " days", label: "before a stale rate triggers a warning" },
  { value: 1, suffix: "", label: "buyer per batch, guaranteed by an atomic claim" },
];

export const FEATURES = [
  {
    icon: "receipt-text", title: "Prices that show their working",
    text: "Every estimate lists the mix, the weight and the rate behind each taka.",
  },
  {
    icon: "gauge", title: "Honest when it isn't sure",
    text: "Low confidence never slips through. Confirm it, retake it or pick by hand.",
  },
  {
    icon: "shield-check", title: "Only verified traders",
    text: "An admin checks every shop and recycler before their first sale.",
  },
  {
    icon: "lock", title: "One batch, one buyer",
    text: "Claims lock instantly, so two recyclers can never buy the same pile.",
  },
  {
    icon: "monitor-smartphone", title: "One device per shop",
    text: "Made for a shared laptop or phone at the counter. Pickers need nothing.",
  },
  {
    icon: "languages", title: "Speaks your language",
    text: "Switch between বাংলা and English in one tap, with big buttons throughout.",
  },
];

export const ROLE_CARDS = [
  {
    icon: "store", title: "Scrap shops & NGO points", tint: "mint", link: "/register", cta: "Register your shop",
    points: ["Grade a batch from one photo", "Know the price before you sell", "Track every listing and payout"],
  },
  {
    icon: "factory", title: "Recyclers & bulk buyers", tint: "sky", link: "/register", cta: "Start sourcing",
    points: ["Browse graded, photographed batches", "Claim at a fixed price, no haggling", "See sourcing by type and area"],
  },
  {
    icon: "shield-check", title: "Platform admins", tint: "violet", link: "/guide#about", cta: "How we verify",
    points: ["Approve every account", "Keep rates fresh and sourced", "Settle disputes with evidence"],
  },
];

// ---------- Plastic guide ----------

export const SORTING_TIPS = [
  { icon: "layers", title: "One layer, from above", text: "Spread the batch flat so every piece is visible to the camera." },
  { icon: "sun", title: "Use good light", text: "Daylight or a bright bulb. Dark photos lower confidence." },
  { icon: "droplets", title: "Drain and shake", text: "Empty liquids first. Wet plastic is graded as soiled." },
  { icon: "split", title: "One batch per photo", text: "Keep different piles apart so the mix is measured correctly." },
];

export const COMPANY_PAGES = [
  {
    id: "about", icon: "info", title: "About",
    text: "Scrapify helps scrap shops, NGO collection points and recyclers in Bangladesh trade plastic at transparent prices. One shared device per collection point is enough.",
  },
  {
    id: "contact", icon: "mail", title: "Contact",
    text: "Email support@scrapify.app or call +880 1700-000000, Sunday to Thursday, 9am to 6pm. For account approvals, include your shop name and location.",
  },
  {
    id: "privacy", icon: "lock", title: "Privacy policy",
    text: "We store account details, scan photos and transaction records to run the marketplace. Photos are only shown to verified recyclers. We never sell personal data.",
  },
  {
    id: "terms", icon: "scale", title: "Terms and conditions",
    text: "AI grades are estimates. Operators confirm every result before listing. Claims are fixed-price and binding once accepted, and disputes go through the report system.",
  },
];

// ---------- New scan page ----------

export const PHOTO_CHECKLIST = [
  { icon: "layers", text: "Single layer, shot from above" },
  { icon: "sun", text: "Bright, even light. No dark corners" },
  { icon: "focus", text: "Hold steady so the photo is sharp" },
  { icon: "box", text: "One batch per photo" },
];
