// controllers/adminController.js: user approval, reports, price rates.
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Report = require("../models/Report");
const Rate = require("../models/Rate");

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

exports.setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["approved", "pending", "suspended"].includes(status)) {
    return res.status(400).json({ message: "status must be approved, pending or suspended" });
  }
  const user = await User.findOneAndUpdate(
    { id: req.params.id },
    { status },
    { new: true },
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

exports.listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

exports.resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findOneAndUpdate(
    { id: req.params.id },
    { status: req.body.status || "resolved" },
    { new: true },
  );
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
});

exports.listRates = asyncHandler(async (req, res) => {
  res.json(await Rate.find().sort({ id: 1 }));
});

// Upsert: creates the rate row if it does not exist yet.
exports.updateRate = asyncHandler(async (req, res) => {
  const { clean, light, heavy, source } = req.body;
  if (clean == null || light == null || heavy == null) {
    return res.status(400).json({ message: "clean, light and heavy prices are required" });
  }
  const rate = await Rate.findOneAndUpdate(
    { id: req.params.categoryId },
    { clean, light, heavy, source: source || "Admin" },
    { new: true, upsert: true },
  );
  res.json(rate);
});
