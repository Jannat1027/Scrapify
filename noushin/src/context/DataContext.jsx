// ---------------------------------------------------------------------------
// DataContext: the recycler's data, loaded from the Scrapify backend.
// It keeps the shape the pages have always used:
//   data = { users, categories, rates, conditions, locations, scans, listings, payments }
// For a recycler, `listings` holds every batch on the market plus the batches they claimed.
//
// Pages call insertRow / updateRow / claimListing. Each one becomes the matching API request,
// then the data is loaded again, so every page shows what the server now holds.
// A failed request shows the server's message in a red toast and returns null.
// ---------------------------------------------------------------------------
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api, { apiErrorMessage } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const DataContext = createContext(null);

const EMPTY_DATA = { users: [], categories: [], rates: [], conditions: [], locations: [], scans: [], listings: [], payments: [] };

// The people named on listings (each listing carries its operator and recycler), so findUser() can show who sells a batch.
function peopleOnListings(listings, currentUser) {
  const people = new Map([[currentUser.id, currentUser]]);
  listings.forEach((listing) => {
    [listing.operator, listing.recycler].forEach((person) => {
      if (person?.id && !people.has(person.id)) people.set(person.id, person);
    });
  });
  return [...people.values()];
}

// Everything the recycler pages show.
async function loadRecyclerData(user) {
  const [categories, conditions, locations, browse, claims, payments] = await Promise.all([
    api.get("/categories"),
    api.get("/conditions"),
    api.get("/locations"),
    api.get("/listings"),
    api.get("/listings/claims"),
    api.get("/payments"),
  ]);
  // The market (available batches) and this recycler's own claims, without doubles.
  const listings = [...claims.data.listings];
  browse.data.listings.forEach((listing) => {
    if (!listings.some((item) => item.id === listing.id)) listings.push(listing);
  });
  return {
    categories: categories.data.categories,
    rates: categories.data.categories,
    conditions: conditions.data.conditions,
    locations: locations.data.locations,
    scans: [],
    listings,
    payments: payments.data.payments,
    users: peopleOnListings(listings, user),
  };
}

// insertRow(tableName, row) -> the request it sends. The server sets ids, owners and dates itself.
const INSERT = {
  reports: (row) => api.post("/reports", { listingId: row.listingId, reason: row.reason }).then((response) => response.data.report),
};

// updateRow(tableName, id, changes) -> the request it sends. A recycler completes, cancels or rates a claim.
const UPDATE = {
  listings(id, changes) {
    if (changes.status === "completed") return api.patch(`/listings/${id}/complete`);
    if (changes.status === "cancelled") return api.patch(`/listings/${id}/cancel`, { reason: changes.cancelReason });
    if (changes.rating) return api.patch(`/listings/${id}/rate`, { rating: changes.rating });
    throw new Error(`No API call changes a listing with ${JSON.stringify(changes)}.`);
  },
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const showToast = useToast();
  const [data, setData] = useState(EMPTY_DATA);
  // Whose data is in `data`: a user id, null when logged out, undefined before the first load.
  const [loadedFor, setLoadedFor] = useState(undefined);
  const [error, setError] = useState(null); // the message when loading failed
  // Numbers each load, so an older load that finishes late can't overwrite a newer one.
  const latestLoad = useRef(0);

  const refresh = useCallback(async () => {
    const thisLoad = ++latestLoad.current;
    try {
      const recyclerData = user ? await loadRecyclerData(user) : {};
      if (thisLoad !== latestLoad.current) return;
      setData({ ...EMPTY_DATA, ...recyclerData });
      setLoadedFor(user ? user.id : null);
      setError(null);
    } catch (loadError) {
      if (thisLoad === latestLoad.current) setError(apiErrorMessage(loadError));
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loading = loadedFor !== (user ? user.id : null);

  // Sends one change, then reloads. Returns the response, or null after showing why it failed.
  async function change(request) {
    try {
      const result = await request();
      await refresh();
      return result;
    } catch (requestError) {
      showToast(apiErrorMessage(requestError), "red");
      // The batch may have changed under us (someone else claimed it), so show the truth.
      refresh();
      return null;
    }
  }

  const insertRow = (tableName, newRow) => change(() => INSERT[tableName](newRow));
  const updateRow = (tableName, rowId, changes) => change(() => UPDATE[tableName](rowId, changes));
  // Claims a listing for the logged-in recycler. Returns the claimed listing, or null if someone else was first.
  const claimListing = (listingId) => change(() => api.patch(`/listings/${listingId}/claim`).then((response) => response.data.listing));

  const value = { data, loading, error, refresh, send: change, insertRow, updateRow, claimListing };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
