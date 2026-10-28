// Small helpers for showing numbers and dates the same way on every page.

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 2300 -> "৳2,300" (Indian/Bangladeshi digit grouping, no decimals).
export function formatTaka(amount) {
  return `৳${Math.round(amount).toLocaleString("en-IN")}`;
}

// A price estimate as a range, e.g. "৳2,294 – ৳2,653".
export function formatPriceRange({ low, high }) {
  return `${formatTaka(low)} – ${formatTaka(high)}`;
}

// ISO date -> "15 Oct 2026".
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ISO date -> "15 Oct" (for chart labels).
export function formatShortDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Whole days between a date and now.
export function daysSince(isoDate) {
  return Math.floor((Date.now() - new Date(isoDate)) / ONE_DAY_MS);
}

// A short unique-enough ID such as "LS-K3F9A2", built from the current time plus two random characters.
export function makeId(prefix) {
  const timePart = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).slice(2, 4);
  return `${prefix}-${timePart}${randomPart}`.toUpperCase();
}

export function nowIso() {
  return new Date().toISOString();
}

// "Rahima Begum" -> "RB"
export function initialsOf(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
}
