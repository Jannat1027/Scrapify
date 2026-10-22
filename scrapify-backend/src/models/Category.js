import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

// The three conditions a batch can be in. Every category has one rate (৳ per kg) for each.
export const CONDITIONS = [
  { id: "clean", name: "Clean" },
  { id: "light", name: "Lightly soiled" },
  { id: "heavy", name: "Heavily soiled" },
];
export const CONDITION_IDS = CONDITIONS.map((condition) => condition.id);

// A plastic type and its price rates. The frontend's separate "categories" and "rates"
// tables are merged here, because each category has exactly one row of rates.
const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // "pet", "hdpe", ...
  name: { type: String, required: true, trim: true },
  note: { type: String, default: "" },
  icon: { type: String, default: "recycle" },
  clean: { type: Number, required: true, min: 0 },
  light: { type: Number, required: true, min: 0 },
  heavy: { type: Number, required: true, min: 0 },
  source: { type: String, default: "Admin estimate" },
  updated: { type: Date, default: Date.now }, // when the rates last changed
});

categorySchema.plugin(toJSONPlugin);

export default mongoose.model("Category", categorySchema);
