import mongoose from "mongoose";
import { CONDITION_IDS } from "./Category.js";
import { PHOTO_QUALITIES } from "./Scan.js";
import { toJSONPlugin } from "./toJSON.js";

// What the server answered when an operator uploaded a photo. A scan is saved from this record (by its id),
// so the AI result, its confidence and the photo always come from the server and can't be made up by the client.
// Unused gradings delete themselves after two hours.
const gradingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  operatorId: { type: String, required: true, index: true },
  composition: { type: Map, of: Number, required: true },
  condition: { type: String, enum: CONDITION_IDS, required: true },
  quality: { type: String, enum: PHOTO_QUALITIES, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  image: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 2 },
});

gradingSchema.plugin(toJSONPlugin);

export default mongoose.model("Grading", gradingSchema);
