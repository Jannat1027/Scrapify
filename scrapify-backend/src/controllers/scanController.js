
import Category from "../models/Category.js";
import Grading from "../models/Grading.js";
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

// POST /api/scans/grade   (multipart, field "photo")
// Grades the photo and keeps the result, with the photo, under a gradingId that the scan is saved from.
export async function grade(req, res) {
  if (!req.file) throw new HttpError(400, "Attach a photo in the \"photo\" field.");

  const result = gradePhoto(req.file.buffer);
  const grading = await Grading.create({
    ...result,
    id: makeId("GR"),
    operatorId: req.user.id,
    image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
  });
  res.json({ grading: { gradingId: grading.id, ...result } });
}

// POST /api/scans   { gradingId, weight, composition?, condition? }
// The AI answer, confidence, photo quality and photo come from the stored grading. The operator may correct
// the plastic type and condition: then the scan is marked "corrected" and the AI's first answer is kept in aiResult.
export async function createScan(req, res) {
  const { gradingId, weight, composition, condition } = req.body;

  const grading = await Grading.findOne({ id: gradingId, operatorId: req.user.id });
  if (!grading) throw new HttpError(404, "This photo's grading has expired or was already saved. Analyse the photo again.");

  const aiComposition = Object.fromEntries(grading.composition);
  const finalComposition = composition ?? aiComposition;
  const finalCondition = condition ?? grading.condition;
  await checkCategoriesExist(finalComposition);

  const corrected = JSON.stringify(sortedEntries(finalComposition)) !== JSON.stringify(sortedEntries(aiComposition)) || finalCondition !== grading.condition;

  const scan = await Scan.create({
    id: makeId("SC"),
    operatorId: req.user.id,
    location: req.user.location,
    date: new Date(),
    weight,
    composition: finalComposition,
    condition: finalCondition,
    confidence: grading.confidence,
    quality: grading.quality,
    image: grading.image,
    corrected,
    aiResult: corrected ? { composition: aiComposition, condition: grading.condition } : undefined,
  });
  await grading.deleteOne();
  res.status(201).json({ scan: await scanDetails(scan) });
}

const sortedEntries = (composition) => Object.entries(composition).sort(([a], [b]) => a.localeCompare(b));

export async function listMyScans(req, res) {
  const scans = await Scan.find({ operatorId: req.user.id }).select("-image").sort({ date: -1 });
  res.json({ scans });
}

export async function getScan(req, res) {
  const scan = await Scan.findOne({ id: req.params.id, operatorId: req.user.id });
  if (!scan) throw new HttpError(404, `No scan called ${req.params.id} was found at your collection point.`);
  res.json({ scan: await scanDetails(scan) });
}
