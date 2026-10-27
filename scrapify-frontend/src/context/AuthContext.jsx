// ---------------------------------------------------------------------------
// AuthContext: who is logged in.
// Logging in sends the email and password to the backend, which checks the
// password and answers with a JWT. The token is kept in localStorage and
// sent with every request (see services/api.js). When the app opens, the
// saved token is checked with /auth/me, so a refresh keeps the user logged in.
// ---------------------------------------------------------------------------
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { HOME_PAGE_FOR_ROLE } from "../services/marketplace.js";
import api, { apiErrorMessage, clearToken, getToken, saveToken } from "../services/api.js";

const AuthContext = createContext(null);

const WRONG_APP = "This app is for shop operators. Recyclers and admins use their own app.";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while a saved token is being checked, so pages don't send the user to /login too early.
  const [checking, setChecking] = useState(() => Boolean(getToken()));
  // Set when the server couldn't be reached to check the token. The token is kept for a retry.
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
      // Only a 401 means the token is bad (expired, or the account was blocked): start logged out.
      // Anything else (server down, no internet) keeps the token, so "Try again" can log back in.
      if (error.response?.status === 401) clearToken();
      else setSessionError(apiErrorMessage(error));
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Returns the user. Throws the Axios error when the backend refuses (401 wrong password, 403 blocked).
  async function logIn(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (!HOME_PAGE_FOR_ROLE[response.data.user.role]) throw new Error(WRONG_APP);
    saveToken(response.data.token);
    setSessionError(null);
    setUser(response.data.user);
    return response.data.user;
  }

  // Creates an account. It starts as "pending": an admin must approve it before it can log in.
  async function register(details) {
    const response = await api.post("/auth/register", { ...details, role: "operator" });
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
