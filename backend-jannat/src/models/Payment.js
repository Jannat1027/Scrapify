import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

export const PAYMENT_STATUSES = ["pending", "paid", "completed"];

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  listingId: { type: String, required: true, unique: true },
  operatorId: { type: String, required: true, index: true },
  recyclerId: { type: String, required: true, index: true },
  method: { type: String, enum: ["bkash", "nagad"], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  phoneNumber: { type: String, required: true },
  recipientNumber: { type: String, required: true },
  transactionId: { type: String, trim: true, unique: true, sparse: true },
  status: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
  createdAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  completedAt: { type: Date },
});

paymentSchema.plugin(toJSONPlugin);

export default mongoose.model("Payment", paymentSchema);