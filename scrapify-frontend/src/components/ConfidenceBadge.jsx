import { confidenceTone } from "../services/pricing.js";
import { BADGE_TONES } from "./badgeTones.js";

// Shows how sure the AI is, e.g. "91% sure", coloured green, amber or red.
export default function ConfidenceBadge({ confidence }) {
  const percent = Math.round(confidence * 100);
  return <span className={`badge ${BADGE_TONES[confidenceTone(confidence)]}`}>{`${percent}% sure`}</span>;
}
