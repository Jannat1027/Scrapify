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

async function sendListing(res, listing, status = 200) {
  const [details] = await withParties([listing]);
  res.status(status).json({ listing: details });
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

export async function cancelListing(req, res) {
  const { id } = req.params;
  const listing = await Listing.findOneAndUpdate(
    { id, operatorId: req.user.id, status: "available" },
    { $set: { status: "cancelled", cancelReason: req.body.reason } },
    { returnDocument: "after" },
  );
  if (!listing) {
    const existing = await Listing.findOne({ id });
    if (!existing) throw new HttpError(404, `No listing called ${id}.`);
    if (existing.operatorId !== req.user.id) throw new HttpError(403, "This listing isn't yours.");
    throw new HttpError(409, `This listing is ${existing.status}, so it can't be cancelled now.`);
  }
  await sendListing(res, listing);
}
