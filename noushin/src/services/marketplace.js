// Marketplace rules and lookups shared by many pages.
import { makeId, nowIso } from "../utils/format.js";
import { mainCategoryOf } from "./pricing.js";

// Where each role lands after logging in.
export const HOME_PAGE_FOR_ROLE = {
  operator: "/operator",
  recycler: "/recycler",
  admin: "/admin",
};

// Roles whose pages exist in this app. When the other branches are merged in, add "operator" and "admin".
export const ENABLED_ROLES = ["recycler"];

export const ROLE_LABELS = {
  operator: "Operator",
  recycler: "Recycler",
  admin: "Admin",
};

// Text and colour for every status badge.
export const STATUS_LABELS = {
  all: "All",
  available: "Available",
  claimed: "Claimed",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
  approved: "Approved",
  suspended: "Suspended",
  flagged: "Flagged",
  open: "Open",
  resolved: "Resolved",
};

export const STATUS_TONES = {
  available: "green", approved: "green", resolved: "green",
  claimed: "blue", completed: "violet",
  pending: "amber", open: "amber", flagged: "amber",
  cancelled: "red", suspended: "red",
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

// Only an available listing can be claimed. This is what stops two recyclers buying the same batch.
export function canBeClaimed(listing) {
  return Boolean(listing) && listing.status === "available";
}

// Average star rating an operator has received, or "New" when nobody has rated them yet.
export function operatorRating(listings, operatorId) {
  const rated = listings.filter((listing) => listing.operatorId === operatorId && listing.rating);
  if (rated.length === 0) return "New";
  const totalStars = rated.reduce((sum, listing) => sum + listing.rating, 0);
  return (totalStars / rated.length).toFixed(1);
}

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

// In a report, the "other party" is whoever the reporter traded with on that listing.
export function otherPartyId(report, listing) {
  return report.by === listing.operatorId ? listing.recyclerId : listing.operatorId;
}
