const claimsService = require('../services/claims.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const claim = await claimsService.create(req.body, req.user._id);
  res.status(201).json({ success: true, message: 'Claim submitted.', data: { claim } });
});

const getMine = asyncHandler(async (req, res) => {
  const claims = await claimsService.getMine(req.user._id);
  res.status(200).json({ success: true, data: { claims, count: claims.length } });
});

const cancel = asyncHandler(async (req, res) => {
  const claim = await claimsService.cancel(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Claim cancelled.', data: { claim } });
});

module.exports = { create, getMine, cancel };
