import Category, { CONDITIONS } from "../models/Category.js";

export async function listCategories(req, res) {
  const categories = await Category.find().sort({ _id: 1 });
  res.json({ categories });
}

export function listConditions(req, res) {
  res.json({ conditions: CONDITIONS });
}
