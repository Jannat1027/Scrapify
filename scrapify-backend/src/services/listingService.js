import Listing from "../models/Listing.js";
import Scan from "../models/Scan.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { operatorRating } from "../utils/listingRules.js";
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

async function details(listing) {
  const [withNames] = await withParties([listing]);
  return withNames;
}

export async function createListing(operatorId, scanId, price) {
  const scan = await Scan.findOne({ id: scanId, operatorId });
  if (!scan) throw new HttpError(404, `No scan called ${scanId} was found at your collection point.`);
  if (await Listing.activeForScan(scan.id)) throw new HttpError(409, "This scan is already listed.");

  const listing = await Listing.create({
    id: makeId("LS"),
    scanId: scan.id,
    operatorId,
    location: scan.location,
    weight: scan.weight,
    price,
    category: mainCategoryOf(Object.fromEntries(scan.composition)),
    condition: scan.condition,
    status: "available",
    created: new Date(),
  });
  return details(listing);
}

export async function listMyListings(operatorId) {
  const listings = await Listing.find({ operatorId }).sort({ created: -1 });
  return withParties(listings);
}

export async function cancelListing(operatorId, id, reason) {
  const listing = await Listing.findOneAndUpdate(
    { id, operatorId, status: "available" },
    { $set: { status: "cancelled", cancelReason: reason } },
    { returnDocument: "after" },
  );
  if (!listing) {
    const existing = await Listing.findOne({ id });
    if (!existing) throw new HttpError(404, `No listing called ${id}.`);
    if (existing.operatorId !== operatorId) throw new HttpError(403, "This listing isn't yours.");
    throw new HttpError(409, `This listing is ${existing.status}, so it can't be cancelled now.`);
  }
  return details(listing);
}
