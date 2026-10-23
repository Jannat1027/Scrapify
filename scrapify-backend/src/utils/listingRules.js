export function operatorRating(listings, operatorId) {
  const rated = listings.filter((listing) => listing.operatorId === operatorId && listing.rating);
  if (rated.length === 0) return "New";
  const totalStars = rated.reduce((sum, listing) => sum + listing.rating, 0);
  return (totalStars / rated.length).toFixed(1);
}
