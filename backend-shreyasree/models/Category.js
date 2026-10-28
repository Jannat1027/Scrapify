// models/Category.js: the five plastic categories the app grades.
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // pet, hdpe, pp, film, mixed
  name: { type: String, required: true },
  note: { type: String, default: "" },
  icon: { type: String, default: "package" },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
