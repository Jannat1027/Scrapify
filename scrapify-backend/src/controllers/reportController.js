import * as reportService from "../services/reportService.js";

export async function createReport(req, res) {
  const report = await reportService.createReport(req.user.id, req.body.listingId, req.body.reason);
  res.status(201).json({ report });
}
