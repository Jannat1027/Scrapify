import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

const HOST = () => (env.sslcommerz.live ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");

export function onlinePaymentsEnabled() {
  return Boolean(env.sslcommerz.storeId && env.sslcommerz.storePassword);
}

export async function startSession({ payment, listing, payer, phone }) {
  const callback = (kind) => `${env.serverUrl}/api/payments/sslcommerz/${kind}`;
  const form = new URLSearchParams({
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: payment.amount.toFixed(2),
    currency: "BDT",
    tran_id: payment.id,
    success_url: callback("success"),
    fail_url: callback("fail"),
    cancel_url: callback("cancel"),
    ipn_url: callback("ipn"),
    cus_name: payer.name,
    cus_email: payer.email,
    cus_add1: payer.location,
    cus_city: payer.location.split(",").pop().trim(),
    cus_country: "Bangladesh",
    cus_phone: phone,
    shipping_method: "NO",
    product_name: `Plastic batch ${listing.id} (${listing.weight} kg)`,
    product_category: "Recyclable plastic",
    product_profile: "general",
    value_a: listing.id,
  });

  let answer;
  try {
    const response = await fetch(`${HOST()}/gwprocess/v4/api.php`, { method: "POST", body: form });
    answer = await response.json();
  } catch {
    throw new HttpError(502, "The payment gateway could not be reached. Try again in a moment.");
  }
  if (answer.status !== "SUCCESS" || !answer.GatewayPageURL) {
    throw new HttpError(502, `The payment gateway refused the payment: ${answer.failedreason || "unknown reason"}.`);
  }
  return { url: answer.GatewayPageURL, sessionKey: answer.sessionkey };
}

export async function validatePayment(valId) {
  if (!valId) return null;
  const query = new URLSearchParams({
    val_id: valId,
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    format: "json",
  });
  try {
    const response = await fetch(`${HOST()}/validator/api/validationserverAPI.php?${query}`);
    const record = await response.json();
    return ["VALID", "VALIDATED"].includes(record.status) ? record : null;
  } catch {
    return null;
  }
}
