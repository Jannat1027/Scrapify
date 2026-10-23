import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";

export async function createReport(operatorId, listingId, reason) {
  const listing = await Listing.findOne({ id: listingId });
  if (!listing) throw new HttpError(404, `No listing called ${listingId}.`);
  if (listing.operatorId !== operatorId) {
    throw new HttpError(403, "You can only report listings you are trading on.");
  }

  return Report.create({
    id: makeId("RP"),
    listingId: listing.id,
    by: operatorId,
    reason,
    status: "open",
    date: new Date(),
  });
}
