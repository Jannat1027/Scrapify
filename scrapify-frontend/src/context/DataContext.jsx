// ---------------------------------------------------------------------------
// DataContext: the demo "database".
// It holds every table (users, scans, listings, ...) in React state, so when a
// page changes something, every page that shows it re-renders automatically.
// Each change is also saved to localStorage, so a refresh keeps it.
// A real app would replace these functions with calls to a backend API.
// ---------------------------------------------------------------------------
import { createContext, useContext, useEffect, useState } from "react";
import { createSeedData } from "../data/seed.js";
import { canBeClaimed } from "../services/marketplace.js";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "../services/storage.js";
import { nowIso } from "../utils/format.js";

const DataContext = createContext(null);

function loadSavedData() {
  return loadFromStorage(STORAGE_KEYS.data, null) || createSeedData();
}

export function DataProvider({ children }) {
  // useState(loadSavedData) runs loadSavedData only once, on the first render.
  const [data, setData] = useState(loadSavedData);

  // useEffect runs after React has updated the screen. Here: save whenever data changes.
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.data, data);
  }, [data]);

  // If the app is open in two tabs (say, two recyclers), a change in one tab updates the other.
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === `scrapify.${STORAGE_KEYS.data}`) setData(loadSavedData());
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Adds a row to the top of a table.
  function insertRow(tableName, newRow) {
    setData((oldData) => ({ ...oldData, [tableName]: [newRow, ...oldData[tableName]] }));
  }

  // Changes some fields of the row with this id, e.g. updateRow("users", "u3", { status: "approved" }).
  function updateRow(tableName, rowId, changes) {
    setData((oldData) => ({
      ...oldData,
      [tableName]: oldData[tableName].map((row) => (row.id === rowId ? { ...row, ...changes } : row)),
    }));
  }

  // Removes a row. Works for tables of objects (matched by id) and lists of plain text (like locations).
  function removeRow(tableName, idOrValue) {
    setData((oldData) => ({
      ...oldData,
      [tableName]: oldData[tableName].filter((row) => row !== idOrValue && row.id !== idOrValue),
    }));
  }

  // Claims a listing for a recycler. Returns false if someone else claimed it first.
  // It re-reads the saved data first, so a claim made a moment ago in another tab is seen.
  function claimListing(listingId, recyclerId) {
    const latestData = loadSavedData();
    const latestListing = latestData.listings.find((listing) => listing.id === listingId);
    if (!canBeClaimed(latestListing)) {
      setData(latestData);
      return false;
    }
    updateRow("listings", listingId, { status: "claimed", recyclerId, claimedAt: nowIso() });
    return true;
  }

  function resetDemoData() {
    setData(createSeedData());
  }

  const value = { data, insertRow, updateRow, removeRow, claimListing, resetDemoData };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Any component can call useData() to read the data and the functions above.
export function useData() {
  return useContext(DataContext);
}
