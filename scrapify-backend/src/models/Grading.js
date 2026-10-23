import mongoose from "mongoose";
import { CONDITION_IDS } from "./Category.js";
import { PHOTO_QUALITIES } from "./Scan.js";
import { toJSONPlugin } from "./toJSON.js";

const KEEP_FOR_SECONDS = 24 * 60 * 60;

const gradingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  operatorId: { type: String, required: true, index: true },
  composition: { type: Map, of: Number, required: true },
  condition: { type: String, enum: CONDITION_IDS, required: true },
  quality: { type: String, enum: PHOTO_QUALITIES, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  image: { type: String, required: true },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now, expires: KEEP_FOR_SECONDS },
});

gradingSchema.plugin(toJSONPlugin);

export default mongoose.model("Grading", gradingSchema);
