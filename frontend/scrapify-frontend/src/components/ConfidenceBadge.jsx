import { confidenceTone } from "../services/pricing.js";
import { BADGE_TONES } from "./badgeTones.js";

export default function ConfidenceBadge({ confidence }) {
  const percent = Math.round(confidence * 100);
  return <span className={`badge ${BADGE_TONES[confidenceTone(confidence)]}`}>{`${percent}% sure`}</span>;
}
