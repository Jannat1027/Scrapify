import { HttpError } from "./httpError.js";

const MODEL = "Xenova/clip-vit-base-patch32";

const TYPE_LABELS = [
  { text: "a pile of clear plastic water bottles", id: "pet" },
  { text: "plastic detergent, oil or milk jugs", id: "hdpe" },
  { text: "plastic food containers, caps and buckets", id: "pp" },
  { text: "plastic bags and plastic film", id: "film" },
  { text: "mixed colorful plastic waste", id: "mixed" },
  { text: "a photo with no plastic, such as an animal, a person, food or scenery", id: "none" },
];

const CONDITION_LABELS = [
  { text: "clean washed plastic", id: "clean" },
  { text: "slightly dirty plastic", id: "light" },
  { text: "very dirty, muddy, greasy plastic", id: "heavy" },
];

const QUALITY_LABELS = [
  { text: "a sharp, well lit photo", id: "good" },
  { text: "a dark photo", id: "dark" },
  { text: "a blurry photo", id: "blurry" },
];

const PLASTIC_IDS = TYPE_LABELS.map((label) => label.id).filter((id) => id !== "none");

let tools = null;

function loadTools() {
  tools ??= import("@huggingface/transformers")
    .then(async ({ pipeline, RawImage }) => ({
      RawImage,
      classify: await pipeline("zero-shot-image-classification", MODEL),
    }))
    .catch((error) => {
      tools = null;
      console.error("AI grading model could not load:", error.message);
      throw error;
    });
  return tools;
}

export function warmUpGrader() {
  loadTools().then(
    () => console.log("AI grading model is ready."),
    () => {},
  );
}

async function score(image, classify, labels) {
  const results = await classify(image, labels.map((label) => label.text));
  const scores = {};
  for (const result of results) {
    const match = labels.find((label) => label.text === result.label);
    if (match) scores[match.id] = result.score;
  }
  return scores;
}

function best(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export async function gradePhoto(photoBuffer) {
  let loaded;
  try {
    loaded = await loadTools();
  } catch {
    throw new HttpError(503, "The AI model could not start. Check the internet connection and try again.");
  }
  const { RawImage, classify } = loaded;

  let image;
  try {
    image = await RawImage.fromBlob(new Blob([photoBuffer]));
  } catch {
    throw new HttpError(400, "That file could not be read as a photo.");
  }

  const types = await score(image, classify, TYPE_LABELS);
  if (best(types) === "none" || (types.none ?? 0) > 0.4) {
    throw new HttpError(422, "No plastic found in this photo. Please upload a photo of plastic scrap.");
  }

  const plasticTotal = PLASTIC_IDS.reduce((sum, id) => sum + (types[id] ?? 0), 0);
  let shares = PLASTIC_IDS
    .map((id) => ({ id, pct: Math.round(((types[id] ?? 0) / plasticTotal) * 100) }))
    .filter((share) => share.pct >= 5)
    .sort((a, b) => b.pct - a.pct);
  const kept = shares.reduce((sum, share) => sum + share.pct, 0);
  shares = shares.map((share) => ({ ...share, pct: Math.round((share.pct / kept) * 100) }));
  const rest = 100 - shares.reduce((sum, share) => sum + share.pct, 0);
  shares[0].pct += rest;

  const composition = {};
  for (const share of shares) composition[share.id] = share.pct;

  const condition = best(await score(image, classify, CONDITION_LABELS));
  const quality = best(await score(image, classify, QUALITY_LABELS));

  const topScore = Math.max(...PLASTIC_IDS.map((id) => types[id] ?? 0));
  const confidence = Math.round(Math.min(0.95, Math.max(0.3, topScore)) * 100) / 100;

  return { composition, condition, quality, confidence };
}
