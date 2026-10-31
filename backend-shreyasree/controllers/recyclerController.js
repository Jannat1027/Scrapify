const asyncHandler = require("../utils/asyncHandler");
const Listing = require("../models/Listing");
const Report = require("../models/Report");
const { claimListing } = require("../services/listingService");

exports.browseListings = asyncHandler(async (req, res) => {
  const { category, condition } = req.query;
  const filter = { status: "available" };
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  const listings = await Listing.find(filter).sort({ createdAt: -1 });
  res.json(listings);
});

exports.myClaims = asyncHandler(async (req, res) => {
  const claims = await Listing.find({ recyclerId: req.user.id }).sort({ claimedAt: -1 });
  res.json(claims);
});

exports.claim = asyncHandler(async (req, res) => {
  const listing = await claimListing(req.body.listingId, req.user.id);
  if (!listing) {
    return res.status(409).json({ message: "Someone else claimed this listing first" });
  }
  res.json(listing);
});

exports.report = asyncHandler(async (req, res) => {
  const { listingId, reason } = req.body;
  if (!listingId) return res.status(400).json({ message: "listingId is required" });
  const report = await Report.create({ listingId, by: req.user.id, reason: reason || "" });
  res.status(201).json(report);
});
