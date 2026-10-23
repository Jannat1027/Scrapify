import * as listingService from "../services/listingService.js";

export async function createListing(req, res) {
  const listing = await listingService.createListing(req.user.id, req.body.scanId, req.body.price);
  res.status(201).json({ listing });
}

export async function listMyListings(req, res) {
  res.json({ listings: await listingService.listMyListings(req.user.id) });
}

export async function cancelListing(req, res) {
  const listing = await listingService.cancelListing(req.user.id, req.params.id, req.body.reason);
  res.json({ listing });
}
