// services/listingService.js: reusable business logic for listings (DRY).
// Both operator routes and recycler routes go through here, so the rules live in ONE place.
const Listing = require("../models/Listing");
const Rate = require("../models/Rate");

// Price = weight x today's rate for that category+condition (falls back to 0 if no rate yet).
async function priceListing({ category, condition, weight }) {
  const rate = await Rate.findOne({ id: category });
  const perKg = rate ? rate[condition] : 0;
  return Math.round(perKg * weight);
}

// Atomic claim: only succeeds if the listing was still available. Two recyclers
// clicking at the same moment can never both win.
async function claimListing(listingId, recyclerId) {
  return Listing.findOneAndUpdate(
    { id: listingId, status: "available" },
    { status: "claimed", recyclerId, claimedAt: new Date().toISOString() },
    { new: true },
  );
}

module.exports = { priceListing, claimListing };
