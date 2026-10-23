import * as scanService from "../services/scanService.js";
import { HttpError } from "../utils/httpError.js";

export async function grade(req, res) {
  if (!req.file) throw new HttpError(400, "Attach a photo in the \"photo\" field.");
  res.json({ grading: await scanService.gradeAndKeep(req.user.id, req.file) });
}

export async function createScan(req, res) {
  const scan = await scanService.createScan(req.user, req.body);
  res.status(201).json({ scan });
}

export async function listMyScans(req, res) {
  res.json({ scans: await scanService.listMyScans(req.user.id) });
}

export async function getScan(req, res) {
  res.json({ scan: await scanService.getScan(req.user.id, req.params.id) });
}
