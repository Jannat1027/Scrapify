const mongoose = require("mongoose");
const { nextId } = require("../utils/id");

const reportSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    listingId: { type: String, required: true },
    by: { type: String, required: true },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
  },
  { timestamps: true },
);

reportSchema.pre("save", async function () {
  if (this.isNew && !this.id) this.id = await nextId(Report, "RP");
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
