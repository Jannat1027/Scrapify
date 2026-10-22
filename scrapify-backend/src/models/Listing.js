import mongoose from "mongoose";
import { CONDITION_IDS } from "./Category.js";
import { toJSONPlugin } from "./toJSON.js";

// Listing lifecycle: available -> claimed -> completed, or cancelled.
export const LISTING_STATUSES = ["available", "claimed", "completed", "cancelled"];

// A scanned batch put on the market at a fixed price. It points back to its scan (scanId).
const listingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // "LS-2210"
  scanId: { type: String, required: true, index: true },
  operatorId: { type: String, required: true, index: true },
  recyclerId: { type: String, index: true },
  category: { type: String, required: true }, // the plastic type with the biggest share in the scan
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
