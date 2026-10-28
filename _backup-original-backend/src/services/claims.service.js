const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');

async function create({ listingId, message = '' }, claimantId) {
  if (!listingId) throw new AppError('listingId is required.', 400);
  if (!mongoose.isValidObjectId(listingId)) throw new AppError('Invalid listingId.', 400);
  if (String(message).length > 500) throw new AppError('message cannot exceed 500 characters.', 400);

  const listing = await Listing.findOne({ _id: listingId, status: 'available' });
  if (!listing) throw new AppError('Listing not found or is not available.', 404);
  if (listing.owner.toString() === claimantId.toString()) {
    throw new AppError('You cannot claim your own listing.', 403);
  }

  const previousActiveClaim = await Claim.findOne({
    listing: listingId,
    claimant: claimantId,
    status: { $in: ['pending', 'approved'] }
  });
  if (previousActiveClaim) throw new AppError('You already have an active claim for this listing.', 409);

  try {
    const claim = await Claim.create({ listing: listingId, claimant: claimantId, message });
    return Claim.findById(claim._id).populate('listing').lean();
  } catch (error) {
    if (error.code === 11000) throw new AppError('A pending claim already exists for this listing.', 409);
    throw error;
  }
}

async function getMine(claimantId) {
  return Claim.find({ claimant: claimantId })
    .populate({ path: 'listing', select: 'title category price quantity unit location imageUrl status owner', populate: { path: 'owner', select: 'name' } })
    .sort({ createdAt: -1 })
    .lean();
}

async function cancel(claimId, claimantId) {
  if (!mongoose.isValidObjectId(claimId)) throw new AppError('Invalid claim ID.', 400);
  const claim = await Claim.findOne({ _id: claimId, claimant: claimantId });
  if (!claim) throw new AppError('Claim not found.', 404);
  if (claim.status !== 'pending') throw new AppError('Only pending claims can be cancelled.', 409);

  claim.status = 'cancelled';
  await claim.save();
  return claim;
}

module.exports = { create, getMine, cancel };
