import mongoose from "mongoose";
import { CONDITION_IDS } from "./Category.js";
import { toJSONPlugin } from "./toJSON.js";


export const LISTING_STATUSES = ["available", "claimed", "completed", "cancelled"];


const listingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  scanId: { type: String, required: true, index: true },
  operatorId: { type: String, required: true, index: true },
  recyclerId: { type: String, index: true },
  category: { type: String, required: true },
  condition: { type: String, enum: CONDITION_IDS, required: true },
  weight: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: LISTING_STATUSES, default: "available", index: true },
  rating: { type: Number, min: 1, max: 5 },
  cancelReason: { type: String },
  created: { type: Date, default: Date.now },
  claimedAt: { type: Date },
  completedAt: { type: Date },
});

listingSchema.plugin(toJSONPlugin);

export default mongoose.model("Listing", listingSchema);
