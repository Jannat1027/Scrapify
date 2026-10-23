// ---------------------------------------------------------------------------
// DataContext: the operator's data, loaded from the Scrapify backend.
// It keeps the same shape the pages have always used:
//   data = { users, categories, rates, conditions, scans, listings }
// The logged-in operator gets their own scans and listings.
//
// Pages still call insertRow / updateRow. Each one becomes the matching API
// request (see the tables below), then the data is loaded again, so every
// page shows what the server now holds.
// A failed request shows the server's message in a red toast and returns null,
// so a page can write: if (await updateRow(...)) showToast("Saved.");
// ---------------------------------------------------------------------------
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api, { apiErrorMessage } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const DataContext = createContext(null);

const EMPTY_DATA = { users: [], categories: [], rates: [], conditions: [], scans: [], listings: [] };

// ---------- Loading ----------

// The people named on listings (each listing carries its operator and recycler),
// so findUser() can show who bought a batch.
function peopleOnListings(listings, currentUser) {
  const people = new Map([[currentUser.id, currentUser]]);
  listings.forEach((listing) => {
    [listing.operator, listing.recycler].forEach((person) => {
      if (person?.id && !people.has(person.id)) people.set(person.id, person);
    });
  });
  return [...people.values()];
}

// Everything the operator pages show.
async function loadOperatorData(user) {
  const [categories, conditions, scans, listings] = await Promise.all([
    api.get("/categories"),
    api.get("/conditions"),
    api.get("/scans"),
    api.get("/listings/mine"),
  ]);
  // Each category carries its rates, so the same rows serve as data.categories and data.rates.
  const categoryRows = categories.data.categories;
  return {
    categories: categoryRows,
    rates: categoryRows,
    conditions: conditions.data.conditions,
    scans: scans.data.scans,
    listings: listings.data.listings,
    users: peopleOnListings(listings.data.listings, user),
  };
}

// ---------- Writing ----------

// A scan is saved from its server-side grading: the server fills in the AI's answer, confidence and
// photo itself. The plastic type and condition are only sent when the operator corrected the AI.
function scanRequest(row) {
  const request = { gradingId: row.gradingId, weight: row.weight };
  if (row.corrected) Object.assign(request, { composition: row.composition, condition: row.condition });
  return request;
}

// insertRow(tableName, row) -> the request it sends. The server sets ids, owners and dates itself.
const INSERT = {
  scans: (row) => api.post("/scans", scanRequest(row)).then((response) => response.data.scan),
  listings: (row) => api.post("/listings", { scanId: row.scanId, price: row.price }).then((response) => response.data.listing),
  reports: (row) => api.post("/reports", { listingId: row.listingId, reason: row.reason }).then((response) => response.data.report),
};

// updateRow(tableName, id, changes) -> the request it sends. An operator can only cancel a listing.
const UPDATE = {
  listings(id, changes) {
    if (changes.status === "cancelled") return api.patch(`/listings/${id}/cancel`, { reason: changes.cancelReason });
    throw new Error(`No API call changes a listing with ${JSON.stringify(changes)}.`);
  },
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const showToast = useToast();
  const [data, setData] = useState(EMPTY_DATA);
  // Whose data is in `data`: a user id, null when logged out, undefined before the first load.
  // Until it matches the current user (just after logging in, say), the data is still loading.
  const [loadedFor, setLoadedFor] = useState(undefined);
  const [error, setError] = useState(null); // the message when loading failed
  // Numbers each load, so an older load that finishes late can't overwrite a newer one.
  const latestLoad = useRef(0);

  // Loads everything this user may see. Runs on start, after logging in or out, and after every change.
  const refresh = useCallback(async () => {
    const thisLoad = ++latestLoad.current;
    try {
      const operatorData = user ? await loadOperatorData(user) : {};
      if (thisLoad !== latestLoad.current) return;
      setData({ ...EMPTY_DATA, ...operatorData });
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

  // Sends one change, then reloads. Returns the saved row (for inserts) or the response,
  // or null after showing why it failed.
  async function change(request) {
    try {
      const result = await request();
      await refresh();
      return result;
    } catch (requestError) {
      showToast(apiErrorMessage(requestError), "red");
      return null;
    }
  }

  const insertRow = (tableName, newRow) => change(() => INSERT[tableName](newRow));
  const updateRow = (tableName, rowId, changes) => change(() => UPDATE[tableName](rowId, changes));

  const value = { data, loading, error, refresh, insertRow, updateRow };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Any component can call useData() to read the data and the functions above.
export function useData() {
  return useContext(DataContext);
}
