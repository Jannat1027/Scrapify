// Pricing rules. Every price estimate on the platform comes from calculatePrice().
import { daysSince } from "../utils/format.js";

// A scan below this confidence asks the operator to check the result.
export const LOW_CONFIDENCE = 0.7;

// Rates older than this many days get a warning.
export const STALE_RATE_DAYS = 14;

// The plastic type with the biggest share of a batch, e.g. { pet: 60, hdpe: 40 } -> "pet".
export function mainCategoryOf(composition) {
  const sortedByShare = Object.entries(composition).sort((a, b) => b[1] - a[1]);
  return sortedByShare[0][0];
}

// Estimates the value of a batch.
//
//   amount for each plastic type = (share % of weight) x (admin rate for that type and condition)
//   total = sum of those amounts
//
// The low/high range gets wider when the AI is less confident:
//   5% either side at 100% confidence, up to 30% either side at 0% confidence.
export function calculatePrice({ composition, condition, weight, confidence = 1 }, rates) {
  const lines = Object.entries(composition).map(([categoryId, percent]) => {
    const rateRow = rates.find((rate) => rate.id === categoryId);
    const ratePerKg = rateRow ? rateRow[condition] : 0;
    const kg = (weight * percent) / 100;
    return { categoryId, percent, kg, rate: ratePerKg, amount: kg * ratePerKg };
  });

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const spread = 0.05 + (1 - confidence) * 0.25;

  return { lines, total, low: total * (1 - spread), high: total * (1 + spread) };
}

// Rates that have not been updated for more than STALE_RATE_DAYS days.
export function findStaleRates(rates) {
  return rates.filter((rate) => daysSince(rate.updated) > STALE_RATE_DAYS);
}

// Badge colour for an AI confidence value.
export function confidenceTone(confidence) {
  if (confidence >= 0.85) return "green";
  if (confidence >= LOW_CONFIDENCE) return "amber";
  return "red";
}
