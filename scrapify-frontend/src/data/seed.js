// ---------------------------------------------------------------------------
// DEMO DATA
// Everything the app shows comes from this file the first time it runs.
// After that, changes are saved in the browser's localStorage, so a page
// refresh keeps them. Use "Reset demo data" in the footer or sidebar to
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

// ---------- Price rates (৳ per kg) set by the admin ----------
// Each plastic type has one rate per condition.

const rates = [
  { id: "pet", clean: 42, light: 34, heavy: 22, source: "Dhaka wholesale survey", updated: daysAgo(4) },
  { id: "hdpe", clean: 48, light: 38, heavy: 25, source: "Kamrangirchar recycler quotes", updated: daysAgo(6) },
  { id: "pp", clean: 36, light: 28, heavy: 18, source: "Kamrangirchar recycler quotes", updated: daysAgo(6) },
  { id: "film", clean: 18, light: 12, heavy: 7, source: "NGO collection partners", updated: daysAgo(21) },
  { id: "mixed", clean: 12, light: 8, heavy: 5, source: "Admin estimate", updated: daysAgo(17) },
];

// ---------- Users ----------
// status: "approved" can log in, "pending" waits for an admin,
// "flagged" can log in but is marked for review, "suspended" cannot log in.

const users = [
  {
    id: "u1", role: "operator", name: "Rahima Begum", org: "Green Bin Scrap Shop",
    location: "Mirpur, Dhaka", email: "rahima@greenbin.bd", status: "approved", joined: daysAgo(120),
  },
  {
    id: "u2", role: "operator", name: "Karim Uddin", org: "BRAC Collection Point 4",
    location: "Bayezid, Chattogram", email: "karim@cp4.org", status: "approved", joined: daysAgo(90),
  },
  {
    id: "u3", role: "operator", name: "Shapla Akter", org: "Sonadanga Bhangari",
    location: "Sonadanga, Khulna", email: "shapla@bhangari.bd", status: "pending", joined: daysAgo(2),
  },
  {
    id: "u4", role: "operator", name: "Jamal Hossain", org: "City Scrap House",
    location: "Shaheb Bazar, Rajshahi", email: "jamal@cityscrap.bd", status: "flagged", joined: daysAgo(60),
  },
  {
    id: "u5", role: "recycler", name: "Tanvir Ahmed", org: "Polymer Loop Ltd.",
    location: "Kamrangirchar, Dhaka", email: "tanvir@polymerloop.com", status: "approved", joined: daysAgo(150),
  },
  {
    id: "u6", role: "recycler", name: "Nusrat Jahan", org: "ReForm Plastics",
    location: "Bayezid, Chattogram", email: "nusrat@reform.com.bd", status: "pending", joined: daysAgo(1),
  },
  {
    id: "u7", role: "recycler", name: "Arif Chowdhury", org: "EcoPellet BD",
    location: "Sonadanga, Khulna", email: "arif@ecopellet.bd", status: "suspended", joined: daysAgo(200),
  },
  {
    id: "u9", role: "admin", name: "Farhana Islam", org: "Scrapify",
    location: "Dhaka", email: "admin@scrapify.app", status: "approved", joined: daysAgo(300),
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
  {
    id: "SC-1011", operatorId: "u2", location: "Bayezid, Chattogram", date: daysAgo(3), weight: 210,
    condition: "clean", confidence: 0.93, quality: "good", composition: { pet: 100 }, corrected: false,
  },
  {
    id: "SC-1008", operatorId: "u2", location: "Bayezid, Chattogram", date: daysAgo(11), weight: 95,
    condition: "light", confidence: 0.58, quality: "good", composition: { hdpe: 40, film: 60 }, corrected: true,
    aiResult: { composition: { pp: 55, film: 45 }, condition: "light" },
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
  {
    id: "LS-2209", scanId: "SC-1011", operatorId: "u2", category: "pet", condition: "clean", weight: 210,
    location: "Bayezid, Chattogram", price: 8650, status: "available", created: daysAgo(3),
  },
  {
    id: "LS-2203", scanId: "SC-1008", operatorId: "u2", category: "film", condition: "light", weight: 95,
    location: "Bayezid, Chattogram", price: 1150, status: "available", created: daysAgo(11),
  },
];

// ---------- Reported problems (sent to the admin) ----------

const reports = [
  {
    id: "RP-31", listingId: "LS-2196", by: "u5", status: "open", date: daysAgo(13),
    reason: "Weight on pickup was about 15 kg less than listed.",
  },
  {
    id: "RP-29", listingId: "LS-2207", by: "u1", status: "open", date: daysAgo(1),
    reason: "Recycler has not collected the batch for 2 days.",
  },
  {
    id: "RP-24", listingId: "LS-2201", by: "u5", status: "resolved", date: daysAgo(8),
    reason: "Photo did not match the colour of the bottles.",
  },
];

// Demo accounts shown on the login page. Any password with 6+ characters works.
export const DEMO_ACCOUNTS = [
  { role: "operator", email: "rahima@greenbin.bd", icon: "store" },
  { role: "recycler", email: "tanvir@polymerloop.com", icon: "factory" },
  { role: "admin", email: "admin@scrapify.app", icon: "shield-check" },
];
export const DEMO_PASSWORD = "demo1234";

// A fresh copy of all the demo data, used on first run and after a reset.
export function createSeedData() {
  return structuredClone({ categories, conditions, locations, rates, users, scans, listings, reports });
}
