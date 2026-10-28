const listingsService = require('../services/listings.service');
const asyncHandler = require('../utils/asyncHandler');

const browse = asyncHandler(async (req, res) => {
  const result = await listingsService.browse(req.query);
  res.status(200).json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const listing = await listingsService.getById(req.params.id);
  res.status(200).json({ success: true, data: { listing } });
});

const create = asyncHandler(async (req, res) => {
  const listing = await listingsService.create(req.body, req.user._id);
  res.status(201).json({ success: true, message: 'Listing created.', data: { listing } });
});

module.exports = { browse, getById, create };
