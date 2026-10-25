import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models.js";
import { ROLES, USER_STATUS } from "../utils.js";

await mongoose.connect(process.env.MONGO_URI);

const email = process.env.ADMIN_EMAIL || "admin@scrapify.bd";

if (await User.emailExists(email)) {
  console.log("Admin already exists:", email);
} else {
    
  await User.create({
    name: "Scrapify Admin",
    org: "Scrapify",
    location: "Dhaka",
    email,
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: ROLES.ADMIN,
    status: USER_STATUS.APPROVED,
  });
  console.log("Admin created:", email);
}

await mongoose.disconnect();
