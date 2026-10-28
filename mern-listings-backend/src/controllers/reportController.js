
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";


export async function createReport(req, res) {
  const listing = await Listing.findOne({ id: req.body.listingId });
  if (!listing) throw new HttpError(404, `No listing called ${req.body.listingId}.`);
  if (![listing.operatorId, listing.recyclerId].includes(req.user.id)) {
    throw new HttpError(403, "You can only report listings you are trading on.");
  }

  const report = await Report.create({
    id: makeId("RP"),
    listingId: listing.id,
    by: req.user.id,
    reason: req.body.reason,
    status: "open",
    date: new Date(),
  });
  res.status(201).json({ report });
}
