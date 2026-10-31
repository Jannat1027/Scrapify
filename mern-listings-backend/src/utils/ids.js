import { randomBytes } from "node:crypto";

export function makeId(prefix) {
  const randomPart = randomBytes(5).toString("hex").slice(0, 8);
  return `${prefix}-${randomPart}`.toUpperCase();
}

export function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
