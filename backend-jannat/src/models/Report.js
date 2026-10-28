import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

export const REPORT_STATUSES = ["open", "resolved"];


const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, 
  listingId: { type: String, required: true },
  by: { type: String, required: true }, 
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: REPORT_STATUSES, default: "open" },
  resolution: { type: String },
  date: { type: Date, default: Date.now },
});

reportSchema.plugin(toJSONPlugin);

export default mongoose.model("Report", reportSchema);
