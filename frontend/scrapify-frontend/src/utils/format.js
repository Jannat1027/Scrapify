export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function formatTaka(amount) {
  return `৳${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatPriceRange({ low, high }) {
  return `${formatTaka(low)} – ${formatTaka(high)}`;
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function daysSince(isoDate) {
  return Math.floor((Date.now() - new Date(isoDate)) / ONE_DAY_MS);
}

export function makeId(prefix) {
  const timePart = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).slice(2, 4);
  return `${prefix}-${timePart}${randomPart}`.toUpperCase();
}

export function nowIso() {
  return new Date().toISOString();
}

export function initialsOf(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
}
