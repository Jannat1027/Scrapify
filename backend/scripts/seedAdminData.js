import "dotenv/config";
import mongoose from "mongoose";
import { User, PriceRate, Location, Report, scansCollection, listingsCollection } from "../models.js";
import { ROLES } from "../utils.js";

// Usage (from the backend folder):
//   node scripts/seedAdminData.js               adds rates, locations and sample reports (only what is missing)
//   node scripts/seedAdminData.js --demo        also adds demo scans and listings, so the dashboard has data
//   node scripts/seedAdminData.js --remove-demo removes ONLY the demo scans and listings again
// It never deletes or overwrites anything else.

const args = process.argv.slice(2);
await mongoose.connect(process.env.MONGO_URI);

if (args.includes("--remove-demo")) {
  const removedScans = await scansCollection().deleteMany({ demo: true });
  const removedListings = await listingsCollection().deleteMany({ demo: true });
  console.log(`Removed demo data: ${removedScans.deletedCount} scans, ${removedListings.deletedCount} listings`);
  await mongoose.disconnect();
  process.exit(0);
}

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// ---------- Rates ----------
const rates = [
  { category: "pet", name: "Clear PET", note: "Water and soft-drink bottles", clean: 42, light: 34, heavy: 22, source: "Dhaka wholesale survey", updated: daysAgo(4) },
  { category: "hdpe", name: "Hard HDPE", note: "Detergent, oil and milk jugs", clean: 48, light: 38, heavy: 25, source: "Kamrangirchar recycler quotes", updated: daysAgo(6) },
  { category: "pp", name: "PP containers", note: "Food tubs, caps, buckets", clean: 36, light: 28, heavy: 18, source: "Kamrangirchar recycler quotes", updated: daysAgo(6) },
  { category: "film", name: "LDPE film", note: "Carry bags and wrapping", clean: 18, light: 12, heavy: 7, source: "NGO collection partners", updated: daysAgo(21) },
  { category: "mixed", name: "Mixed / other", note: "Multi-layer or unknown", clean: 12, light: 8, heavy: 5, source: "Admin estimate", updated: daysAgo(17) },
];
let added = 0;
for (const rate of rates) {
  if (!(await PriceRate.exists({ category: rate.category }))) {
    await PriceRate.create(rate);
    added++;
  }
}
console.log(`Rates: ${added} added, ${rates.length - added} already there`);

// ---------- Locations ----------
const locations = ["Mirpur, Dhaka", "Kamrangirchar, Dhaka", "Bayezid, Chattogram", "Sonadanga, Khulna", "Shaheb Bazar, Rajshahi"];
added = 0;
for (const name of locations) {
  const key = Location.keyFromName(name);
  if (!(await Location.exists({ key }))) {
    await Location.create({ name, key });
    added++;
  }
}
console.log(`Locations: ${added} added, ${locations.length - added} already there`);

// ---------- Users to attach reports and demo data to ----------
const operator = await User.findOne({ role: ROLES.OPERATOR });
const recycler = await User.findOne({ role: ROLES.RECYCLER });
const anyUser = operator || recycler;

// ---------- Reports ----------
if (!anyUser) {
  console.log("Reports and demo data: skipped. Register one operator first (POST /api/auth/register), then run this again.");
} else {
  const reports = [
    { code: "RP-31", listingCode: "LS-2196", reason: "Weight on pickup was about 15 kg less than listed.", createdAt: daysAgo(13) },
    { code: "RP-29", listingCode: "LS-2207", reason: "Recycler has not collected the batch for 2 days.", createdAt: daysAgo(1) },
    {
      code: "RP-24", listingCode: "LS-2201", reason: "Photo did not match the colour of the bottles.", createdAt: daysAgo(8),
      status: "resolved", resolution: "Shop re-uploaded a correct photo.", resolvedAt: daysAgo(7),
    },
  ];
  added = 0;
  for (const report of reports) {
    if (!(await Report.exists({ code: report.code }))) {
      await Report.create({ ...report, reporter: anyUser._id });
      added++;
    }
  }
  console.log(`Reports: ${added} added, ${reports.length - added} already there`);

  // ---------- Demo scans and listings (only with --demo) ----------
  if (args.includes("--demo")) {
    const scans = [
      { code: "SC-1042", weight: 62, condition: "clean", confidence: 0.91, quality: "good", composition: { pet: 60, hdpe: 25, film: 15 }, corrected: false, ago: 0 },
      { code: "SC-1039", weight: 38, condition: "light", confidence: 0.84, quality: "good", composition: { hdpe: 70, pp: 30 }, corrected: false, ago: 2 },
      { code: "SC-1033", weight: 120, condition: "light", confidence: 0.52, quality: "dark", composition: { film: 80, mixed: 20 }, corrected: true, aiResult: { composition: { mixed: 60, film: 40 }, condition: "heavy" }, ago: 5 },
      { code: "SC-1027", weight: 45, condition: "clean", confidence: 0.88, quality: "good", composition: { pet: 90, pp: 10 }, corrected: false, ago: 9 },
      { code: "SC-1019", weight: 74, condition: "heavy", confidence: 0.67, quality: "blurry", composition: { pp: 50, mixed: 50 }, corrected: true, aiResult: { composition: { mixed: 70, pp: 30 }, condition: "heavy" }, ago: 14 },
      { code: "SC-1011", weight: 210, condition: "clean", confidence: 0.93, quality: "good", composition: { pet: 100 }, corrected: false, ago: 3 },
      { code: "SC-1008", weight: 95, condition: "light", confidence: 0.58, quality: "good", composition: { hdpe: 40, film: 60 }, corrected: true, aiResult: { composition: { film: 70, hdpe: 30 }, condition: "light" }, ago: 11 },
    ];
    const listings = [
      { code: "LS-2210", scanCode: "SC-1042", category: "pet", condition: "clean", weight: 62, location: "Mirpur, Dhaka", price: 2300, status: "available", ago: 0 },
      { code: "LS-2209", scanCode: "SC-1011", category: "pet", condition: "clean", weight: 210, location: "Bayezid, Chattogram", price: 8650, status: "available", ago: 3 },
      { code: "LS-2207", scanCode: "SC-1039", category: "hdpe", condition: "light", weight: 38, location: "Mirpur, Dhaka", price: 1340, status: "claimed", withRecycler: true, ago: 2 },
      { code: "LS-2201", scanCode: "SC-1027", category: "pet", condition: "clean", weight: 45, location: "Mirpur, Dhaka", price: 1850, status: "completed", withRecycler: true, rating: 5, ago: 9 },
      { code: "LS-2196", scanCode: "SC-1019", category: "pp", condition: "heavy", weight: 74, location: "Mirpur, Dhaka", price: 950, status: "cancelled", withRecycler: true, cancelReason: "Batch was wetter than shown", ago: 14 },
    ];

    const owner = operator || anyUser;
    let addedScans = 0;
    for (const { ago, ...scan } of scans) {
      if (!(await scansCollection().findOne({ code: scan.code }))) {
        await scansCollection().insertOne({ ...scan, operator: owner._id, location: "Mirpur, Dhaka", createdAt: daysAgo(ago), updatedAt: daysAgo(ago), demo: true });
        addedScans++;
      }
    }
    let addedListings = 0;
    for (const { ago, withRecycler, ...listing } of listings) {
      if (!(await listingsCollection().findOne({ code: listing.code }))) {
        const doc = { ...listing, operator: owner._id, createdAt: daysAgo(ago), updatedAt: daysAgo(ago), demo: true };
        if (withRecycler && recycler) doc.recycler = recycler._id;
        await listingsCollection().insertOne(doc);
        addedListings++;
      }
    }
    console.log(`Demo data: ${addedScans} scans and ${addedListings} listings added`);
  }
}

await mongoose.disconnect();