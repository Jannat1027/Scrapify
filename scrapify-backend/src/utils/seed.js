import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { categories, DEMO_PASSWORD, listings, reports, scans, users } from "../data/seed.js";
import Category from "../models/Category.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import Scan from "../models/Scan.js";
import User from "../models/User.js";

async function seedDatabase() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const collections = [
    [User, users.map((user) => ({ ...user, passwordHash }))],
    [Category, categories],
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
