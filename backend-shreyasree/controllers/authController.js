// controllers/authController.js: register / login / me. Thin — the rules live in the models and services.
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

// Makes a token that stores only the user id and role.
function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, org, location } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password and role are required" });
  }
  if (!["operator", "recycler"].includes(role)) {
    return res.status(400).json({ message: "Choose operator or recycler (admins are not self-registered)" });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "This email is already registered" });

  const user = await User.create({ name, email, password, role, org, location });
  res.status(201).json({ message: "Account created. An admin will approve it soon.", userId: user.id });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
  if (!user || !(await user.checkPassword(password || ""))) {
    return res.status(401).json({ message: "Wrong email or password" });
  }
  if (user.status === "pending") {
    return res.status(403).json({ message: "Your account is waiting for admin approval" });
  }
  if (user.status === "suspended") {
    return res.status(403).json({ message: "Your account is suspended. Contact Scrapify support." });
  }
  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, role: user.role } });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.auth.id });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, org: user.org, status: user.status });
});
