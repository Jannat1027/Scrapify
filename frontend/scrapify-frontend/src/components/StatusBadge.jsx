import { STATUS_LABELS, STATUS_TONES } from "../services/marketplace.js";
import { BADGE_TONES } from "./badgeTones.js";

export default function StatusBadge({ status }) {
  const tone = STATUS_TONES[status] || "blue";
  return <span className={`badge ${BADGE_TONES[tone]}`}>{STATUS_LABELS[status] || status}</span>;
}
