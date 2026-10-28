import { env } from "../config/env.js";
import Listing from "../models/Listing.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { onlinePaymentsEnabled, startSession, validatePayment } from "../utils/sslcommerz.js";

const PAYABLE_STATUSES = ["claimed", "completed"];

async function findPayableListing(listingId, recycler) {
  const listing = await Listing.findOne({ id: listingId, recyclerId: recycler.id });
  if (!listing) throw new HttpError(404, "That batch isn't one of your claims.");
  if (!PAYABLE_STATUSES.includes(listing.status)) throw new HttpError(409, "Only a claimed batch can be paid for.");
  return listing;
}

async function clearAbandonedCheckouts(listingId) {
  await Payment.updateMany(
    { listingId, status: "initiated" },
    { $set: { status: "failed", active: false, note: "Checkout was not finished." } },
  );
}

async function blockIfAlreadyPaying(listingId) {
  const active = await Payment.findOne({ listingId, active: true });
  if (active?.status === "paid") throw new HttpError(409, "This batch is already paid for.");
  if (active) throw new HttpError(409, "A payment for this batch is already waiting for the operator to confirm it.");
}

async function createPayment(fields) {
  try {
    return await Payment.create({ id: makeId("PM"), ...fields });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.transactionId) {
      throw new HttpError(409, "This transaction ID has already been used for another payment.");
    }
    if (error.code === 11000) throw new HttpError(409, "A payment for this batch is already in progress.");
    throw error;
  }
}

export async function listPayments(req, res) {
  const filter = {
    operator: { operatorId: req.user.id, status: { $ne: "failed" } },
    recycler: { recyclerId: req.user.id },
    admin: {},
  }[req.user.role];
  const payments = await Payment.find(filter).sort({ createdAt: -1 });
  res.json({ payments });
}

export async function checkoutOptions(req, res) {
  const listing = await findPayableListing(req.params.listingId, req.user);
  const operator = await User.findOne({ id: listing.operatorId });
  const payment = await Payment.findOne({ listingId: listing.id, active: true });
  res.json({
    listingId: listing.id,
    amount: listing.price,
    operator: { name: operator?.name ?? "", org: operator?.org ?? "" },
    wallets: { bkash: operator?.bkashNumber ?? "", nagad: operator?.nagadNumber ?? "" },
    online: onlinePaymentsEnabled(),
    testMode: !env.sslcommerz.live,
    payment,
  });
}

export async function payManually(req, res) {
  const { listingId, method, senderNumber, transactionId } = req.body;
  const listing = await findPayableListing(listingId, req.user);
  const operator = await User.findOne({ id: listing.operatorId });
  const recipientNumber = method === "bkash" ? operator?.bkashNumber : operator?.nagadNumber;
  if (!recipientNumber) {
    throw new HttpError(409, `This operator hasn't added a ${method === "bkash" ? "bKash" : "Nagad"} number. Pay online, or use their other wallet.`);
  }

  await clearAbandonedCheckouts(listing.id);
  await blockIfAlreadyPaying(listing.id);
  const payment = await createPayment({
    listingId: listing.id,
    operatorId: listing.operatorId,
    recyclerId: req.user.id,
    method,
    amount: listing.price,
    status: "pending",
    senderNumber,
    recipientNumber,
    transactionId,
  });
  res.status(201).json({ payment });
}

export async function payOnline(req, res) {
  if (!onlinePaymentsEnabled()) throw new HttpError(503, "Online payment isn't set up on this server yet. Pay by bKash or Nagad instead.");
  const listing = await findPayableListing(req.body.listingId, req.user);

  await clearAbandonedCheckouts(listing.id);
  await blockIfAlreadyPaying(listing.id);
  const payment = await createPayment({
    listingId: listing.id,
    operatorId: listing.operatorId,
    recyclerId: req.user.id,
    method: "online",
    amount: listing.price,
    status: "initiated",
  });

  try {
    const session = await startSession({ payment, listing, payer: req.user, phone: req.body.phone });
    payment.gateway = { sessionKey: session.sessionKey };
    await payment.save();
    res.status(201).json({ payment, url: session.url });
  } catch (error) {
    await Payment.updateOne({ id: payment.id }, { $set: { status: "failed", active: false, note: error.message } });
    throw error;
  }
}

async function settleOnlinePayment(tranId, valId) {
  const payment = await Payment.findOne({ id: tranId, method: "online" });
  if (!payment) return null;
  if (payment.status === "paid") return payment;

  const record = await validatePayment(valId);
  const genuine =
    record &&
    record.tran_id === payment.id &&
    (record.currency_type || record.currency) === "BDT" &&
    Math.abs(Number(record.currency_amount ?? record.amount) - payment.amount) < 0.01;
  if (!genuine) return null;

  try {
    return await Payment.findOneAndUpdate(
      { id: payment.id, status: { $in: ["initiated", "failed"] } },
      {
        $set: {
          status: "paid",
          active: true,
          paidAt: new Date(),
          note: "",
          gateway: { sessionKey: payment.gateway?.sessionKey, valId, bankTranId: record.bank_tran_id, cardType: record.card_type },
        },
      },
      { returnDocument: "after" },
    );
  } catch (error) {
    if (error.code === 11000) {
      await Payment.updateOne({ id: payment.id }, { $set: { note: `Paid through SSLCommerz (${record.bank_tran_id}) but the batch was already paid. Refund needed.` } });
      return null;
    }
    throw error;
  }
}

function backToClaims(res, outcome, listingId = "") {
  const query = new URLSearchParams({ payment: outcome, ...(listingId && { listing: listingId }) });
  res.redirect(303, `${env.frontendUrl}/recycler/claims?${query}`);
}

export async function gatewaySuccess(req, res) {
  const { tran_id: tranId, val_id: valId, value_a: listingId } = req.body;
  const payment = await settleOnlinePayment(tranId, valId).catch(() => null);
  backToClaims(res, payment ? "success" : "failed", listingId);
}

export function gatewayClosed(outcome) {
  return async (req, res) => {
    const { tran_id: tranId, value_a: listingId, error } = req.body;
    if (tranId) {
      const note = outcome === "cancelled" ? "Cancelled at the checkout." : `Payment failed${error ? `: ${error}` : "."}`;
      await Payment.updateOne({ id: tranId, status: "initiated" }, { $set: { status: "failed", active: false, note } }).catch(() => {});
    }
    backToClaims(res, outcome, listingId);
  };
}

export async function gatewayIpn(req, res) {
  const { tran_id: tranId, val_id: valId, status } = req.body;
  if (status === "VALID" || status === "VALIDATED") await settleOnlinePayment(tranId, valId);
  else if (tranId) await Payment.updateOne({ id: tranId, status: "initiated" }, { $set: { status: "failed", active: false, note: `Gateway status ${status}.` } });
  res.json({ received: true });
}

export async function confirmPayment(req, res) {
  const payment = await Payment.findOneAndUpdate(
    { id: req.params.id, operatorId: req.user.id, status: "pending" },
    { $set: { status: "paid", paidAt: new Date() } },
    { returnDocument: "after" },
  );
  if (payment) return res.json({ payment });
  await explainWhyNot(req.params.id, req.user.id);
}

export async function rejectPayment(req, res) {
  const payment = await Payment.findOneAndUpdate(
    { id: req.params.id, operatorId: req.user.id, status: "pending" },
    { $set: { status: "rejected", active: false, note: req.body.reason || "The operator did not receive this transfer." } },
    { returnDocument: "after" },
  );
  if (payment) return res.json({ payment });
  await explainWhyNot(req.params.id, req.user.id);
}

async function explainWhyNot(paymentId, operatorId) {
  const existing = await Payment.findOne({ id: paymentId });
  if (!existing) throw new HttpError(404, "Payment not found.");
  if (existing.operatorId !== operatorId) throw new HttpError(403, "You can only check payments made to you.");
  throw new HttpError(409, "Only a payment waiting for your confirmation can be confirmed or rejected.");
}
