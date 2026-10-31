
import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { canMove, operatorRating } from "../utils/listingRules.js";
import { mainCategoryOf } from "../utils/pricing.js";


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

export async function listMyListings(req, res) {
  const listings = await Listing.find({ operatorId: req.user.id }).sort({ created: -1 });
  res.json({ listings: await withParties(listings) });
}

export async function browseListings(req, res) {
  const { status } = req.query;
  const filter = {};
  if (req.user.role === "recycler") filter.status = "available";
  else if (status && status !== "all") filter.status = status;

  const listings = await Listing.find(filter).sort({ created: -1 });
  res.json({ listings: await withParties(listings) });
}

export async function listMyClaims(req, res) {
  const listings = await Listing.find({ recyclerId: req.user.id }).sort({ claimedAt: -1 });
  res.json({ listings: await withParties(listings) });
}

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

export async function completeListing(req, res) {
  const listing = await moveListing(req.params.id, { recyclerId: req.user.id }, "completed", { completedAt: new Date() }, ["claimed"]);
  await sendListing(res, listing);
}

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

export async function cancelListing(req, res) {
  const changes = { cancelReason: req.body.reason };
  const listing =
    req.user.role === "operator"
      ? await moveListing(req.params.id, { operatorId: req.user.id }, "cancelled", changes, ["available"])
      : await moveListing(req.params.id, { recyclerId: req.user.id }, "cancelled", changes, ["claimed"]);
  await sendListing(res, listing);
}
