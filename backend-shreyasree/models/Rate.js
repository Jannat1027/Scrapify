const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clean: { type: Number, required: true },
  light: { type: Number, required: true },
  heavy: { type: Number, required: true },
  source: { type: String, default: "Admin" },
});

const Rate = mongoose.model("Rate", rateSchema);
module.exports = Rate;
