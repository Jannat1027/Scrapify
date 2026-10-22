import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

export const REPORT_STATUSES = ["open", "resolved"];

// A problem with a listing, sent to the admin by the operator or recycler on it.
const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // "RP-31"
  listingId: { type: String, required: true },
  by: { type: String, required: true }, // id of the user who reported it
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: REPORT_STATUSES, default: "open" },
  resolution: { type: String }, // the admin's note when resolving
  date: { type: Date, default: Date.now },
});

reportSchema.plugin(toJSONPlugin);

export default mongoose.model("Report", reportSchema);
