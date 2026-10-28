import mongoose from "mongoose";
import { toJSONPlugin } from "./toJSON.js";

export const PAYMENT_METHODS = ["online", "bkash", "nagad"];
export const PAYMENT_STATUSES = ["initiated", "pending", "paid", "failed", "rejected"];
export const ACTIVE_STATUSES = ["initiated", "pending", "paid"];

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  listingId: { type: String, required: true, index: true },
  operatorId: { type: String, required: true, index: true },
  recyclerId: { type: String, required: true, index: true },
  method: { type: String, enum: PAYMENT_METHODS, required: true },
  amount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: PAYMENT_STATUSES, required: true },
  active: { type: Boolean, default: true },
  senderNumber: { type: String, default: "" },
  recipientNumber: { type: String, default: "" },
  transactionId: { type: String, trim: true },
  gateway: {
    sessionKey: String,
    valId: String,
    bankTranId: String,
    cardType: String,
  },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

paymentSchema.index({ listingId: 1 }, { unique: true, partialFilterExpression: { active: true }, name: "one_active_payment_per_listing" });
paymentSchema.index({ method: 1, transactionId: 1 }, { unique: true, partialFilterExpression: { transactionId: { $type: "string" } } });

paymentSchema.plugin(toJSONPlugin, { hide: ["active"] });

export default mongoose.model("Payment", paymentSchema);
