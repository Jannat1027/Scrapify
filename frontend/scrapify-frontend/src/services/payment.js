import api from "./api.js";

export async function createPayment({ listingId, method, phoneNumber }) {
  const res = await api.post("/payments", { listingId, method, phoneNumber });
  return res.data.payment;
}

export async function getPayments() {
  const res = await api.get("/payments");
  return res.data.payments;
}

export async function verifyPayment(id, transactionId) {
  const res = await api.patch(`/payments/${id}/verify`, { transactionId });
  return res.data.payment;
}

export async function completePayment(id) {
  const res = await api.patch(`/payments/${id}/complete`);
  return res.data.payment;
}
