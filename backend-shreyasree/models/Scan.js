const mongoose = require("mongoose");
const { nextId } = require("../utils/id");

const scanSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    operatorId: { type: String, required: true },
    location: { type: String, required: true },
    weight: { type: Number, required: true, min: 0.1 },
    condition: { type: String, enum: ["clean", "light", "heavy"], required: true },
    quality: { type: String, default: "good" },
    confidence: { type: Number, min: 0, max: 1 },
    composition: { type: Map, of: Number, default: {} },
    corrected: { type: Boolean, default: false },
    aiResult: { type: Map, of: Number, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

scanSchema.pre("save", async function () {
  if (this.isNew && !this.id) this.id = await nextId(Scan, "SC");
});

const Scan = mongoose.model("Scan", scanSchema);
module.exports = Scan;
