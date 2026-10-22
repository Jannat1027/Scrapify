// ---------------------------------------------------------------------------
// The marketplace.
// Listing lifecycle: available -> claimed -> completed, or cancelled.
// Every status change is one atomic findOneAndUpdate that also checks the
// current status, so two people acting at the same moment can't both win
// (for example, two recyclers claiming the same batch).
// ---------------------------------------------------------------------------
import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { canMove, operatorRating } from "../utils/listingRules.js";
import { mainCategoryOf } from "../utils/pricing.js";

// Adds who is on each side of the trade, so the pages can show names, shops and ratings.
//   listing.operator = { id, name, org, location, rating }   listing.recycler = { id, name, org, location }
async function withParties(listings) {
  const userIds = [...new Set(listings.flatMap((listing) => [listing.operatorId, listing.recyclerId]).filter(Boolean))];
  const users = await User.find({ id: { $in: userIds } });
  const operatorIds = [...new Set(listings.map((listing) => listing.operatorId))];
  const rated = await Listing.find({ operatorId: { $in: operatorIds }, rating: { $exists: true } }).select("operatorId rating");

  const profileOf = (userId) => {
    const user = users.find((person) => person.id === userId);
    return user ? { id: user.id, name: user.name, org: user.org, location: user.location } : null;
  };

  return listings.map((listing) => ({
    ...listing.toJSON(),
    operator: { ...profileOf(listing.operatorId), rating: operatorRating(rated, listing.operatorId) },
    recycler: listing.recyclerId ? profileOf(listing.recyclerId) : null,
  }));
}

async function sendListing(res, listing, status = 200) {
  const [details] = await withParties([listing]);
  res.status(status).json({ listing: details });
}

// Moves a listing to a new status in a single atomic step.
// `who` limits it to the listing's operator or recycler; `fromStatuses` defaults to
// every status the lifecycle allows. When nothing matches, the listing is read again
// to explain exactly why.
async function moveListing(listingId, who, toStatus, changes = {}, fromStatuses = null) {
  const allowedFrom = (fromStatuses || ["available", "claimed"]).filter((status) => canMove(status, toStatus));
  const updated = await Listing.findOneAndUpdate(
    { id: listingId, ...who, status: { $in: allowedFrom } },
    { $set: { status: toStatus, ...changes } },
    { returnDocument: "after" },
  );
  if (updated) return updated;

  const listing = await Listing.findOne({ id: listingId });
  if (!listing) throw new HttpError(404, `No listing called ${listingId}.`);
  const isTheirs = Object.entries(who).every(([field, value]) => listing[field] === value);
  if (!isTheirs) throw new HttpError(403, "This listing isn't yours.");
  throw new HttpError(409, `This listing is ${listing.status}, so it can't be ${toStatus} now.`);
}

// ---------- Operator ----------

// POST /api/listings   { scanId, price }
// Puts one of the operator's saved scans on the market at a fixed price.
export async function createListing(req, res) {
  const scan = await Scan.findOne({ id: req.body.scanId, operatorId: req.user.id });
  if (!scan) throw new HttpError(404, `No scan called ${req.body.scanId} was found at your collection point.`);
  if (await Listing.exists({ scanId: scan.id, status: { $ne: "cancelled" } })) {
    throw new HttpError(409, "This scan is already listed.");
  }

  const composition = Object.fromEntries(scan.composition);
  const listing = await Listing.create({
    id: makeId("LS"),
    scanId: scan.id,
    operatorId: req.user.id,
    location: scan.location,
    weight: scan.weight,
    price: req.body.price,
    category: mainCategoryOf(composition),
    condition: scan.condition,
    status: "available",
    created: new Date(),
  });
  await sendListing(res, listing, 201);
}

// GET /api/listings/mine
export async function listMyListings(req, res) {
  const listings = await Listing.find({ operatorId: req.user.id }).sort({ created: -1 });
  res.json({ listings: await withParties(listings) });
}

// ---------- Recycler (and admin) ----------

// GET /api/listings?status=available
// Recyclers only see what is on the market. The admin can ask for any status, or leave it out for all.
export async function browseListings(req, res) {
  const { status } = req.query;
  const filter = {};
  if (req.user.role === "recycler") filter.status = "available";
  else if (status && status !== "all") filter.status = status;

  const listings = await Listing.find(filter).sort({ created: -1 });
  res.json({ listings: await withParties(listings) });
}

// GET /api/listings/claims
export async function listMyClaims(req, res) {
  const listings = await Listing.find({ recyclerId: req.user.id }).sort({ claimedAt: -1 });
  res.json({ listings: await withParties(listings) });
}

// PATCH /api/listings/:id/claim
// Only an available listing can be claimed. This is what stops two recyclers buying the same batch.
export async function claimListing(req, res) {
  const listing = await Listing.findOneAndUpdate(
    { id: req.params.id, status: "available" },
    { $set: { status: "claimed", recyclerId: req.user.id, claimedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!listing) {
    const exists = await Listing.exists({ id: req.params.id });
    if (!exists) throw new HttpError(404, `No listing called ${req.params.id}.`);
    throw new HttpError(409, "Someone else claimed this batch a moment ago.");
  }
  await sendListing(res, listing);
}

// PATCH /api/listings/:id/complete
export async function completeListing(req, res) {
  const listing = await moveListing(req.params.id, { recyclerId: req.user.id }, "completed", { completedAt: new Date() }, ["claimed"]);
  await sendListing(res, listing);
}

// PATCH /api/listings/:id/rate   { rating: 1-5 }
// Only the recycler who completed the trade can rate it, and only once.
export async function rateListing(req, res) {
  const listing = await Listing.findOneAndUpdate(
    { id: req.params.id, recyclerId: req.user.id, status: "completed", rating: { $exists: false } },
    { $set: { rating: req.body.rating } },
    { returnDocument: "after" },
  );
  if (!listing) {
    const existing = await Listing.findOne({ id: req.params.id });
    if (!existing) throw new HttpError(404, `No listing called ${req.params.id}.`);
    if (existing.recyclerId !== req.user.id) throw new HttpError(403, "You can only rate your own claims.");
    if (existing.status !== "completed") throw new HttpError(409, "You can rate the operator once the trade is completed.");
    throw new HttpError(409, "You have already rated this trade.");
  }
  await sendListing(res, listing);
}

// ---------- Both ----------

// PATCH /api/listings/:id/cancel   { reason }
// Operators cancel their own listing while it is still available.
// Recyclers cancel their own claim (with a reason), which the operator then sees.
export async function cancelListing(req, res) {
  const changes = { cancelReason: req.body.reason };
  const listing =
    req.user.role === "operator"
      ? await moveListing(req.params.id, { operatorId: req.user.id }, "cancelled", changes, ["available"])
      : await moveListing(req.params.id, { recyclerId: req.user.id }, "cancelled", changes, ["claimed"]);
  await sendListing(res, listing);
}
