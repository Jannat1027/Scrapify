// ---------------------------------------------------------------------------
// DEMO DATA
// Everything the app shows comes from this file the first time it runs.
// After that, changes are saved in the browser's localStorage, so a page
// refresh keeps them. Use "Reset demo data" in the sidebar to
// go back to exactly what is written here.
// ---------------------------------------------------------------------------
import { ONE_DAY_MS } from "../utils/format.js";

// Returns a date `days` days before today, as an ISO string.
function daysAgo(days) {
  return new Date(Date.now() - days * ONE_DAY_MS).toISOString();
}

// ---------- Plastic categories, conditions and locations ----------

const categories = [
  { id: "pet", name: "Clear PET", note: "Water and soft-drink bottles", icon: "cup-soda" },
  { id: "hdpe", name: "Hard HDPE", note: "Detergent, oil and milk jugs", icon: "milk" },
  { id: "pp", name: "PP containers", note: "Food tubs, caps, buckets", icon: "package" },
  { id: "film", name: "LDPE film", note: "Carry bags and wrapping", icon: "shopping-bag" },
  { id: "mixed", name: "Mixed / other", note: "Multi-layer or unknown", icon: "shapes" },
];

const conditions = [
  { id: "clean", name: "Clean" },
  { id: "light", name: "Lightly soiled" },
  { id: "heavy", name: "Heavily soiled" },
];

const locations = [
  "Mirpur, Dhaka",
  "Kamrangirchar, Dhaka",
  "Bayezid, Chattogram",
  "Sonadanga, Khulna",
  "Shaheb Bazar, Rajshahi",
];

// ---------- Price rates (৳ per kg) ----------
// Each plastic type has one rate per condition.

const rates = [
  { id: "pet", clean: 42, light: 34, heavy: 22, source: "Dhaka wholesale survey", updated: daysAgo(4) },
  { id: "hdpe", clean: 48, light: 38, heavy: 25, source: "Kamrangirchar recycler quotes", updated: daysAgo(6) },
  { id: "pp", clean: 36, light: 28, heavy: 18, source: "Kamrangirchar recycler quotes", updated: daysAgo(6) },
  { id: "film", clean: 18, light: 12, heavy: 7, source: "NGO collection partners", updated: daysAgo(21) },
  { id: "mixed", clean: 12, light: 8, heavy: 5, source: "Admin estimate", updated: daysAgo(17) },
];

// ---------- Users ----------
// u1 is the demo operator using the app. u5 is the recycler who buys from them.

const users = [
  {
    id: "u1", role: "operator", name: "Rahima Begum", org: "Green Bin Scrap Shop",
    location: "Mirpur, Dhaka", email: "rahima@greenbin.bd", status: "approved", joined: daysAgo(120),
  },
  {
    id: "u5", role: "recycler", name: "Tanvir Ahmed", org: "Polymer Loop Ltd.",
    location: "Kamrangirchar, Dhaka", email: "tanvir@polymerloop.com", status: "approved", joined: daysAgo(150),
  },
];

// ---------- Scans (one photo of one batch, graded by the simulated AI) ----------
// composition: percent of each plastic type. confidence: 0 to 1.
// quality: "good", "dark" or "blurry". corrected: the operator changed the AI result.
// aiResult: what the AI first said, kept when the operator corrects it (the correction log).
// image: a small copy of the photo (scans made in the app have one; this sample data doesn't).

const scans = [
  {
    id: "SC-1042", operatorId: "u1", location: "Mirpur, Dhaka", date: daysAgo(0), weight: 62,
    condition: "clean", confidence: 0.91, quality: "good", composition: { pet: 60, hdpe: 25, film: 15 }, corrected: false,
  },
  {
    id: "SC-1039", operatorId: "u1", location: "Mirpur, Dhaka", date: daysAgo(2), weight: 38,
    condition: "light", confidence: 0.84, quality: "good", composition: { hdpe: 70, pp: 30 }, corrected: false,
  },
  {
    id: "SC-1033", operatorId: "u1", location: "Mirpur, Dhaka", date: daysAgo(5), weight: 120,
    condition: "light", confidence: 0.52, quality: "dark", composition: { film: 80, mixed: 20 }, corrected: true,
    aiResult: { composition: { mixed: 60, film: 40 }, condition: "heavy" },
  },
  {
    id: "SC-1027", operatorId: "u1", location: "Mirpur, Dhaka", date: daysAgo(9), weight: 45,
    condition: "clean", confidence: 0.88, quality: "good", composition: { pet: 90, pp: 10 }, corrected: false,
  },
  {
    id: "SC-1019", operatorId: "u1", location: "Mirpur, Dhaka", date: daysAgo(14), weight: 74,
    condition: "heavy", confidence: 0.67, quality: "blurry", composition: { pp: 50, mixed: 50 }, corrected: true,
    aiResult: { composition: { mixed: 70, pp: 30 }, condition: "heavy" },
  },
];

// ---------- Listings (a scanned batch put on the market at a fixed price) ----------
// status flow: available -> claimed -> completed, or cancelled.
// category is the plastic type with the biggest share in the scan.

const listings = [
  {
    id: "LS-2210", scanId: "SC-1042", operatorId: "u1", category: "pet", condition: "clean", weight: 62,
    location: "Mirpur, Dhaka", price: 2300, status: "available", created: daysAgo(0),
  },
  {
    id: "LS-2207", scanId: "SC-1039", operatorId: "u1", category: "hdpe", condition: "light", weight: 38,
    location: "Mirpur, Dhaka", price: 1340, status: "claimed", recyclerId: "u5", created: daysAgo(2),
  },
  {
    id: "LS-2201", scanId: "SC-1027", operatorId: "u1", category: "pet", condition: "clean", weight: 45,
    location: "Mirpur, Dhaka", price: 1850, status: "completed", recyclerId: "u5", rating: 5, created: daysAgo(9),
  },
  {
    id: "LS-2196", scanId: "SC-1019", operatorId: "u1", category: "pp", condition: "heavy", weight: 74,
    location: "Mirpur, Dhaka", price: 950, status: "cancelled", recyclerId: "u5",
    cancelReason: "Batch was wetter than shown", created: daysAgo(14),
  },
];

// ---------- Reported problems (filled by "Report a problem" on My listings) ----------

const reports = [];

// A fresh copy of all the demo data, used on first run and after a reset.
export function createSeedData() {
  return structuredClone({ categories, conditions, locations, rates, users, scans, listings, reports });
}
