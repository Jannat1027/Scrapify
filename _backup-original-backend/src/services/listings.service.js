const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');
const escapeRegex = require('../utils/escapeRegex');

async function browse({ search = '', category = '', page = 1, limit = 12 }) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 12));
  const filter = { status: 'available' };

  if (category.trim()) filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
  if (search.trim()) {
    const term = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: term }, { description: term }, { category: term }, { location: term }];
  }

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Listing.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

async function getById(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid listing ID.', 400);
  const listing = await Listing.findOne({ _id: id, status: 'available' })
    .populate('owner', 'name')
    .lean();
  if (!listing) throw new AppError('Listing not found or is not available.', 404);
  return listing;
}

async function create(data, ownerId) {
  const { title, description, category, location } = data;
  if (!title || !description || !category || !location) {
    throw new AppError('title, description, category and location are required.', 400);
  }
  if (data.price !== undefined && (!Number.isFinite(Number(data.price)) || Number(data.price) < 0)) {
    throw new AppError('price must be a non-negative number.', 400);
  }
  if (data.quantity !== undefined && (!Number.isFinite(Number(data.quantity)) || Number(data.quantity) < 1)) {
    throw new AppError('quantity must be a number greater than or equal to 1.', 400);
  }

  return Listing.create({
    owner: ownerId,
    title,
    description,
    category,
    location,
    condition: data.condition,
    price: data.price,
    quantity: data.quantity,
    unit: data.unit,
    imageUrl: data.imageUrl
  });
}

module.exports = { browse, getById, create };
