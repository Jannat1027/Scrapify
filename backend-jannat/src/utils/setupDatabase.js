import { pathToFileURL } from "node:url";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { categories, locations } from "../data/seed.js";
import Category from "../models/Category.js";
import Location from "../models/Location.js";

export async function setupDatabase() {
  let added = 0;
  for (const category of categories) {
    const result = await Category.updateOne({ id: category.id }, { $setOnInsert: { ...category, updated: new Date() } }, { upsert: true });
    added += result.upsertedCount;
  }
  console.log(`  Categories: ${added} added, ${categories.length - added} already there`);

  added = 0;
  for (const location of locations) {
    const result = await Location.updateOne({ name: location.name }, { $setOnInsert: location }, { upsert: true });
    added += result.upsertedCount;
  }
  console.log(`  Locations: ${added} added, ${locations.length - added} already there`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await connectDatabase();
    await setupDatabase();
    console.log("Done. Next: `npm run create-admin` to make the admin account (if you haven't yet).");
  } catch (error) {
    console.error("Setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}
