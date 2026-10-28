const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError('Please log in to access this resource.', 401);
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing from .env');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('User account no longer exists.', 401);
  req.user = user;
  next();
});

module.exports = { protect };
