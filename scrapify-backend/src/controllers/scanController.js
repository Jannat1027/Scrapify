import Category from "../models/Category.js";
import Grading from "../models/Grading.js";
import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import { gradePhoto } from "../utils/grading.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { calculatePrice, LOW_CONFIDENCE } from "../utils/pricing.js";

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

export async function grade(req, res) {
  if (!req.file) throw new HttpError(400, "Attach a photo in the \"photo\" field.");
  const result = await gradePhoto(req.file.buffer);
  const grading = await Grading.create({
    ...result,
    id: makeId("GR"),
    operatorId: req.user.id,
    image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
  });
  res.json({ grading: { gradingId: grading.id, ...result } });
}

function sameComposition(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => a[key] === b[key]);
}

export async function createScan(req, res) {
  const { gradingId, weight } = req.body;
  const grading = await Grading.findOneAndUpdate(
    { id: gradingId, operatorId: req.user.id, usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!grading) {
    const exists = await Grading.exists({ id: gradingId, operatorId: req.user.id });
    throw exists
      ? new HttpError(409, "This grading is already saved as a scan.")
      : new HttpError(404, "This grading has expired or isn't yours. Analyse the photo again.");
  }

  const ai = { composition: Object.fromEntries(grading.composition), condition: grading.condition };
  const composition = req.body.composition ?? ai.composition;
  const condition = req.body.condition ?? ai.condition;
  const corrected = !sameComposition(composition, ai.composition) || condition !== ai.condition;

  try {
    if (corrected) {
      const unsure = grading.confidence < LOW_CONFIDENCE || grading.quality !== "good";
      if (!unsure) throw new HttpError(400, "The AI was confident about this batch, so it can't be changed by hand.");
      await checkCategoriesExist(composition);
    }

    const scan = await Scan.create({
      id: makeId("SC"),
      operatorId: req.user.id,
      location: req.user.location,
      date: new Date(),
      weight,
      composition,
      condition,
      confidence: grading.confidence,
      quality: grading.quality,
      corrected,
      aiResult: corrected ? ai : undefined,
      image: grading.image,
      gradingId: grading.id,
    });
    res.status(201).json({ scan: await scanDetails(scan) });
  } catch (error) {
    await Grading.updateOne({ id: grading.id }, { $unset: { usedAt: 1 } });
    throw error;
  }
}

export async function listMyScans(req, res) {
  const scans = await Scan.find({ operatorId: req.user.id }).sort({ date: -1 });
  res.json({ scans });
}

export async function getScan(req, res) {
  const scan = await Scan.findOne({ id: req.params.id, operatorId: req.user.id });
  if (!scan) throw new HttpError(404, `No scan called ${req.params.id} was found at your collection point.`);
  res.json({ scan: await scanDetails(scan) });
}
