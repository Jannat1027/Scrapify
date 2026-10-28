import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
});

locationSchema.plugin(toJSONPlugin);

export default mongoose.model("Location", locationSchema);
