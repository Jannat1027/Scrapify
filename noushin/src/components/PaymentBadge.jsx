import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "../services/marketplace.js";
import { BADGE_TONES } from "./badgeTones.js";

export default function PaymentBadge({ status }) {
  return <span className={`badge ${BADGE_TONES[PAYMENT_STATUS_TONES[status] || "blue"]}`}>{PAYMENT_STATUS_LABELS[status] || status}</span>;
}
