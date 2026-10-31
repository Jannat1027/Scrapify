const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { nextId } = require("../utils/id");

const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["operator", "recycler", "admin"], required: true },
    org: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "suspended"], default: "pending" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isNew && !this.id) this.id = await nextId(User, "U");
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
