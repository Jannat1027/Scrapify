// Marketplace rules and lookups shared by many pages.
import { makeId, nowIso } from "../utils/format.js";
import { mainCategoryOf } from "./pricing.js";

export const ROLE_LABELS = {
  operator: "Operator",
};

// Text and colour for every status badge.
export const STATUS_LABELS = {
  all: "All",
  available: "Available",
  claimed: "Claimed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_TONES = {
  available: "green",
  claimed: "blue", completed: "violet",
  cancelled: "red",
};

export const PHOTO_QUALITY_LABELS = { good: "Clear photo", dark: "Too dark", blurry: "Blurry" };

// Colours used for each plastic type in bars, charts and thumbnails.
const CATEGORY_COLORS = { pet: "#38bdf8", hdpe: "#a78bfa", pp: "#fbbf24", film: "#84cc16", mixed: "#94a3b8" };
export function categoryColor(categoryId) {
  return CATEGORY_COLORS[categoryId] || "#94a3b8";
}

// ---------- Lookups (data is the object from useData()) ----------

export function findCategory(data, categoryId) {
  return data.categories.find((category) => category.id === categoryId) || { id: categoryId, name: categoryId, icon: "recycle" };
}

export function conditionName(data, conditionId) {
  const condition = data.conditions.find((item) => item.id === conditionId);
  return condition ? condition.name : conditionId;
}

export function findUser(data, userId) {
  return data.users.find((user) => user.id === userId) || { id: userId, name: "Unknown", org: "-", role: "operator", status: "approved" };
}

// ---------- Listing rules ----------
// Listing lifecycle: available -> claimed -> completed, or cancelled.

// Turns a graded draft into a saved scan record for the operator's scan history.
// It keeps the small photo, and the AI's original answer (aiResult) if the operator corrected it.
export function createScan(draftScan, operator, weight) {
  return {
    ...draftScan,
    id: makeId("SC"),
    operatorId: operator.id,
    location: operator.location,
    weight,
  };
}

// Puts a saved scan on the market at a fixed price. The listing points back to its scan (scanId).
export function createListing(scan, price) {
  return {
    id: makeId("LS"),
    scanId: scan.id,
    operatorId: scan.operatorId,
    location: scan.location,
    weight: scan.weight,
    price,
    category: mainCategoryOf(scan.composition),
    condition: scan.condition,
    status: "available",
    created: nowIso(),
  };
}

// A short description of a grading, e.g. "Clear PET 60%, Clean". Used in the correction log.
export function describeGrading(data, { composition, condition }) {
  const mainType = mainCategoryOf(composition);
  return `${findCategory(data, mainType).name} ${composition[mainType]}%, ${conditionName(data, condition)}`;
}

export function createReport(listingId, reporterId, reason) {
  return { id: makeId("RP"), listingId, by: reporterId, reason, status: "open", date: nowIso() };
}
