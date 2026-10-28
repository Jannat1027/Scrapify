require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from .env');
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'demo.seller@example.com';
  let seller = await User.findOne({ email });
  if (!seller) {
    seller = await User.create({
      name: 'Demo Seller',
      email,
      passwordHash: await bcrypt.hash('DemoPass123!', 12)
    });
  }

  const existingCount = await Listing.countDocuments({ owner: seller._id });
  if (existingCount === 0) {
    await Listing.insertMany([
      { owner: seller._id, title: 'Office Chair', description: 'Used office chair in good condition.', category: 'Furniture', condition: 'Good', price: 1200, quantity: 2, unit: 'pieces', location: 'Chattogram', status: 'available' },
      { owner: seller._id, title: 'Study Table', description: 'Wooden study table with minor scratches.', category: 'Furniture', condition: 'Used', price: 1800, quantity: 1, unit: 'piece', location: 'Agrabad, Chattogram', status: 'available' },
      { owner: seller._id, title: 'Computer Keyboard', description: 'USB keyboard, tested and working.', category: 'Electronics', condition: 'Good', price: 350, quantity: 3, unit: 'pieces', location: 'GEC, Chattogram', status: 'available' }
    ]);
  }

  console.log('Seed completed. Demo seller: demo.seller@example.com / DemoPass123!');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
