// controllers/operatorController.js: scans and listings owned by the logged-in operator.
const asyncHandler = require("../utils/asyncHandler");
const Scan = require("../models/Scan");
const Listing = require("../models/Listing");
const { priceListing } = require("../services/listingService");

exports.myScans = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ operatorId: req.user.id }).sort({ createdAt: -1 });
  res.json(scans);
});

exports.createScan = asyncHandler(async (req, res) => {
  const { location, weight, condition, confidence, quality, composition, notes } = req.body;
  if (!location || !weight || !condition) {
    return res.status(400).json({ message: "location, weight and condition are required" });
  }
  const scan = await Scan.create({
    operatorId: req.user.id,
    location,
    weight,
    condition,
    confidence: confidence ?? 0.8,
    quality: quality || "good",
    composition: composition || {},
    notes: notes || "",
  });
  res.status(201).json(scan);
});

exports.getScan = asyncHandler(async (req, res) => {
  const scan = await Scan.findOne({ id: req.params.scanId, operatorId: req.user.id });
  if (!scan) return res.status(404).json({ message: "Scan not found" });
  res.json(scan);
});

exports.myListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ operatorId: req.user.id }).sort({ createdAt: -1 });
  res.json(listings);
});

// Creates a listing from a scan (or raw values), priced automatically from today's rates.
exports.createListing = asyncHandler(async (req, res) => {
  let { scanId, category, condition, weight } = req.body;
  if (scanId) {
    const scan = await Scan.findOne({ id: scanId, operatorId: req.user.id });
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    category = category || Object.keys(scan.composite || scan.composition || {})[0] || "mixed";
    condition = condition || scan.condition;
    weight = weight || scan.weight;
  }
  if (!category || !condition || !weight) {
    return res.status(400).json({ message: "category, condition and weight are required" });
  }
  const price = await priceListing({ category, condition, weight });
  const listing = await Listing.create({
    scanId: scanId || null,
    operatorId: req.user.id,
    category,
    condition,
    weight,
    price,
  });
  res.status(201).json(listing);
});

exports.removeListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findOneAndDelete({ id: req.params.id, operatorId: req.user.id, status: "available" });
  if (!listing) return res.status(404).json({ message: "Listing not found (or already claimed)" });
  res.json({ message: "Listing removed" });
});
