
import Category from "../models/Category.js";
import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import { gradePhoto } from "../utils/grading.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { calculatePrice } from "../utils/pricing.js";


async function checkCategoriesExist(composition) {
  const ids = Object.keys(composition);
  const found = await Category.countDocuments({ id: { $in: ids } });
  if (found !== ids.length) throw new HttpError(400, "The composition uses a plastic type that doesn't exist.");
}


async function scanDetails(scan) {
  const json = scan.toJSON();
  const rates = await Category.find();
  const listing = await Listing.findOne({ scanId: scan.id, status: { $ne: "cancelled" } });
  return { ...json, estimate: calculatePrice(json, rates), listingId: listing?.id ?? null };
}

export function grade(req, res) {
  if (!req.file) throw new HttpError(400, "Attach a photo in the \"photo\" field.");
  res.json({ grading: gradePhoto(req.file.buffer) });
}


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

export async function listMyScans(req, res) {
  const scans = await Scan.find({ operatorId: req.user.id }).select("-image").sort({ date: -1 });
  res.json({ scans });
}

export async function getScan(req, res) {
  const scan = await Scan.findOne({ id: req.params.id, operatorId: req.user.id });
  if (!scan) throw new HttpError(404, `No scan called ${req.params.id} was found at your collection point.`);
  res.json({ scan: await scanDetails(scan) });
}
