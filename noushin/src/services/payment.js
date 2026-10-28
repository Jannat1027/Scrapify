import api from "./api.js";

export async function getCheckoutOptions(listingId) {
  const response = await api.get(`/payments/checkout/${listingId}`);
  return response.data;
}

export async function startOnlinePayment(listingId, phone) {
  const response = await api.post("/payments/online", { listingId, phone });
  return response.data.url;
}

export async function reportManualPayment({ listingId, method, senderNumber, transactionId }) {
  const response = await api.post("/payments/manual", { listingId, method, senderNumber, transactionId });
  return response.data.payment;
}
