// scripts/seed.js: fills the database with demo data matching the frontend's seed.js.
// Run: npm run seed
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Rate = require("../models/Rate");
const Scan = require("../models/Scan");
const Listing = require("../models/Listing");
const Report = require("../models/Report");

const CATEGORIES = [
  { id: "pet", name: "Clear PET", note: "Water and soft-drink bottles", icon: "cup-soda" },
  { id: "hdpe", name: "Hard HDPE", note: "Detergent, oil and milk jugs", icon: "milk" },
  { id: "pp", name: "PP containers", note: "Food tubs, caps, buckets", icon: "package" },
  { id: "film", name: "LDPE film", note: "Carry bags and wrapping", icon: "shopping-bag" },
  { id: "mixed", name: "Mixed / other", note: "Multi-layer or unknown", icon: "shapes" },
];

const RATES = [
  { id: "pet", clean: 42, light: 34, heavy: 22, source: "Dhaka wholesale survey" },
  { id: "hdpe", clean: 48, light: 38, heavy: 25, source: "Kamrangirchar recycler quotes" },
  { id: "pp", clean: 36, light: 28, heavy: 18, source: "Kamrangirchar recycler quotes" },
  { id: "film", clean: 18, light: 12, heavy: 7, source: "NGO collection partners" },
  { id: "mixed", clean: 12, light: 8, heavy: 5, source: "Admin estimate" },
];

// Three demo logins, one per role. Password for all: demo1234
const USERS = [
  { id: "u1", name: "Rahima Begum", email: "operator@demo.com", password: "demo1234", role: "operator", org: "Green Bin Scrap Shop", location: "Mirpur, Dhaka", status: "approved" },
  { id: "u5", name: "Tanvir Ahmed", email: "recycler@demo.com", password: "demo1234", role: "recycler", org: "Polymer Loop Ltd.", location: "Tejgaon, Dhaka", status: "approved" },
  { id: "u9", name: "Farhana Islam", email: "admin@demo.com", password: "demo1234", role: "admin", org: "Scrapify", location: "Dhaka", status: "approved" },
];

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Rate.deleteMany({}), Scan.deleteMany({}), Listing.deleteMany({}), Report.deleteMany({})]);

  await Category.insertMany(CATEGORIES);
  await Rate.insertMany(RATES);
  await User.insertMany(USERS);

  // Two scans, one listing built from the first scan, one open report — enough to try every screen.
  const scan1 = await Scan.create({
    id: "SC-1042", operatorId: "u1", location: "Mirpur, Dhaka", weight: 62,
    condition: "clean", confidence: 0.91, quality: "good",
    composition: { pet: 60, hdpe: 25, film: 15 }, corrected: false,
  });
  await Scan.create({
    id: "SC-1039", operatorId: "u1", location: "Mirpur, Dhaka", weight: 38,
    condition: "light", confidence: 0.84, quality: "good",
    composition: { hdpe: 70, pp: 30 }, corrected: false,
  });
  await Listing.create({ id: "LS-2210", scanId: scan1.id, operatorId: "u1", category: "pet", condition: "clean", weight: 62, price: 2604, status: "available" });
  await Report.create({ id: "RP-31", listingId: "LS-2210", by: "u5", reason: "Weight looks higher than the photos", status: "open" });

  console.log("Seed done:");
  console.log("  operator@demo.com / recycler@demo.com / admin@demo.com  (password: demo1234)");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
