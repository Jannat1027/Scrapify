import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

export const ROLES = ["operator", "recycler", "admin"];


export const USER_STATUSES = ["pending", "approved", "flagged", "suspended"];
export const CAN_LOG_IN = ["approved", "flagged"];

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  role: { type: String, enum: ROLES, required: true },
  name: { type: String, required: true, trim: true },
  org: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  // Accounts made before email checks (seed data, admins) count as verified; register sets false.
  emailVerified: { type: Boolean, default: true },
  verifyTokenHash: { type: String, default: "" },
  verifyTokenExpires: { type: Date },
  status: { type: String, enum: USER_STATUSES, default: "pending" },
  note: { type: String, default: "" },
  bkashNumber: { type: String, default: "" },
  nagadNumber: { type: String, default: "" },
  joined: { type: Date, default: Date.now },
});


userSchema.plugin(toJSONPlugin, { hide: ["passwordHash", "verifyTokenHash", "verifyTokenExpires"] });

export default mongoose.model("User", userSchema);
