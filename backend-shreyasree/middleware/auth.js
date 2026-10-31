const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in first" });
  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
}

const requireRole = (...roles) => [
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ id: req.auth.id });
    if (!user || user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet" });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "You are not allowed to do this" });
    }
    req.user = user;
    next();
  }),
];

module.exports = { requireAuth, requireRole };
