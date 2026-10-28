import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { HOME_PAGE_FOR_ROLE } from "../services/marketplace.js";
import api, { apiErrorMessage, clearToken, getToken, saveToken } from "../services/api.js";

const AuthContext = createContext(null);

const WRONG_APP = "This app is for shop operators. Recyclers and admins use their own app.";

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
      if (!HOME_PAGE_FOR_ROLE[response.data.user.role]) {
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
    if (!HOME_PAGE_FOR_ROLE[response.data.user.role]) throw new Error(WRONG_APP);
    saveToken(response.data.token);
    setSessionError(null);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(details) {
    const response = await api.post("/auth/register", { ...details, role: "operator" });
    return response.data.user;
  }

  async function resendVerification(email) {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data.message;
  }

  function logOut() {
    clearToken();
    setUser(null);
    setSessionError(null);
  }

  async function saveWallets(wallets) {
    const response = await api.patch("/auth/me/wallets", wallets);
    setUser(response.data.user);
    return response.data.user;
  }

  const value = { user, checking, sessionError, restoreSession, logIn, register, resendVerification, logOut, saveWallets };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
