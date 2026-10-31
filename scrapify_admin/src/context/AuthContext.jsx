import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ENABLED_ROLES, ROLE_LABELS } from "../services/marketplace.js";
import api, { apiErrorMessage, clearToken, getToken, saveToken } from "../services/api.js";

const AuthContext = createContext(null);

const WRONG_APP = `This app is only for ${ENABLED_ROLES.map((role) => ROLE_LABELS[role].toLowerCase()).join(" and ")} accounts. Other account types use their own app.`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(getToken()));
  const [sessionError, setSessionError] = useState(null);

  const restoreSession = useCallback(async () => {
    if (!getToken()) return;
    setChecking(true);
    setSessionError(null);
    try {
      const response = await api.get("/auth/me");
      if (!ENABLED_ROLES.includes(response.data.user.role)) {
        clearToken();
        setSessionError(WRONG_APP);
      } else {
        setUser(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) clearToken();
      else setSessionError(apiErrorMessage(error));
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  async function logIn(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (!ENABLED_ROLES.includes(response.data.user.role)) throw new Error(WRONG_APP);
    saveToken(response.data.token);
    setSessionError(null);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(details) {
    const response = await api.post("/auth/register", details);
    return response.data.user;
  }

  function logOut() {
    clearToken();
    setUser(null);
    setSessionError(null);
  }

  const value = { user, checking, sessionError, restoreSession, logIn, register, logOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
