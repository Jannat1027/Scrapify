const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing from .env');
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError('name, email and password are required.', 400);
  }
  if (String(name).trim().length < 2) throw new AppError('Name must contain at least 2 characters.', 400);
  if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) throw new AppError('Enter a valid email address.', 400);
  if (String(password).length < 8) throw new AppError('Password must be at least 8 characters.', 400);

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AppError('An account with this email already exists.', 409);

  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
  return { user: safeUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  if (!email || !password) throw new AppError('email and password are required.', 400);

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
  const matches = user && await bcrypt.compare(String(password), user.passwordHash);
  if (!matches) throw new AppError('Invalid email or password.', 401);

  return { user: safeUser(user), token: signToken(user) };
}

module.exports = { register, login, safeUser };
