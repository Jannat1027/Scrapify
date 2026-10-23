import Category from "../models/Category.js";
import Grading from "../models/Grading.js";
import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import { gradePhoto } from "../utils/grading.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { calculatePrice } from "../utils/pricing.js";

async function scanDetails(scan) {
  const json = scan.toJSON();
  const rates = await Category.find();
  const listing = await Listing.activeForScan(scan.id);
  return { ...json, estimate: calculatePrice(json, rates), listingId: listing?.id ?? null };
}

function sameComposition(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => a[key] === b[key]);
}

export async function gradeAndKeep(operatorId, photo) {
  const result = await gradePhoto(photo.buffer);
  const grading = await Grading.create({
    ...result,
    id: makeId("GR"),
    operatorId,
    image: `data:${photo.mimetype};base64,${photo.buffer.toString("base64")}`,
  });
  return { gradingId: grading.id, ...result };
}

export async function createScan(user, { gradingId, weight, composition: chosenComposition, condition: chosenCondition }) {
  const grading = await Grading.useOnce(gradingId, user.id);
  if (!grading) {
    const exists = await Grading.exists({ id: gradingId, operatorId: user.id });
    throw exists
      ? new HttpError(409, "This grading is already saved as a scan.")
      : new HttpError(404, "This grading has expired or isn't yours. Analyse the photo again.");
  }

  const ai = grading.aiResult();
  const composition = chosenComposition ?? ai.composition;
  const condition = chosenCondition ?? ai.condition;
  const corrected = !sameComposition(composition, ai.composition) || condition !== ai.condition;

  try {
    if (corrected) {
      if (!grading.isUnsure()) throw new HttpError(400, "The AI was confident about this batch, so it can't be changed by hand.");
      if (!(await Category.allExist(Object.keys(composition)))) {
        throw new HttpError(400, "The composition uses a plastic type that doesn't exist.");
      }
    }

    const scan = await Scan.create({
      id: makeId("SC"),
      operatorId: user.id,
      location: user.location,
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
    return scanDetails(scan);
  } catch (error) {
    await grading.release();
    throw error;
  }
}

export function listMyScans(operatorId) {
  return Scan.find({ operatorId }).sort({ date: -1 });
}

export async function getScan(operatorId, id) {
  const scan = await Scan.findOne({ id, operatorId });
  if (!scan) throw new HttpError(404, `No scan called ${id} was found at your collection point.`);
  return scanDetails(scan);
}
