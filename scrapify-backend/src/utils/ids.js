export function makeId(prefix) {
  const timePart = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).slice(2, 4);
  return `${prefix}-${timePart}${randomPart}`.toUpperCase();
}
