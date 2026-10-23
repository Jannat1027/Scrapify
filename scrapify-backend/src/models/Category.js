import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

export const CONDITIONS = [
  { id: "clean", name: "Clean" },
  { id: "light", name: "Lightly soiled" },
  { id: "heavy", name: "Heavily soiled" },
];
export const CONDITION_IDS = CONDITIONS.map((condition) => condition.id);

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  note: { type: String, default: "" },
  icon: { type: String, default: "recycle" },
  clean: { type: Number, required: true, min: 0 },
  light: { type: Number, required: true, min: 0 },
  heavy: { type: Number, required: true, min: 0 },
  source: { type: String, default: "Admin estimate" },
  updated: { type: Date, default: Date.now },
});

categorySchema.statics.allExist = async function (ids) {
  const found = await this.countDocuments({ id: { $in: ids } });
  return found === ids.length;
};

categorySchema.plugin(toJSONPlugin);

export default mongoose.model("Category", categorySchema);
