import mongoose from "mongoose";
import { CONDITION_IDS } from "./Category.js";
import { toJSONPlugin } from "./toJSON.js";

export const PHOTO_QUALITIES = ["good", "dark", "blurry"];

// The AI's first answer, kept when the operator corrects it (the correction log).
const aiResultSchema = new mongoose.Schema(
  {
    composition: { type: Map, of: Number },
    condition: { type: String, enum: CONDITION_IDS },
  },
  { _id: false },
);

// One photo of one batch, graded by the AI.
// composition: percent of each plastic type, e.g. { pet: 60, hdpe: 40 }. confidence: 0 to 1.
const scanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // "SC-1042"
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
  image: { type: String }, // a small JPEG as a data URL, sent by the frontend after compressing it
});

scanSchema.plugin(toJSONPlugin);

export default mongoose.model("Scan", scanSchema);
