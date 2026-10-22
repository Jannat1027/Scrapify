// Operator: grade a photo, save scans, and read the scan history.
import Category from "../models/Category.js";
import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import { gradePhoto } from "../utils/grading.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { calculatePrice } from "../utils/pricing.js";

// Every plastic type in a composition must be a real category.
async function checkCategoriesExist(composition) {
  const ids = Object.keys(composition);
  const found = await Category.countDocuments({ id: { $in: ids } });
  if (found !== ids.length) throw new HttpError(400, "The composition uses a plastic type that doesn't exist.");
}

// A scan as JSON, plus its price estimate from today's rates and the listing made from it (if any).
async function scanDetails(scan) {
  const json = scan.toJSON();
  const rates = await Category.find();
  const listing = await Listing.findOne({ scanId: scan.id, status: { $ne: "cancelled" } });
  return { ...json, estimate: calculatePrice(json, rates), listingId: listing?.id ?? null };
}

// POST /api/scans/grade   (multipart form with a "photo" file)
// Returns { composition, condition, quality, confidence }. Nothing is saved yet:
// the operator checks the result, adds the weight, then saves it with POST /api/scans.
export function grade(req, res) {
  if (!req.file) throw new HttpError(400, "Attach a photo in the \"photo\" field.");
  res.json({ grading: gradePhoto(req.file.buffer) });
}

// POST /api/scans
// The operator id and collection point come from the logged-in user, never from the request.
export async function createScan(req, res) {
  const { composition, aiResult } = req.body;
  await checkCategoriesExist(composition);
  if (aiResult) await checkCategoriesExist(aiResult.composition);

  const scan = await Scan.create({
    ...req.body,
    id: makeId("SC"),
    operatorId: req.user.id,
    location: req.user.location,
    date: new Date(),
  });
  res.status(201).json({ scan: await scanDetails(scan) });
}

// GET /api/scans
// The operator's own scan history, newest first. Photos are left out to keep the list light.
export async function listMyScans(req, res) {
  const scans = await Scan.find({ operatorId: req.user.id }).select("-image").sort({ date: -1 });
  res.json({ scans });
}

// GET /api/scans/:id
export async function getScan(req, res) {
  const scan = await Scan.findOne({ id: req.params.id, operatorId: req.user.id });
  if (!scan) throw new HttpError(404, `No scan called ${req.params.id} was found at your collection point.`);
  res.json({ scan: await scanDetails(scan) });
}
