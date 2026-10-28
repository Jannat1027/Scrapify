import { randomBytes } from "node:crypto";

// A short unique ID such as "LS-K3F9A2C1": the prefix plus 8 random characters.
// Same look as the ids in the frontend, but random, so two requests in the same millisecond never clash.
export function makeId(prefix) {
  const randomPart = randomBytes(5).toString("hex").slice(0, 8);
  return `${prefix}-${randomPart}`.toUpperCase();
}

// "Clear PET" -> "clear-pet". Used as the id of a new category.
export function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
