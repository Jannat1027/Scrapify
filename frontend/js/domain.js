// Business rules: pricing, grading, listing lifecycle.
S.cat = (id) => S.db.find("categories", id) || { id, name: id, icon: "circle" };
S.cond = (id) => S.db.find("conditions", id)?.name || id;
S.user = (id) => S.db.find("users", id) || { name: "Unknown", org: "-" };

S.HOME = {
  operator: "operator/dashboard.html",
  recycler: "recycler/browse-listings.html",
  admin: "admin/dashboard.html",
};
S.STALE_DAYS = 14;
S.LOW_CONFIDENCE = 0.7;

S.STATUS_TONE = {
  available: "green", approved: "green", resolved: "green",
  claimed: "blue", completed: "violet",
  pending: "amber", open: "amber", flagged: "amber",
  cancelled: "red", suspended: "red",
};

// Price = sum over categories of (share x weight x admin rate). The range widens as confidence drops.
S.price = ({ composition, condition, weight, confidence = 1 }) => {
  const lines = Object.entries(composition).map(([id, percent]) => {
    const rate = S.db.find("rates", id)[condition];
    const kg = (weight * percent) / 100;
    return { id, percent, kg, rate, amount: kg * rate };
  });
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const spread = 0.05 + (1 - confidence) * 0.25;
  return { lines, total, low: total * (1 - spread), high: total * (1 + spread) };
};

// The plastic type with the biggest share of a batch.
S.mainCategory = (composition) => Object.entries(composition).sort((a, b) => b[1] - a[1])[0][0];

// Simulated AI grading: returns the composition, condition, photo quality and confidence for a photo.
S.grade = (file) =>
  new Promise((resolve) => {
    const seed = file.size % 100;
    const pet = 40 + (seed % 40);
    const hdpe = Math.min(100 - pet, 15 + (seed % 20));
    const composition = { pet, hdpe, film: 100 - pet - hdpe };
    if (!composition.film) delete composition.film;

    setTimeout(() => resolve({
      composition,
      condition: seed > 60 ? "light" : "clean",
      quality: seed < 15 ? "blurry" : "good",
      confidence: seed < 15 ? 0.55 : 0.78 + (seed % 20) / 100,
    }), 1600);
  });

// Listing lifecycle: available -> claimed -> completed | cancelled.
// A batch can only move from available to claimed once, so two recyclers can never both win it.
S.claim = (id, recyclerId) => {
  const listing = S.db.find("listings", id);
  if (listing.status !== "available") throw new Error("Someone else claimed this batch first.");
  return S.db.update("listings", id, { status: "claimed", recyclerId, claimedAt: new Date().toISOString() });
};

// Saves a graded batch for the signed-in operator and puts it on the market at a fixed price.
S.listBatch = (scan, weight, price) => {
  const { id: operatorId, location } = S.session.get();
  const { image, ...grading } = scan;
  const saved = S.db.insert("scans", { ...grading, id: S.uid("SC"), operatorId, location, weight });
  return S.db.insert("listings", {
    id: S.uid("LS"), scanId: saved.id, operatorId, location, weight, price,
    category: S.mainCategory(scan.composition),
    condition: scan.condition,
    status: "available",
    created: new Date().toISOString(),
  });
};

S.staleRates = () => S.db.where("rates", (rate) => S.daysSince(rate.updated) > S.STALE_DAYS);
