import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ROLES, USER_STATUS, STALE_RATE_DAYS, REPORT_STATUS } from "./utils.js";

// ======================= USER (shared) =======================
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    org: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.PENDING },
    statusNote: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

userSchema.methods.loginBlockReason = function () {
  if (this.status === USER_STATUS.PENDING) return USER_STATUS.PENDING;
  if (this.status === USER_STATUS.SUSPENDED) return USER_STATUS.SUSPENDED;
  return null;
};

userSchema.methods.changeStatus = function (status, note) {
  this.status = status;
  this.statusNote = status === USER_STATUS.APPROVED ? "" : note;
  return this.save();
};

userSchema.statics.emailExists = function (email) {
  return this.exists({ email: String(email).toLowerCase().trim() });
};

userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
};

userSchema.statics.listManaged = function ({ role, status } = {}) {
  const filter = { role: role || { $ne: ROLES.ADMIN } };
  if (status) filter.status = status;
  return this.find(filter).sort({ createdAt: -1 });
};

userSchema.statics.countPending = function () {
  return this.countDocuments({ status: USER_STATUS.PENDING });
};

userSchema.statics.findBriefByIds = function (ids) {
  return this.find({ _id: { $in: ids } }).select("name org role status");
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.joined = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);

// ======================= ADMIN (Umama): add PriceRate, Report models here =======================

// Scans and listings belong to Jbh and Nou. Here we only READ them, straight from their collections,
// so this file does not need their models.
export const scansCollection = () => mongoose.connection.collection("scans");
export const listingsCollection = () => mongoose.connection.collection("listings");

// ----- PriceRate: one document per plastic category, holding its three prices per kg -----
const rateSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. "pet"
  name: { type: String, required: true, trim: true }, //                                    e.g. "Clear PET"
  note: { type: String, default: "" },
  clean: { type: Number, required: true, min: 0 },
  light: { type: Number, required: true, min: 0 },
  heavy: { type: Number, required: true, min: 0 },
  source: { type: String, required: true, trim: true },
  updated: { type: Date, default: Date.now },
});

rateSchema.methods.isStale = function () {
  const days = (Date.now() - this.updated.getTime()) / (1000 * 60 * 60 * 24);
  return days > STALE_RATE_DAYS;
};

// Saving always refreshes "updated", even when the numbers stay the same (this clears the stale warning).
rateSchema.methods.applyChanges = function (changes) {
  Object.assign(this, changes);
  this.updated = new Date();
  return this.save();
};

// How many scans and listings use this category. A category in use can't be deleted.
rateSchema.methods.countUsage = async function () {
  const scans = await scansCollection().countDocuments({ [`composition.${this.category}`]: { $gt: 0 } });
  const listings = await listingsCollection().countDocuments({ category: this.category });
  return scans + listings;
};

rateSchema.statics.listAll = function () {
  return this.find().sort({ _id: 1 });
};

rateSchema.statics.findByCategory = function (category) {
  return this.findOne({ category: String(category).toLowerCase().trim() });
};

// "Hard HDPE" -> "hard-hdpe"
rateSchema.statics.keyFromName = function (name) {
  return String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};

rateSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret.category;
    ret.stale = doc.isStale();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PriceRate = mongoose.model("PriceRate", rateSchema);

// ----- Location: a collection area shown in sign-up, listings and recycler filters -----
const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true, lowercase: true, trim: true }, // lowercase name, so "mirpur" and "Mirpur" clash
});

locationSchema.statics.keyFromName = function (name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, " ");
};

locationSchema.statics.listAll = function () {
  return this.find().sort({ _id: 1 });
};

locationSchema.statics.existsByName = function (name) {
  return this.exists({ key: this.keyFromName(name) });
};

locationSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.key;
    return ret;
  },
});

export const Location = mongoose.model("Location", locationSchema);

// ----- Report: a problem raised by an operator or recycler about a listing -----
const reportSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, sparse: true }, // e.g. "RP-31"
    listingCode: { type: String, required: true, trim: true }, // e.g. "LS-2196"
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.OPEN },
    resolution: { type: String, default: "" },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

reportSchema.statics.listFiltered = function ({ status } = {}) {
  const filter = status ? { status } : {};
  return this.find(filter).sort({ createdAt: -1 }).populate("reporter", "name org location");
};

// Resolves the report only if it is still open, in ONE database step.
// Two admins clicking at the same moment can never both succeed. Returns null if nothing matched.
reportSchema.statics.resolveIfOpen = function (id, resolution, adminId) {
  return this.findOneAndUpdate(
    { _id: id, status: REPORT_STATUS.OPEN },
    { status: REPORT_STATUS.RESOLVED, resolution, resolvedAt: new Date(), resolvedBy: adminId },
    { returnDocument: "after" }
  );
};

reportSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.date = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Report = mongoose.model("Report", reportSchema);

// ======================= OPERATOR (Jbh): add models here =======================




// ======================= RECYCLER (Nou): add models here =======================