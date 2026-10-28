import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import { makeId } from "./ids.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

try {
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== "admin") throw new Error(`${email} already belongs to a ${existing.role}. Use another ADMIN_EMAIL.`);
    existing.passwordHash = passwordHash;
    existing.status = "approved";
    await existing.save();
    console.log(`Admin ${email} already existed: password reset.`);
  } else {
    await User.create({
      id: makeId("u"),
      role: "admin",
      name: process.env.ADMIN_NAME?.trim() || "Scrapify Admin",
      org: "Scrapify",
      location: (await Location.findOne())?.name || "Dhaka",
      email,
      passwordHash,
      status: "approved",
    });
    console.log(`Admin ${email} created.`);
  }
} catch (error) {
  console.error("Could not create the admin:", error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
