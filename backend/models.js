import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ROLES, USER_STATUS } from "./utils.js";

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



// ======================= OPERATOR (Jbh): add models here =======================




// ======================= RECYCLER (Nou): add models here =======================