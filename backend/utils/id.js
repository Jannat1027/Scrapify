// utils/id.js: generates ids in the same style the frontend already uses (SC-1042, LS-2210, RP-31).
// DRY: one function for every model instead of repeating the counter logic everywhere.
const BASE = { SC: 1000, LS: 2200, RP: 20, U: 0 };

async function nextId(model, prefix) {
  const count = await model.estimatedDocumentCount();
  return `${prefix}-${BASE[prefix] + count + 1}`;
}

module.exports = { nextId, BASE };
