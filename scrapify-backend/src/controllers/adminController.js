// Admin: dashboard numbers, user approval, and reported issues.
// (Category, rate and location management lives in catalogController.js.)
import Category from "../models/Category.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import Scan from "../models/Scan.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { calculatePrice, LOW_CONFIDENCE } from "../utils/pricing.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;

// "2026-10-23T08:15:00Z" -> "2026-10-23", used to group scans by day.
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

// GET /api/admin/stats
// Everything the admin dashboard shows: the stat cards, the three charts,
// pending approvals and the low-confidence / corrected scans.
export async function getStats(req, res) {
  const [scanDocs, listings, categories, pendingUsers, openReports] = await Promise.all([
    Scan.find().select("-image").sort({ date: 1 }),
    Listing.find().select("status"),
    Category.find(),
    User.find({ status: "pending" }).sort({ joined: -1 }),
    Report.countDocuments({ status: "open" }),
  ]);
  const scans = scanDocs.map((scan) => scan.toJSON());

  const completed = listings.filter((listing) => listing.status === "completed").length;
  const settled = listings.filter((listing) => ["completed", "cancelled"].includes(listing.status)).length;

  // Scans per day for the last 14 days, oldest first.
  const scanVolume = [];
  for (let daysBack = CHART_DAYS - 1; daysBack >= 0; daysBack -= 1) {
    const day = dayKey(Date.now() - daysBack * ONE_DAY_MS);
    scanVolume.push({ date: day, count: scans.filter((scan) => dayKey(scan.date) === day).length });
  }

  // Kilograms graded per plastic type, across every scan.
  const kgByType = {};
  scans.forEach((scan) => {
    Object.entries(scan.composition).forEach(([categoryId, percent]) => {
      kgByType[categoryId] = (kgByType[categoryId] || 0) + (scan.weight * percent) / 100;
    });
  });
  const categoryMix = Object.entries(kgByType).map(([categoryId, kg]) => ({ categoryId, kg: Math.round(kg) }));

  // Average estimated ৳ per kg of the scans on each day.
  const valuesByDay = {};
  scans.forEach((scan) => {
    const perKg = calculatePrice(scan, categories).total / scan.weight;
    (valuesByDay[dayKey(scan.date)] ||= []).push(perKg);
  });
  const priceTrend = Object.entries(valuesByDay).map(([date, values]) => ({
    date,
    perKg: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
  }));

  res.json({
    totals: {
      scans: scans.length,
      kgGraded: scans.reduce((sum, scan) => sum + scan.weight, 0),
      liveListings: listings.filter((listing) => listing.status === "available").length,
      listingsAllTime: listings.length,
      completed,
      settled,
      completionRate: settled ? Math.round((completed / settled) * 100) : 0,
      pendingUsers: pendingUsers.length,
      openReports,
    },
    scanVolume,
    categoryMix,
    priceTrend,
    pendingUsers,
    lowConfidenceScans: scans.filter((scan) => scan.confidence < LOW_CONFIDENCE || scan.corrected).reverse(),
  });
}

// GET /api/admin/users?role=operator&status=pending   (both filters optional)
export async function listUsers(req, res) {
  const { role, status } = req.query;
  const filter = {};
  if (role && role !== "all") filter.role = role;
  if (status && status !== "all") filter.status = status;

  const users = await User.find(filter).sort({ joined: -1 });
  res.json({ users });
}

// PATCH /api/admin/users/:id/status   { status, note }
// Approving happens at once; flagging and suspending need a note for the audit log.
export async function setUserStatus(req, res) {
  const { status, note } = req.body;
  if (req.params.id === req.user.id) throw new HttpError(400, "You can't change your own account status.");
  if (status !== "approved" && !note) throw new HttpError(400, "Add a note saying why.");

  const changes = note ? { status, note } : { status };
  const user = await User.findOneAndUpdate({ id: req.params.id }, { $set: changes }, { returnDocument: "after" });
  if (!user) throw new HttpError(404, `No user called ${req.params.id}.`);
  res.json({ user });
}

// GET /api/admin/reports?status=open   (filter optional)
// Each report comes with its listing and the names of both people involved.
export async function listReports(req, res) {
  const filter = req.query.status && req.query.status !== "all" ? { status: req.query.status } : {};
  const reports = await Report.find(filter).sort({ date: -1 });

  const listings = await Listing.find({ id: { $in: reports.map((report) => report.listingId) } });
  const userIds = listings.flatMap((listing) => [listing.operatorId, listing.recyclerId]).filter(Boolean);
  const users = await User.find({ id: { $in: userIds } });
  const profileOf = (userId) => {
    const user = users.find((person) => person.id === userId);
    return user ? { id: user.id, name: user.name, org: user.org, role: user.role, status: user.status } : null;
  };

  res.json({
    reports: reports.map((report) => {
      const listing = listings.find((item) => item.id === report.listingId);
      return {
        ...report.toJSON(),
        listing: listing ? listing.toJSON() : null,
        reporter: profileOf(report.by),
        // The "other party" is whoever the reporter traded with on that listing.
        otherParty: listing ? profileOf(report.by === listing.operatorId ? listing.recyclerId : listing.operatorId) : null,
      };
    }),
  });
}

// PATCH /api/admin/reports/:id/resolve   { resolution }
export async function resolveReport(req, res) {
  const report = await Report.findOneAndUpdate(
    { id: req.params.id, status: "open" },
    { $set: { status: "resolved", resolution: req.body.resolution } },
    { returnDocument: "after" },
  );
  if (!report) {
    const exists = await Report.exists({ id: req.params.id });
    throw exists ? new HttpError(409, "This report is already resolved.") : new HttpError(404, `No report called ${req.params.id}.`);
  }
  res.json({ report });
}
