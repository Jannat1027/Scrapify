
import Category, { CONDITIONS } from "../models/Category.js";
import Listing from "../models/Listing.js";
import Location from "../models/Location.js";
import Scan from "../models/Scan.js";
import { HttpError } from "../utils/httpError.js";
import { slugify } from "../utils/ids.js";

const RATE_FIELDS = ["clean", "light", "heavy"];

async function findCategoryOr404(categoryId) {
  const category = await Category.findOne({ id: categoryId });
  if (!category) throw new HttpError(404, `No category called ${categoryId}.`);
  return category;
}


export async function listCategories(req, res) {
  const categories = await Category.find().sort({ _id: 1 });
  res.json({ categories });
}

export function listConditions(req, res) {
  res.json({ conditions: CONDITIONS });
}


export async function listLocations(req, res) {
  const locations = await Location.find().sort({ _id: 1 });
  res.json({ locations: locations.map((location) => location.name) });
}


export async function createCategory(req, res) {
  const id = slugify(req.body.name);
  if (await Category.exists({ id })) throw new HttpError(409, "That category already exists.");

  const category = await Category.create({ ...req.body, id, updated: new Date() });
  res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const category = await findCategoryOr404(req.params.id);
  const ratesChanged = RATE_FIELDS.some((field) => field in req.body && req.body[field] !== category[field]);

  category.set(req.body);
  if (ratesChanged) category.updated = new Date();
  await category.save();
  res.json({ category });
}


export async function deleteCategory(req, res) {
  const category = await findCategoryOr404(req.params.id);
  const scans = await Scan.countDocuments({ [`composition.${category.id}`]: { $exists: true } });
  const listings = await Listing.countDocuments({ category: category.id });
  if (scans + listings > 0) {
    throw new HttpError(409, `${category.name} is used by ${scans + listings} scans and listings, so it can't be deleted.`);
  }

  await category.deleteOne();
  res.json({ message: `${category.name} deleted.` });
}

export async function createLocation(req, res) {
  if (await Location.exists({ name: req.body.name })) throw new HttpError(409, "That area is already on the list.");
  const location = await Location.create(req.body);
  res.status(201).json({ location: location.name });
}

export async function deleteLocation(req, res) {
  const { deletedCount } = await Location.deleteOne({ name: req.params.name });
  if (deletedCount === 0) throw new HttpError(404, `No area called ${req.params.name}.`);
  res.json({ message: `${req.params.name} removed.` });
}
