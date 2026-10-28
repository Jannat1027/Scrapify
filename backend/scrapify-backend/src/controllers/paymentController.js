import Listing from "../models/Listing.js";
import Payment from "../models/Payment.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";

const merchantNumbers = { bkash: env.bkashMerchantNumber, nagad: env.nagadMerchantNumber };

export async function createPayment(req, res) {
  const listing = await Listing.findOne({ id: req.body.listingId, operatorId: req.user.id });
  if (!listing) throw new HttpError(404, "That listing was not found in your account.");
  if (listing.status !== "claimed" || !listing.recyclerId) {
    throw new HttpError(409, "A payment can only be created for a claimed listing.");
  }

  const recipientNumber = merchantNumbers[req.body.method];
  if (!recipientNumber) {
    throw new HttpError(503, `Configure the ${req.body.method.toUpperCase()}_MERCHANT_NUMBER on the server before accepting payments.`);
  }

  const payment = await Payment.create({
    id: makeId("PM"),
    listingId: listing.id,
    operatorId: listing.operatorId,
    recyclerId: listing.recyclerId,
    method: req.body.method,
    amount: listing.price,
    phoneNumber: req.body.phoneNumber,
    recipientNumber,
  });
  res.status(201).json({ payment });
}

export async function listPayments(req, res) {
  const payments = await Payment.find({ operatorId: req.user.id }).sort({ createdAt: -1 });
  res.json({ payments });
}

export async function verifyPayment(req, res) {
  const payment = await Payment.findOneAndUpdate(
    { id: req.params.id, operatorId: req.user.id, status: "pending" },
    { $set: { transactionId: req.body.transactionId, status: "paid", verifiedAt: new Date() } },
    { returnDocument: "after", runValidators: true },
  );
  if (payment) return res.json({ payment });

  const existing = await Payment.findOne({ id: req.params.id });
  if (!existing) throw new HttpError(404, "Payment not found.");
  if (existing.operatorId !== req.user.id) throw new HttpError(403, "You can only confirm payments for your listings.");
  throw new HttpError(409, "This payment has already been confirmed.");
}

export async function completePayment(req, res) {
  const payment = await Payment.findOneAndUpdate(
    { id: req.params.id, operatorId: req.user.id, status: "paid" },
    { $set: { status: "completed", completedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (payment) return res.json({ payment });

  const existing = await Payment.findOne({ id: req.params.id });
  if (!existing) throw new HttpError(404, "Payment not found.");
  if (existing.operatorId !== req.user.id) throw new HttpError(403, "You can only complete payments for your listings.");
  throw new HttpError(409, "Only a confirmed payment can be completed.");
}