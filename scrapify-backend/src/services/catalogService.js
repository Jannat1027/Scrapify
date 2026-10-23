import Category, { CONDITIONS } from "../models/Category.js";

export function listCategories() {
  return Category.find().sort({ _id: 1 });
}

export function listConditions() {
  return CONDITIONS;
}
