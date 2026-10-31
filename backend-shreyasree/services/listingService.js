const Listing = require("../models/Listing");
const Rate = require("../models/Rate");

async function priceListing({ category, condition, weight }) {
  const rate = await Rate.findOne({ id: category });
  const perKg = rate ? rate[condition] : 0;
  return Math.round(perKg * weight);
}

async function claimListing(listingId, recyclerId) {
  return Listing.findOneAndUpdate(
    { id: listingId, status: "available" },
    { status: "claimed", recyclerId, claimedAt: new Date().toISOString() },
    { new: true },
  );
}

module.exports = { priceListing, claimListing };
