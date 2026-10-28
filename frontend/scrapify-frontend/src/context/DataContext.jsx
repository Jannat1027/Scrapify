import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api, { apiErrorMessage } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const DataContext = createContext(null);

const EMPTY_DATA = { users: [], categories: [], rates: [], conditions: [], scans: [], listings: [] };

function peopleOnListings(listings, currentUser) {
  const people = new Map([[currentUser.id, currentUser]]);
  listings.forEach((listing) => {
    [listing.operator, listing.recycler].forEach((person) => {
      if (person?.id && !people.has(person.id)) people.set(person.id, person);
    });
  });
  return [...people.values()];
}

async function loadOperatorData(user) {
  const [categories, conditions, scans, listings] = await Promise.all([
    api.get("/categories"),
    api.get("/conditions"),
    api.get("/scans"),
    api.get("/listings/mine"),
  ]);
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

function scanRequest(row) {
  const request = { gradingId: row.gradingId, weight: row.weight };
  if (row.corrected) Object.assign(request, { composition: row.composition, condition: row.condition });
  return request;
}

const INSERT = {
  scans: (row) => api.post("/scans", scanRequest(row)).then((response) => response.data.scan),
  listings: (row) => api.post("/listings", { scanId: row.scanId, price: row.price }).then((response) => response.data.listing),
  reports: (row) => api.post("/reports", { listingId: row.listingId, reason: row.reason }).then((response) => response.data.report),
};

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
  const [loadedFor, setLoadedFor] = useState(undefined);
  const [error, setError] = useState(null);
  const latestLoad = useRef(0);

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

export function useData() {
  return useContext(DataContext);
}
