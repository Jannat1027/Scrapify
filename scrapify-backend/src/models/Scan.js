import mongoose from "mongoose";
import { CONDITION_IDS } from "./Category.js";
import { toJSONPlugin } from "./toJSON.js";

export const PHOTO_QUALITIES = ["good", "dark", "blurry"];

const aiResultSchema = new mongoose.Schema(
  {
    composition: { type: Map, of: Number },
    condition: { type: String, enum: CONDITION_IDS },
  },
  { _id: false },
);

const scanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  operatorId: { type: String, required: true, index: true },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true, min: 0 },
  condition: { type: String, enum: CONDITION_IDS, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  quality: { type: String, enum: PHOTO_QUALITIES, default: "good" },
  composition: { type: Map, of: Number, required: true },
  corrected: { type: Boolean, default: false },
  aiResult: { type: aiResultSchema, default: undefined },
  image: { type: String },
  gradingId: { type: String },
});

scanSchema.plugin(toJSONPlugin);

export default mongoose.model("Scan", scanSchema);
