const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  note: { type: String, default: "" },
  icon: { type: String, default: "package" },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
