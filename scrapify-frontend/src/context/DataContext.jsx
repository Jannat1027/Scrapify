// ---------------------------------------------------------------------------
// DataContext: the demo "database".
// It holds every table (scans, listings, rates, ...) in React state, so when a
// page changes something, every page that shows it re-renders automatically.
// Each change is also saved to localStorage, so a refresh keeps it.
// A real app would replace these functions with calls to a backend API.
// ---------------------------------------------------------------------------
import { createContext, useContext, useEffect, useState } from "react";
import { createSeedData } from "../data/seed.js";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "../services/storage.js";

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

  // If the app is open in two tabs, a change in one tab updates the other.
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

  // Changes some fields of the row with this id, e.g. updateRow("listings", "LS-2210", { status: "cancelled" }).
  function updateRow(tableName, rowId, changes) {
    setData((oldData) => ({
      ...oldData,
      [tableName]: oldData[tableName].map((row) => (row.id === rowId ? { ...row, ...changes } : row)),
    }));
  }

  function resetDemoData() {
    setData(createSeedData());
  }

  const value = { data, insertRow, updateRow, resetDemoData };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Any component can call useData() to read the data and the functions above.
export function useData() {
  return useContext(DataContext);
}
