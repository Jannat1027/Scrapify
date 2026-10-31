const BASE = { SC: 1000, LS: 2200, RP: 20, U: 0 };

async function nextId(model, prefix) {
  const count = await model.estimatedDocumentCount();
  return `${prefix}-${BASE[prefix] + count + 1}`;
}

module.exports = { nextId, BASE };
