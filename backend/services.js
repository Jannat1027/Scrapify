import mongoose from "mongoose";
import { User, PriceRate, Location, Report, scansCollection, listingsCollection } from "./models.js";
import {
  AppError, STATUS, MESSAGES, requireFields,
  ROLES, USER_STATUS, REGISTERABLE_ROLES, NOTE_REQUIRED_FOR,
  MIN_PASSWORD_LENGTH, MIN_NOTE_LENGTH, MIN_LOCATION_LENGTH, LOW_CONFIDENCE, REPORT_STATUS,
} from "./utils.js";

// ======================= AUTH (Nou) =======================
export async function registerUser(body) {
  requireFields(body, ["name", "org", "location", "email", "password", "role"]);
  const { name, org, location, email, password, role } = body;

  if (!REGISTERABLE_ROLES.includes(role)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AUTH.ROLE_INVALID);
  if (password.length < MIN_PASSWORD_LENGTH) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AUTH.PASSWORD_SHORT);
  if (await User.emailExists(email)) throw new AppError(STATUS.CONFLICT, MESSAGES.AUTH.EMAIL_TAKEN);

  return User.create({ name, org, location, email, password, role });
}

export async function loginUser(body) {
  requireFields(body, ["email", "password"]);

  const user = await User.findByEmailWithPassword(body.email);
  if (!user || !(await user.comparePassword(body.password))) {
    throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  const blocked = user.loginBlockReason();
  if (blocked) throw new AppError(STATUS.FORBIDDEN, MESSAGES.AUTH.BLOCKED[blocked]);

  return { token: user.generateToken(), user };
}

// ======================= ADMIN (Umama) =======================
export async function listUsers(query) {
  const { role, status } = query;
  if (role && !Object.values(ROLES).includes(role)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.FILTER_INVALID);
  if (status && !Object.values(USER_STATUS).includes(status)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.FILTER_INVALID);

  return User.listManaged({ role, status });
}

const CHANGEABLE_TO = [USER_STATUS.APPROVED, USER_STATUS.FLAGGED, USER_STATUS.SUSPENDED];

export async function changeUserStatus(id, body) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.INVALID_ID);

  const { status } = body ?? {};
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!CHANGEABLE_TO.includes(status)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.STATUS_INVALID);
  if (NOTE_REQUIRED_FOR.includes(status) && note.length < MIN_NOTE_LENGTH) {
    throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.NOTE_REQUIRED);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.NOT_FOUND);
  if (user.role === ROLES.ADMIN) throw new AppError(STATUS.FORBIDDEN, MESSAGES.USER.ADMIN_PROTECTED);
  if (user.status === status) throw new AppError(STATUS.CONFLICT, MESSAGES.USER.alreadyHasStatus(status));

  return user.changeStatus(status, note);
}

// ----- Rates and categories -----
export async function listPriceRates() {
  return PriceRate.listAll();
}

const RATE_FIELDS = ["clean", "light", "heavy"];

// Reads and checks the three prices and the source. required = true when adding a new category.
function readRateFields(body, { required }) {
  const fields = {};

  for (const field of RATE_FIELDS) {
    if (body?.[field] === undefined) {
      if (required) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.VALUE_INVALID);
      continue;
    }
    const value = body[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.VALUE_INVALID);
    }
    fields[field] = value;
  }

  if (body?.source === undefined) {
    if (required) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.SOURCE_REQUIRED);
  } else {
    if (typeof body.source !== "string" || body.source.trim() === "") {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.SOURCE_REQUIRED);
    }
    fields.source = body.source.trim();
  }

  return fields;
}

// Reads and checks the category name and note.
function readNameAndNote(body, { required }) {
  const fields = {};

  if (body?.name === undefined) {
    if (required) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.NAME_INVALID);
  } else {
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.NAME_INVALID);
    }
    fields.name = body.name.trim();
  }

  if (body?.note !== undefined) {
    if (typeof body.note !== "string") throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.NOTE_INVALID);
    fields.note = body.note.trim();
  }

  return fields;
}

// Edits prices, source, name and note. The category id never changes, so old scans keep working after a rename.
export async function updatePriceRate(category, body) {
  const changes = { ...readNameAndNote(body, { required: false }), ...readRateFields(body, { required: false }) };
  if (Object.keys(changes).length === 0) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RATE.NOTHING_TO_UPDATE);

  const rate = await PriceRate.findByCategory(category);
  if (!rate) throw new AppError(STATUS.NOT_FOUND, MESSAGES.RATE.NOT_FOUND);

  return rate.applyChanges(changes);
}

export async function createCategory(body) {
  const names = readNameAndNote(body, { required: true });
  const rates = readRateFields(body, { required: true });

  const category = PriceRate.keyFromName(names.name);
  if (!category) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CATEGORY.NAME_UNUSABLE);
  if (await PriceRate.exists({ category })) throw new AppError(STATUS.CONFLICT, MESSAGES.CATEGORY.EXISTS);

  return PriceRate.create({ category, note: "", ...names, ...rates });
}

export async function deleteCategory(category) {
  const rate = await PriceRate.findByCategory(category);
  if (!rate) throw new AppError(STATUS.NOT_FOUND, MESSAGES.RATE.NOT_FOUND);

  const uses = await rate.countUsage();
  if (uses > 0) throw new AppError(STATUS.CONFLICT, MESSAGES.CATEGORY.inUse(rate.name, uses));

  await rate.deleteOne();
  return rate;
}

// ----- Locations -----
export async function listLocations() {
  return Location.listAll();
}

export async function addLocation(body) {
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < MIN_LOCATION_LENGTH) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.LOCATION.TOO_SHORT);
  if (await Location.existsByName(name)) throw new AppError(STATUS.CONFLICT, MESSAGES.LOCATION.EXISTS);

  return Location.create({ name, key: Location.keyFromName(name) });
}

export async function removeLocation(id) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.LOCATION.INVALID_ID);

  const location = await Location.findByIdAndDelete(id);
  if (!location) throw new AppError(STATUS.NOT_FOUND, MESSAGES.LOCATION.NOT_FOUND);
  return location;
}

// ----- Reports -----
const validIds = (ids) => [...new Set(ids.filter(Boolean).map(String))].filter((id) => mongoose.isObjectIdOrHexString(id));

// Each report also gets its listing (if it exists) and the "other party": whoever the reporter traded with.
export async function listReports(query) {
  const { status } = query;
  if (status && !Object.values(REPORT_STATUS).includes(status)) {
    throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REPORT.FILTER_INVALID);
  }

  const reports = await Report.listFiltered({ status });

  const codes = reports.map((report) => report.listingCode);
  const listings = codes.length ? await listingsCollection().find({ code: { $in: codes } }).toArray() : [];
  const listingByCode = new Map(listings.map((listing) => [listing.code, listing]));

  const rows = reports.map((report) => {
    const listing = listingByCode.get(report.listingCode) || null;
    let otherId = null;
    if (listing) {
      const reporterId = String(report.reporter?._id ?? report.reporter);
      otherId = String(listing.operator) === reporterId ? listing.recycler : listing.operator;
    }
    return { report, listing, otherId: otherId ? String(otherId) : null };
  });

  const others = await User.findBriefByIds(validIds(rows.map((row) => row.otherId)));
  const otherById = new Map(others.map((user) => [String(user._id), user]));

  return rows.map(({ report, listing, otherId }) => ({
    ...report.toJSON(),
    listing: listing
      ? {
          code: listing.code,
          category: listing.category,
          condition: listing.condition,
          weight: listing.weight,
          price: listing.price,
          status: listing.status,
        }
      : null,
    otherParty: otherId && otherById.has(otherId) ? otherById.get(otherId).toJSON() : null,
  }));
}

export async function resolveReport(id, body, admin) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REPORT.INVALID_ID);

  const { status } = body ?? {};
  const resolution = typeof body?.resolution === "string" ? body.resolution.trim() : "";

  if (status !== REPORT_STATUS.RESOLVED) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REPORT.STATUS_INVALID);
  if (resolution.length < MIN_NOTE_LENGTH) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REPORT.RESOLUTION_REQUIRED);

  const report = await Report.resolveIfOpen(id, resolution, admin._id);
  if (report) return report;

  // Nothing was updated: either the report doesn't exist, or someone already resolved it.
  const exists = await Report.exists({ _id: id });
  throw exists
    ? new AppError(STATUS.CONFLICT, MESSAGES.REPORT.ALREADY_RESOLVED)
    : new AppError(STATUS.NOT_FOUND, MESSAGES.REPORT.NOT_FOUND);
}

// ----- Dashboard overview -----
const DAY_MS = 24 * 60 * 60 * 1000;
const BD_OFFSET_MS = 6 * 60 * 60 * 1000; // Bangladesh is UTC+6 with no daylight saving

// The calendar day in Bangladesh, like "2026-10-26". Returns null when the date is missing or broken.
function dayKey(date) {
  if (date === undefined || date === null) return null;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return null;
  return new Date(time + BD_OFFSET_MS).toISOString().slice(0, 10);
}

const scanDate = (scan) => scan.createdAt ?? scan.date;
const scanWeight = (scan) => Number(scan.weight) || 0;
const scanShares = (scan) => Object.entries(scan.composition ?? {});

export async function buildOverview() {
  const [scans, listings, rates, pendingApprovals] = await Promise.all([
    scansCollection().find({}).toArray(),
    listingsCollection().find({}).toArray(),
    PriceRate.listAll(),
    User.countPending(),
  ]);

  // Numbers for the stat cards
  const completed = listings.filter((listing) => listing.status === "completed").length;
  const settled = listings.filter((listing) => listing.status === "completed" || listing.status === "cancelled").length;
  const totalKg = scans.reduce((sum, scan) => sum + scanWeight(scan), 0);
  const stats = {
    totalScans: scans.length,
    totalKg: Math.round(totalKg * 10) / 10,
    liveListings: listings.filter((listing) => listing.status === "available").length,
    totalListings: listings.length,
    completedListings: completed,
    settledListings: settled,
    completionRate: settled ? Math.round((completed / settled) * 100) : 0,
    pendingApprovals,
  };

  // Scans per day for the last 14 days, oldest first
  const scansPerDay = {};
  scans.forEach((scan) => {
    const day = dayKey(scanDate(scan));
    if (day) scansPerDay[day] = (scansPerDay[day] || 0) + 1;
  });
  const scanVolume = [];
  for (let daysBack = 13; daysBack >= 0; daysBack -= 1) {
    const day = dayKey(Date.now() - daysBack * DAY_MS);
    scanVolume.push({ date: day, count: scansPerDay[day] || 0 });
  }

  // Kilograms graded per plastic category
  const kgByCategory = {};
  scans.forEach((scan) => {
    scanShares(scan).forEach(([category, percent]) => {
      kgByCategory[category] = (kgByCategory[category] || 0) + (scanWeight(scan) * Number(percent)) / 100;
    });
  });
  const nameOf = (category) => rates.find((rate) => rate.category === category)?.name ?? category;
  const categoryMix = Object.entries(kgByCategory)
    .filter(([, kg]) => kg > 0)
    .map(([category, kg]) => ({ category, name: nameOf(category), kg: Math.round(kg) }))
    .sort((a, b) => b.kg - a.kg);

  // Average estimated price per kg, by scan day (uses today's rates, like the price estimate does)
  const pricesByDay = {};
  scans.forEach((scan) => {
    const day = dayKey(scanDate(scan));
    if (!day || scanWeight(scan) <= 0) return;
    const perKg = scanShares(scan).reduce((sum, [category, percent]) => {
      const rate = rates.find((item) => item.category === category);
      return sum + (Number(percent) / 100) * (rate?.[scan.condition] ?? 0);
    }, 0);
    pricesByDay[day] = [...(pricesByDay[day] || []), perKg];
  });
  const priceTrend = Object.keys(pricesByDay)
    .sort()
    .map((day) => ({ date: day, perKg: Math.round(pricesByDay[day].reduce((a, b) => a + b, 0) / pricesByDay[day].length) }));

  // Scans the AI was unsure about, or that an operator corrected (newest first, at most 100)
  const flagged = scans
    .filter((scan) => scan.confidence < LOW_CONFIDENCE || scan.corrected)
    .sort((a, b) => new Date(scanDate(b)) - new Date(scanDate(a)))
    .slice(0, 100);
  const operators = await User.findBriefByIds(validIds(flagged.map((scan) => scan.operator)));
  const operatorById = new Map(operators.map((user) => [String(user._id), user]));
  const flaggedScans = flagged.map((scan) => ({
    id: String(scan._id),
    code: scan.code,
    date: scanDate(scan),
    operator: operatorById.has(String(scan.operator)) ? operatorById.get(String(scan.operator)).toJSON() : null,
    confidence: scan.confidence,
    quality: scan.quality,
    corrected: Boolean(scan.corrected),
    condition: scan.condition,
    composition: scan.composition ?? {},
    aiResult: scan.aiResult ?? null,
  }));

  return { stats, scanVolume, categoryMix, priceTrend, flaggedScans };
}

// ======================= OPERATOR (Jbh) =======================




// ======================= RECYCLER (Nou) =======================