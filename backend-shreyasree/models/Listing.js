const mongoose = require("mongoose");
const { nextId } = require("../utils/id");

const listingSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    scanId: { type: String, default: null },
    operatorId: { type: String, required: true },
    category: { type: String, required: true },
    condition: { type: String, enum: ["clean", "light", "heavy"], required: true },
    weight: { type: Number, required: true, min: 0.1 },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ["available", "claimed"], default: "available" },
    recyclerId: { type: String, default: null },
    claimedAt: { type: String, default: null },
  },
  { timestamps: true },
);

listingSchema.pre("save", async function () {
  if (this.isNew && !this.id) this.id = await nextId(Listing, "LS");
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
