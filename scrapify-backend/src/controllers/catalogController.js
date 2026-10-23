import * as catalogService from "../services/catalogService.js";

export async function listCategories(req, res) {
  res.json({ categories: await catalogService.listCategories() });
}

export function listConditions(req, res) {
  res.json({ conditions: catalogService.listConditions() });
}
