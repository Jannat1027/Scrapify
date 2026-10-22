// ---------------------------------------------------------------------------
// Seed script: `npm run seed`
// Empties every collection and loads the demo data from data/seed.js.
// Every demo account gets the password DEMO_PASSWORD ("demo1234").
// ---------------------------------------------------------------------------
import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { categories, DEMO_PASSWORD, listings, locations, reports, scans, users } from "../data/seed.js";
import Category from "../models/Category.js";
import Listing from "../models/Listing.js";
import Location from "../models/Location.js";
import Report from "../models/Report.js";
import Scan from "../models/Scan.js";
import User from "../models/User.js";

export async function seedDatabase() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const collections = [
    [User, users.map((user) => ({ ...user, passwordHash }))],
    [Category, categories],
    [Location, locations],
    [Scan, scans],
    [Listing, listings],
    [Report, reports],
  ];

  for (const [Model, rows] of collections) {
    await Model.deleteMany({});
    await Model.insertMany(rows);
    console.log(`  ${Model.modelName}: ${rows.length}`);
  }
}

// Runs only when called as a script, not when imported.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await connectDatabase();
    console.log("Seeding demo data...");
    await seedDatabase();
    console.log(`Done. Demo accounts log in with the password "${DEMO_PASSWORD}".`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}
