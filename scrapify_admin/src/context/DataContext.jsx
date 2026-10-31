import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api, { apiErrorMessage } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const DataContext = createContext(null);

const EMPTY_STATS = {
  totals: { scans: 0, kgGraded: 0, liveListings: 0, listingsAllTime: 0, completed: 0, settled: 0, completionRate: 0, pendingUsers: 0, openReports: 0 },
  scanVolume: [],
  categoryMix: [],
  priceTrend: [],
  pendingUsers: [],
  lowConfidenceScans: [],
};
const EMPTY_DATA = { users: [], categories: [], rates: [], conditions: [], locations: [], reports: [], stats: EMPTY_STATS };

async function loadAdminData() {
  const [users, categories, conditions, locations, reports, stats] = await Promise.all([
    api.get("/admin/users"),
    api.get("/categories"),
    api.get("/conditions"),
    api.get("/locations"),
    api.get("/admin/reports"),
    api.get("/admin/stats"),
  ]);
  return {
    users: users.data.users,
    categories: categories.data.categories,
    rates: categories.data.categories,
    conditions: conditions.data.conditions,
    locations: locations.data.locations,
    reports: reports.data.reports,
    stats: stats.data,
  };
}

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
      const adminData = user ? await loadAdminData() : {};
      if (thisLoad !== latestLoad.current) return;
      setData({ ...EMPTY_DATA, ...adminData });
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

  async function send(request) {
    try {
      const result = await request();
      await refresh();
      return result;
    } catch (requestError) {
      showToast(apiErrorMessage(requestError), "red");
      return null;
    }
  }

  const value = { data, loading, error, refresh, send };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
