// A short unique-enough ID such as "LS-K3F9A2", built from the current time plus two random characters.
// Same format as makeId() in the frontend, so new rows look like the seeded ones.
export function makeId(prefix) {
  const timePart = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).slice(2, 4);
  return `${prefix}-${timePart}${randomPart}`.toUpperCase();
}

// "Clear PET" -> "clear-pet". Used as the id of a new category.
export function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
