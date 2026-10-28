const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    condition: { type: String, trim: true, maxlength: 60, default: 'Not specified' },
    price: { type: Number, min: 0, default: 0 },
    quantity: { type: Number, min: 1, default: 1 },
    unit: { type: String, trim: true, maxlength: 30, default: 'item' },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    imageUrl: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['available', 'paused', 'sold'], default: 'available', index: true }
  },
  { timestamps: true }
);

listingSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Listing', listingSchema);
