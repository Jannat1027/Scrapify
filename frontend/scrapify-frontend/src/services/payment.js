import api from "./api.js";

export async function getPayments() {
  const res = await api.get("/payments");
  return res.data.payments;
}

export const confirmPayment = (paymentId) => api.patch(`/payments/${paymentId}/confirm`);
export const rejectPayment = (paymentId, reason) => api.patch(`/payments/${paymentId}/reject`, { reason });
